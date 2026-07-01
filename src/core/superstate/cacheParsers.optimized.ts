import _ from "lodash";
import { PathCache } from "shared/types/caches";
import { SpaceProperty, SpaceTable, SpaceTables } from "shared/types/mdb";
import { ContextState, PathState, SpaceState } from "shared/types/PathState";
import { MakeMDSettings } from "shared/types/settings";
import { SpaceInfo } from "shared/types/spaceInfo";
import { orderStringArrayByArray, uniq } from "shared/utils/array";

import { builtinSpaces } from "core/types/space";
import { linkContextRow, mergeContextRows, propertyDependencies, syncContextRow } from "core/utils/contexts/linkContextRow";
import { pathByJoins } from "core/utils/spaces/query";
import { ensureArray, initiateString, tagSpacePathFromTag } from "core/utils/strings";
import { builtinSpacePathPrefix, tagsSpacePath } from "shared/schemas/builtin";
import { defaultContextDBSchema, defaultContextSchemaID } from "shared/schemas/context";
import { defaultContextFields } from "shared/schemas/fields";
import { PathPropertyName } from "shared/types/context";
import { IndexMap } from "shared/types/indexMap";
import { excludePathPredicate } from "utils/hide";
import { parseLinkString, parseMultiString } from "utils/parsers";
import { pathToString } from "utils/path";
import { globalTagMemoizer } from "utils/tag-memoization";
import { globalSpaceEvaluationIndex } from "utils/space-evaluation-index";

/**
 * Optimized combined filter and map operation to avoid double iteration
 * @param array - Input array
 * @param transform - Transform function that returns null for filtered items
 * @returns Transformed array with filtered items removed
 */
export function optimizeFilterMap<T, R>(array: T[], transform: (item: T) => R | null): R[] {
  const result: R[] = [];
  for (let i = 0; i < array.length; i++) {
    const transformed = transform(array[i]);
    if (transformed !== null) {
      result.push(transformed);
    }
  }
  return result;
}

/**
 * Memoized tag hierarchy resolution to prevent O(n²) complexity
 */
function getTagsFromCacheOptimized(
  map: Map<string, SpaceState>,
  spaces: string[],
  seen = new Set<string>()
): string[] {
  const keys: string[] = [];
  
  for (const space of spaces) {
    const contextsArray = map.get(space)?.contexts as string[] ?? [];
    const valList = optimizeFilterMap(contextsArray, (f: string) => f ? f.toLowerCase() : null);

    for (const key of valList) {
      // If the current key is already seen, skip it to prevent infinite loops
      if (seen.has(key)) continue;

      keys.push(key);
      seen.add(key);

      // Use memoized tag hierarchy resolution
      const parentTags = globalTagMemoizer.getParentTags(key);
      keys.push(...getTagsFromCacheOptimized(map, parentTags.map(t => tagSpacePathFromTag(t)), seen));
    }
  }
  return keys;
}

/**
 * Evaluate space membership using pre-built index instead of iterating all spaces
 */
function evaluateSpaceMembership(
  pathState: PathState,
  spacesCache: Map<string, SpaceState>,
  settings: MakeMDSettings
): { spaces: string[]; spaceNames: string[]; liveSpaces: string[]; linkedSpaces: string[]; isSpaceNote: boolean; spacePath?: string } {
  const spaces: string[] = [];
  const linkedSpaces: string[] = [];
  const liveSpaces: string[] = [];
  const spaceNames: string[] = [];
  let isSpaceNote = false;
  let spacePath: string | undefined;

  // Use space evaluation index for faster lookups
  const evalIndex = globalSpaceEvaluationIndex;
  const evaledSpaces = new Set<string>();

  const evalSpace = (s: string, space: SpaceState) => {
    if (evaledSpaces.has(s)) return;
    evaledSpaces.add(s);

    // Handle dependencies first
    if (space.dependencies?.length > 0) {
      for (const dep of space.dependencies) {
        if (spacesCache.has(dep)) {
          evalSpace(dep, spacesCache.get(dep)!);
        }
      }
    }

    // Check if this path is a space note
    if (space.space.notePath == pathState.path && space.path != space.space.notePath) {
      isSpaceNote = true;
      spacePath = space.path;
      if (settings.enableFolderNote) {
        pathState.hidden = true;
      }
    }

    // Skip tag and default subtypes for certain checks
    if (pathState.subtype != 'tag' && pathState.subtype != 'default') {
      if (space.space && space.space.path == pathState.parent) {
        spaces.push(s);
        spaceNames.push(space.name);
        return;
      }
    }

    // Use indexed evaluation for join conditions
    if (space.metadata?.joins?.length > 0) {
      const matchingPaths = evalIndex.getPathsForSpace(space);
      if (matchingPaths.has(pathState.path)) {
        spaces.push(s);
        spaceNames.push(space.name);
        liveSpaces.push(s);
        return;
      }
    }

    // Check link-based membership
    if (space.metadata?.links?.length > 0) {
      const spaceItem = (space.metadata?.links ?? []).find((f) => f == pathState.path);
      if (spaceItem) {
        if (pathState.subtype != 'md' && pathState.subtype != 'folder' && space.type == 'tag') {
          const { tagPathToTag } = require('utils/tags');
          pathState.tags.push(tagPathToTag(space.path));
        }
        spaces.push(s);
        spaceNames.push(space.name);
        linkedSpaces.push(s);
      }
    }
  };

  for (const [s, space] of spacesCache) {
    evalSpace(s, space);
  }

  return { spaces, spaceNames, liveSpaces, linkedSpaces, isSpaceNote, spacePath };
}

