import { useCallback } from "react";
import { Superstate } from "makemd-core";
import { SpaceTable, SpaceTableSchema, SpaceTables } from "shared/types/mdb";
import { MDBFrame, MDBFrames } from "shared/types/mframe";
import { ContextState, PathState } from "shared/types/superstate";
import { IndexMap } from "shared/types/indexMap";
import { MakeMDSettings } from "shared/types/settings";
import { propertyDependencies } from "core/utils/contexts/linkContextRow";
import { linkContextRow } from "core/utils/contexts/linkContextRow";
import { formulas } from "core/utils/formula/formulas";
import * as math from "mathjs";
import { all } from "mathjs";
import { useMKitPreviewContext } from "../MKitContext";

interface UseDataOperationsProps {
  superstate: Superstate | null;
  isMKitPath: (path: string) => boolean;
  convertMKitPath: (path: string) => string;
  getContextsIndexMap: () => Map<string, ContextState>;
  getPathsIndexMap: () => Map<string, PathState>;
}

/**
 * Custom hook for core data operations (read/save tables and frames)
 * Handles both MKit preview mode and regular mode
 */
export function useDataOperations({
  superstate,
  isMKitPath,
  convertMKitPath,
  getContextsIndexMap,
  getPathsIndexMap,
}: UseDataOperationsProps) {
  const mkitContext = useMKitPreviewContext();

  // Create formula context
  const formulaContext = useCallback(() => {
    if (superstate?.formulaContext) {
      return superstate.formulaContext;
    }
    const config: math.ConfigOptions = {
      matrix: "Array",
    };
    const runContext = math.create(all, config);
    runContext.import(formulas, { override: true });
    return runContext;
  }, [superstate]);

  const readTable = useCallback(
    async (path: string, schema: string): Promise<SpaceTable | null> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        // Handle MKit preview mode
        const lookupPath = convertMKitPath(path);

        const mkitSpaceData =
          mkitContext.getSpaceByFullPath(lookupPath) ||
          mkitContext.getSpaceByRelativePath(lookupPath);

        if (mkitSpaceData?.contextTables?.[schema]) {
          const table = mkitSpaceData.contextTables[schema];

          // Apply linkContextRow for MKit data
          if (table.rows && table.cols && table.cols.length > 0) {
            const pathsMap = mkitContext?.getPathsIndexMap
              ? mkitContext.getPathsIndexMap()
              : new Map<string, PathState>();
            const contextsMap = mkitContext?.getContextsIndexMap
              ? mkitContext.getContextsIndexMap()
              : new Map<string, ContextState>();
            const spacesMap = new IndexMap();

            const dependencies = propertyDependencies(table.cols);
            const settings = superstate?.settings || ({} as MakeMDSettings);

            const processedRows = table.rows.map((row: any) =>
              linkContextRow(
                formulaContext(),
                pathsMap,
                contextsMap,
                spacesMap,
                row,
                table.cols,
                mkitSpaceData.pathState,
                settings,
                dependencies
              )
            );

            return {
              ...table,
              rows: processedRows,
            };
          }

          return table;
        }
      }

      // Fallback to regular spaceManager
      if (superstate?.spaceManager) {
        const table = await superstate.spaceManager.readTable(path, schema);

        if (table && table.rows && table.cols && table.cols.length > 0) {
          const pathsMap = getPathsIndexMap();
          const contextsMap = getContextsIndexMap();
          const pathState = pathsMap.get(path);

          if (pathState) {
            const dependencies = propertyDependencies(table.cols);
            const processedRows = table.rows.map((row: any) =>
              linkContextRow(
                formulaContext(),
                pathsMap,
                contextsMap,
                superstate.spacesMap || new IndexMap(),
                row,
                table.cols,
                pathState,
                superstate.settings || ({} as MakeMDSettings),
                dependencies
              )
            );

            return {
              ...table,
              rows: processedRows,
            };
          }
        }

        return table;
      }

      return null;
    },
    [
      mkitContext,
      isMKitPath,
      convertMKitPath,
      superstate,
      formulaContext,
      getPathsIndexMap,
      getContextsIndexMap,
    ]
  );

  const saveTable = useCallback(
    async (
      path: string,
      table: SpaceTable,
      force?: boolean
    ): Promise<boolean> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        return false;
      }

      if (superstate?.spaceManager) {
        return await superstate.spaceManager.saveTable(path, table, force);
      }

      return false;
    },
    [mkitContext, isMKitPath, superstate]
  );

  const readFrame = useCallback(
    async (path: string, schema: string): Promise<MDBFrame | null> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        const lookupPath = convertMKitPath(path);

        const mkitSpaceData =
          mkitContext.getSpaceByFullPath(lookupPath) ||
          mkitContext.getSpaceByRelativePath(lookupPath);

        if (mkitSpaceData?.frameData?.[schema]) {
          return mkitSpaceData.frameData[schema];
        }
      }

      if (superstate?.spaceManager) {
        return await superstate.spaceManager.readFrame(path, schema);
      }

      return null;
    },
    [mkitContext, isMKitPath, convertMKitPath, superstate]
  );

  const saveFrame = useCallback(
    async (path: string, frame: MDBFrame): Promise<void> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        return;
      }

      if (superstate?.spaceManager) {
        return await superstate.spaceManager.saveFrame(path, frame);
      }
    },
    [mkitContext, isMKitPath, superstate]
  );

  return { readTable, saveTable, readFrame, saveFrame };
}
