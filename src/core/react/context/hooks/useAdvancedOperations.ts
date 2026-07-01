import { useCallback } from "react";
import { Superstate } from "makemd-core";
import { SpaceDefinition, SpaceTableSchema, PathCache, PathState } from "shared/types/path";
import { useMKitPreviewContext } from "../MKitContext";

interface UseAdvancedOperationsProps {
  superstate: Superstate | null;
  isMKitPath: (path: string) => boolean;
  convertMKitPath: (path: string) => string;
}

/**
 * Custom hook for advanced space and path operations
 * Handles both MKit preview mode and regular mode
 */
export function useAdvancedOperations({
  superstate,
  isMKitPath,
  convertMKitPath,
}: UseAdvancedOperationsProps) {
  const mkitContext = useMKitPreviewContext();

  const saveSpace = useCallback(
    (
      path: string,
      definition: (def: SpaceDefinition) => SpaceDefinition,
      properties?: Record<string, any>
    ): void => {
      if (superstate?.spaceManager) {
        superstate.spaceManager.saveSpace(path, definition, properties);
      }
    },
    [superstate]
  );

  const renameSpace = useCallback(
    async (path: string, newPath: string): Promise<string> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.renameSpace(path, newPath);
      }
      return "";
    },
    [superstate]
  );

  const spaceDefForSpace = useCallback(
    async (path: string): Promise<SpaceDefinition> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.spaceDefForSpace(path);
      }
      return null;
    },
    [superstate]
  );

  const allPaths = useCallback(
    (type?: string[]): string[] => {
      if (superstate?.spaceManager) {
        return superstate.spaceManager.allPaths(type);
      }
      return [];
    },
    [superstate]
  );

  const renamePath = useCallback(
    async (oldPath: string, newPath: string): Promise<string> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.renamePath(oldPath, newPath);
      }
      return "";
    },
    [superstate]
  );

  const copyPath = useCallback(
    async (
      source: string,
      destination: string,
      newName?: string
    ): Promise<string> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.copyPath(
          source,
          destination,
          newName
        );
      }
      return "";
    },
    [superstate]
  );

  const getPathInfo = useCallback(
    async (path: string): Promise<Record<string, any>> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.getPathInfo(path);
      }
      return {};
    },
    [superstate]
  );

  const readPathCache = useCallback(
    async (path: string): Promise<PathCache> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.readPathCache(path);
      }
      return null;
    },
    [superstate]
  );

  const getPathState = useCallback(
    (path: string): PathState | null => {
      if (mkitContext?.isPreviewMode && mkitContext?.getPathState) {
        if (isMKitPath(path)) {
          const convertedPath = convertMKitPath(path);
          return mkitContext.getPathState(convertedPath) || null;
        }
        return mkitContext.getPathState(path) || null;
      }

      if (superstate?.pathsIndex) {
        return superstate.pathsIndex.get(path) || null;
      }

      return null;
    },
    [mkitContext, isMKitPath, convertMKitPath, superstate]
  );

  const childrenForPath = useCallback(
    async (path: string, type?: string): Promise<string[]> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.childrenForPath(path, type);
      }
      return [];
    },
    [superstate]
  );

  const saveFrameSchema = useCallback(
    async (
      path: string,
      schemaId: string,
      saveSchema: (prev: SpaceTableSchema) => SpaceTableSchema
    ): Promise<void> => {
      if (superstate?.spaceManager) {
        await superstate.spaceManager.saveFrameSchema(
          path,
          schemaId,
          saveSchema
        );
      }
    },
    [superstate]
  );

  const deleteFrame = useCallback(
    async (path: string, name: string): Promise<void> => {
      if (superstate?.spaceManager) {
        await superstate.spaceManager.deleteFrame(path, name);
      }
    },
    [superstate]
  );

  return {
    saveSpace,
    renameSpace,
    spaceDefForSpace,
    allPaths,
    renamePath,
    copyPath,
    getPathInfo,
    readPathCache,
    getPathState,
    childrenForPath,
    saveFrameSchema,
    deleteFrame,
  };
}