export const parseMetadata = (
  path: string,
  settings: MakeMDSettings,
  spacesCache: Map<string, SpaceState>,
  pathCache: PathCache,
  name: string,
  type: string,
  subtype: string,
  parent: string,
  oldMetadata: PathState,
): { changed: boolean; cache: PathState } => {
  if (!pathCache) return { changed: false, cache: null };

  const defaultSticker = (
    sticker: string,
    type: string,
    subtype: string,
    path: string,
  ): string => {
    if (sticker?.length > 0) return sticker;
    if (type == 'space') {
      if (path == 'Spaces/Home') return 'ui//home';
      if (path == "/") return 'ui//vault';
      if (path.startsWith('spaces://')) return "ui//tags";
      return "ui//folder";
    }
    return 'ui//file';
  };

  const cache: PathState = {
    label: pathCache?.label,
    path,
    name: pathCache?.label?.name ?? pathToString(path),
    readOnly: pathCache?.readOnly,
  };

  const tags: string[] = [];
  const fileTags: string[] = pathCache?.tags 
    ? optimizeFilterMap(pathCache.tags, (f: string) => f ? f.toLowerCase() : null) 
    : [];
    
  let hidden = excludePathPredicate(settings, path);
  if (path.startsWith(builtinSpacePathPrefix)) {
    const builtin = path.replace(builtinSpacePathPrefix, '');
    hidden = builtinSpaces[builtin]?.hidden;
    cache.readOnly = builtinSpaces[builtin]?.readOnly;
  }

  // Add parent space contexts
  if (spacesCache.has(parent)) {
    for (const def of spacesCache.get(parent).contexts ?? []) {
      if (def) tags.push(def.toLowerCase());
    }
  }

  tags.push(...fileTags);

  const aliases = pathCache?.property
    ? ensureArray(pathCache.property[settings.fmKeyAlias])
    : [];
    
  const parentDefaultSticker = spacesCache.get(parent)?.metadata?.defaultSticker;
  const sticker = defaultSticker(
    initiateString(pathCache?.label?.sticker, parentDefaultSticker),
    type,
    subtype,
    path,
  );
  
  const parentDefaultColor = spacesCache.get(parent)?.metadata?.defaultColor;
  const color = pathCache?.label?.color ?? parentDefaultColor ?? '';
  
  const outlinks = pathCache?.resolvedLinks ?? [];
  
  const pathState: PathState = {
    ...cache,
    name,
    tags: uniq(tags),
    type,
    subtype,
    parent,
    label: {
      name: settings.spacesUseAlias && aliases?.length > 0 ? aliases[0] : name,
      sticker,
      color,
      cover: pathCache?.label?.cover ?? '',
      preview: pathCache?.label?.preview ?? '',
      thumbnail: pathCache?.label?.thumbnail ?? '',
    },
    metadata: {
      ...pathCache,
    },
    outlinks,
  };

  // Handle tag-based spaces
  const spaceNames: string[] = [];
  if (subtype == 'tag') {
    pathState.spaces = [tagsSpacePath];
  }
  
  for (const s of tags) {
    const spacePath = globalTagMemoizer.tagToSpacePath(s);
    if (!pathState.spaces) pathState.spaces = [];
    pathState.spaces.push(spacePath);
    spaceNames.push(s);
  }

  // Evaluate space membership using optimized index
  const membership = evaluateSpaceMembership(pathState, spacesCache, settings);
  
  if (!pathState.spaces) pathState.spaces = [];
  pathState.spaces.push(...membership.spaces);
  pathState.spaceNames = [...spaceNames, ...membership.spaceNames];
  pathState.liveSpaces = membership.liveSpaces;
  pathState.linkedSpaces = membership.linkedSpaces;

  // Get inherited tags from spaces using memoized resolution
  const newTags = getTagsFromCacheOptimized(spacesCache, pathState.spaces);
  pathState.tags = uniq([...pathState.tags, ...newTags]);
  pathState.spaceNames = uniq(pathState.spaceNames ?? []);
  pathState.spaces = uniq(pathState.spaces).filter(f => f != path);

  if (membership.isSpaceNote) {
    pathState.metadata!.spacePath = membership.spacePath;
  }

  const metadata: PathState = hidden
    ? { ...pathState, spaces: [], hidden }
    : {
        ...pathState,
        hidden,
      };

  let changed = true;
  if (oldMetadata && _.isEqual(metadata, oldMetadata)) {
    changed = false;
  }
  
  return { changed, cache: metadata };
};
