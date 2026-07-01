import { useCallback } from "react";
import { Superstate } from "makemd-core";
import { SpaceProperty, SpaceTable, SpaceTableSchema } from "shared/types/mdb";
import { SpaceDefinition } from "shared/types/spaceDef";
import { SpaceInfo } from "shared/types/spaceInfo";
import { useMKitPreviewContext } from "../MKitContext";

interface UseSpaceAndPropertyOperationsProps {
  superstate: Superstate | null;
  isMKitPath: (path: string) => boolean;
  convertMKitPath: (path: string) => string;
}

/**
 * Custom hook for space and property operations
 * Handles both MKit preview mode and regular mode
 */
export function useSpaceAndPropertyOperations({
  superstate,
  isMKitPath,
  convertMKitPath,
}: UseSpaceAndPropertyOperationsProps) {
  const mkitContext = useMKitPreviewContext();

  const createSpace = useCallback(
    (name: string, parentPath: string, definition: SpaceDefinition): void => {
      if (superstate?.spaceManager) {
        superstate.spaceManager.createSpace(name, parentPath, definition);
      }
    },
    [superstate]
  );

  const deleteSpace = useCallback(
    (path: string): void => {
      if (superstate?.spaceManager) {
        superstate.spaceManager.deleteSpace(path);
      }
    },
    [superstate]
  );

  const spaceInfoForPath = useCallback(
    (path: string): SpaceInfo => {
      if (superstate?.spaceManager) {
        return superstate.spaceManager.spaceInfoForPath(path);
      }
      return null;
    },
    [superstate]
  );

  const contextForSpace = useCallback(
    async (path: string): Promise<SpaceTable> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        const lookupPath = convertMKitPath(path);

        const mkitSpaceData =
          mkitContext.getSpaceByFullPath(lookupPath) ||
          mkitContext.getSpaceByRelativePath(lookupPath);

        if (mkitSpaceData?.contextTables) {
          const tables = Object.values(mkitSpaceData.contextTables);
          if (tables.length > 0) {
            return tables[0];
          }
        }

        return {
          schema: null,
          cols: [],
          rows: [],
        };
      }

      if (superstate?.spaceManager) {
        return await superstate.spaceManager.contextForSpace(path);
      }

      return {
        schema: null,
        cols: [],
        rows: [],
      };
    },
    [mkitContext, isMKitPath, convertMKitPath, superstate]
  );

  const addSpaceProperty = useCallback(
    async (path: string, property: SpaceProperty): Promise<boolean> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.addSpaceProperty(path, property);
      }
      return false;
    },
    [superstate]
  );

  const saveProperties = useCallback(
    async (path: string, properties: Record<string, any>): Promise<boolean> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.saveProperties(path, properties);
      }
      return false;
    },
    [superstate]
  );

  const deleteProperty = useCallback(
    (path: string, property: string): void => {
      if (superstate?.spaceManager) {
        superstate.spaceManager.deleteProperty(path, property);
      }
    },
    [superstate]
  );

  const renameProperty = useCallback(
    (path: string, property: string, newProperty: string): void => {
      if (superstate?.spaceManager) {
        superstate.spaceManager.renameProperty(path, property, newProperty);
      }
    },
    [superstate]
  );

  const createTable = useCallback(
    (path: string, schema: SpaceTableSchema): void => {
      if (superstate?.spaceManager) {
        superstate.spaceManager.createTable(path, schema);
      }
    },
    [superstate]
  );

  return {
    createSpace,
    deleteSpace,
    spaceInfoForPath,
    contextForSpace,
    addSpaceProperty,
    saveProperties,
    deleteProperty,
    renameProperty,
    createTable,
  };
}
