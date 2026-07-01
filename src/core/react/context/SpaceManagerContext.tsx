import { API, APISpaceManager } from "core/superstate/api";
import { Superstate } from "makemd-core";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { IAPI } from "shared/types/api";
import { PathCache } from "shared/types/caches";
import { IndexMap } from "shared/types/indexMap";
import { SpaceTable, SpaceTables, SpaceTableSchema } from "shared/types/mdb";
import { MDBFrame, MDBFrames } from "shared/types/mframe";
import { URI } from "shared/types/path";
import { MakeMDSettings } from "shared/types/settings";
import { SpaceDefinition } from "shared/types/spaceDef";
import { SpaceInfo } from "shared/types/spaceInfo";
import { SpaceManagerInterface } from "shared/types/spaceManager";
import { ContextState } from "shared/types/superstate";
import { useMKitPreviewContext } from "./MKitContext";
import {
  useMKitPathUtils,
  useIndexMaps,
  useDataOperations,
  useSchemaAndPathOperations,
  useSpaceAndPropertyOperations,
  useFileAndSpaceOperations,
  useAdvancedOperations,
} from "./hooks";

/**
 * Enhanced SpaceManager interface that handles both regular and MKit operations
 */
interface SpaceManagerContextType extends APISpaceManager {
  // Core data operations (MKit-aware)
  readTable(path: string, schema: string): Promise<SpaceTable | null>;
  saveTable(path: string, table: SpaceTable, force?: boolean): Promise<boolean>;
  readFrame(path: string, schema: string): Promise<MDBFrame | null>;
  saveFrame(path: string, frame: MDBFrame): Promise<void>;

  // Schema operations (MKit-aware)
  tablesForSpace(path: string): Promise<SpaceTableSchema[]>;
  framesForSpace(path: string): Promise<SpaceTableSchema[]>;

  // Path operations (MKit-aware)
  resolvePath(path: string, source?: string): string;
  uriByString(uri: string, source?: string): URI;
  pathExists(path: string): Promise<boolean>;

  // Space operations
  createSpace(
    name: string,
    parentPath: string,
    definition: SpaceDefinition
  ): void;
  deleteSpace(path: string): void;
  spaceInfoForPath(path: string): SpaceInfo;
  contextForSpace(path: string): Promise<SpaceTable>;

  // Property operations
  addSpaceProperty(path: string, property: SpaceProperty): Promise<boolean>;
  saveProperties(
    path: string,
    properties: Record<string, any>
  ): Promise<boolean>;
  deleteProperty(path: string, property: string): void;
  renameProperty(path: string, property: string, newProperty: string): void;

  // File operations
  createItemAtPath(
    parent: string,
    type: string,
    name: string,
    content?: any
  ): Promise<string>;
  deletePath(path: string): void;
  readPath(path: string): Promise<string>;
  writeToPath(path: string, content: any, binary?: boolean): Promise<void>;
  parentPathForPath(path: string): string;

  // Additional space operations
  allSpaces(): SpaceInfo[];
  childrenForSpace(path: string): string[];
  spaceInitiated(path: string): Promise<boolean>;
  contextInitiated(path: string): Promise<boolean>;
  readAllTables(path: string): Promise<SpaceTables>;
  readAllFrames(path: string): Promise<MDBFrames>;
  saveSpace(
    path: string,
    definition: (def: SpaceDefinition) => SpaceDefinition,
    properties?: Record<string, any>
  ): void;
  renameSpace(path: string, newPath: string): Promise<string>;
  spaceDefForSpace(path: string): Promise<SpaceDefinition>;

  // Additional path operations
  allPaths(type?: string[]): string[];
  renamePath(oldPath: string, newPath: string): Promise<string>;
  copyPath(
    source: string,
    destination: string,
    newName?: string
  ): Promise<string>;
  getPathInfo(path: string): Promise<Record<string, any>>;
  readPathCache(path: string): Promise<PathCache>;
  getPathState(path: string): any;
  getPathsIndexMap(): Map<string, any>;
  childrenForPath(path: string, type?: string): Promise<string[]>;

  // Frame schema operations
  saveFrameSchema(
    path: string,
    schemaId: string,
    saveSchema: (prev: SpaceTableSchema) => SpaceTableSchema
  ): Promise<void>;
  deleteFrame(path: string, name: string): Promise<void>;

  // MKit utilities
  isPreviewMode: boolean;
  convertMKitPath(path: string): string;
  isMKitPath(path: string): boolean;

  // Context access map
  getContextsIndexMap(): Map<string, ContextState>;

  // API reference
  api: IAPI | null;

  // No fallback - MKit operates in isolation
  spaceManager: SpaceManagerInterface | null;
}

interface SpaceManagerProviderProps {
  superstate: Superstate | null;
  children: React.ReactNode;
}

const SpaceManagerContext = createContext<SpaceManagerContextType | null>(null);

export const useSpaceManager = () => {
  const context = useContext(SpaceManagerContext);
  if (!context) {
    throw new Error("useSpaceManager must be used within SpaceManagerProvider");
  }
  return context;
};

export const SpaceManagerProvider: React.FC<SpaceManagerProviderProps> = ({
  superstate,
  children,
}) => {
  const mkitContext = useMKitPreviewContext();

  // Use custom hooks for modular functionality
  const { isMKitPath, convertMKitPath } = useMKitPathUtils();
  const { getContextsIndexMap, getPathsIndexMap } = useIndexMaps({ superstate });
  const { readTable, saveTable, readFrame, saveFrame } = useDataOperations({
    superstate,
    isMKitPath,
    convertMKitPath,
    getContextsIndexMap,
    getPathsIndexMap,
  });
  const {
    tablesForSpace,
    framesForSpace,
    resolvePath,
    uriByString,
    pathExists,
  } = useSchemaAndPathOperations({
    superstate,
    isMKitPath,
    convertMKitPath,
  });
  const {
    createSpace,
    deleteSpace,
    spaceInfoForPath,
    contextForSpace,
    addSpaceProperty,
    saveProperties,
    deleteProperty,
    renameProperty,
    createTable,
  } = useSpaceAndPropertyOperations({
    superstate,
    isMKitPath,
    convertMKitPath,
  });
  const {
    createItemAtPath,
    deletePath,
    readPath,
    writeToPath,
    parentPathForPath,
    allSpaces,
    childrenForSpace,
    spaceInitiated,
    contextInitiated,
    readAllTables,
    readAllFrames,
  } = useFileAndSpaceOperations({
    superstate,
    isMKitPath,
    convertMKitPath,
  });
  const {
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
  } = useAdvancedOperations({
    superstate,
    isMKitPath,
    convertMKitPath,
  });

  const contextValue = useMemo<SpaceManagerContextType>(
    () => ({
      // Core data operations
      readTable,
      saveTable,
      readFrame,
      saveFrame,

      // Schema operations
      tablesForSpace,
      framesForSpace,

      // Path operations
      resolvePath,
      uriByString,
      pathExists,

      // Space operations
      createSpace,
      deleteSpace,
      spaceInfoForPath,
      contextForSpace,

      // Property operations
      addSpaceProperty,
      saveProperties,
      deleteProperty,
      renameProperty,

      // Table operations
      createTable,

      // File operations
      createItemAtPath,
      deletePath,
      readPath,
      writeToPath,
      parentPathForPath,

      // Additional space operations
      allSpaces,
      childrenForSpace,
      spaceInitiated,
      contextInitiated,
      readAllTables,
      readAllFrames,
      saveSpace,
      renameSpace,
      spaceDefForSpace,

      // Additional path operations
      allPaths,
      renamePath,
      copyPath,
      getPathInfo,
      readPathCache,
      getPathState,
      getPathsIndexMap,
      childrenForPath,

      // Frame schema operations
      saveFrameSchema,
      deleteFrame,

      // MKit utilities
      isPreviewMode: true,
      convertMKitPath,
      isMKitPath,

      // Context access maps
      getContextsIndexMap,

      // API reference - will be set below
      api: null as IAPI,

      // No fallback - MKit operates in isolation
      spaceManager: null as SpaceManagerInterface,
    }),
    [
      readTable,
      saveTable,
      readFrame,
      saveFrame,
      tablesForSpace,
      framesForSpace,
      resolvePath,
      uriByString,
      pathExists,
      createSpace,
      deleteSpace,
      spaceInfoForPath,
      contextForSpace,
      addSpaceProperty,
      saveProperties,
      deleteProperty,
      renameProperty,
      createTable,
      createItemAtPath,
      deletePath,
      readPath,
      writeToPath,
      parentPathForPath,
      allSpaces,
      childrenForSpace,
      spaceInitiated,
      contextInitiated,
      readAllTables,
      readAllFrames,
      saveSpace,
      renameSpace,
      spaceDefForSpace,
      allPaths,
      renamePath,
      copyPath,
      getPathInfo,
      readPathCache,
      getPathState,
      getPathsIndexMap,
      childrenForPath,
      saveFrameSchema,
      deleteFrame,
      convertMKitPath,
      isMKitPath,
      getContextsIndexMap,
    ]
  );

  const api = useMemo(() => {
    const kitAPI = new API(superstate, contextValue);
    return kitAPI;
  }, [contextValue]);

  return (
    <SpaceManagerContext.Provider value={{ ...contextValue, api: api }}>
      {children}
    </SpaceManagerContext.Provider>
  );
};

export { SpaceManagerContext };
