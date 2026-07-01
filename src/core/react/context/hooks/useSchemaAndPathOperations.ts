import { useCallback } from "react";
import { Superstate } from "makemd-core";
import { SpaceTableSchema } from "shared/types/mdb";
import { URI } from "shared/types/path";
import { useMKitPreviewContext } from "../MKitContext";

interface UseSchemaAndPathOperationsProps {
  superstate: Superstate | null;
  isMKitPath: (path: string) => boolean;
  convertMKitPath: (path: string) => string;
}

/**
 * Custom hook for schema and path operations
 * Handles both MKit preview mode and regular mode
 */
export function useSchemaAndPathOperations({
  superstate,
  isMKitPath,
  convertMKitPath,
}: UseSchemaAndPathOperationsProps) {
  const mkitContext = useMKitPreviewContext();

  const tablesForSpace = useCallback(
    async (path: string): Promise<SpaceTableSchema[]> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        const lookupPath = convertMKitPath(path);

        const mkitSpaceData =
          mkitContext.getSpaceByFullPath(lookupPath) ||
          mkitContext.getSpaceByRelativePath(lookupPath);

        if (mkitSpaceData?.contextSchemas) {
          return mkitSpaceData.contextSchemas;
        }
      }

      if (superstate?.spaceManager) {
        const schemas = await superstate.spaceManager.tablesForSpace(path);
        return schemas || [];
      }

      return [];
    },
    [mkitContext, isMKitPath, convertMKitPath, superstate]
  );

  const framesForSpace = useCallback(
    async (path: string): Promise<SpaceTableSchema[]> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        const lookupPath = convertMKitPath(path);

        const mkitSpaceData =
          mkitContext.getSpaceByFullPath(lookupPath) ||
          mkitContext.getSpaceByRelativePath(lookupPath);

        if (mkitSpaceData?.frameSchemas) {
          return mkitSpaceData.frameSchemas.map(
            (fs) => fs as any as SpaceTableSchema
          );
        }
      }

      if (superstate?.spaceManager) {
        const schemas = await superstate.spaceManager.framesForSpace(path);
        return schemas || [];
      }

      return [];
    },
    [mkitContext, isMKitPath, convertMKitPath, superstate]
  );

  const resolvePath = useCallback(
    (path: string, source?: string): string => {
      if (mkitContext?.isPreviewMode) {
        return mkitContext.resolvePath(path, source);
      }

      if (superstate?.spaceManager) {
        return superstate.spaceManager.resolvePath(path, source);
      }

      return path;
    },
    [mkitContext, superstate]
  );

  const uriByString = useCallback(
    (uri: string, source?: string): URI => {
      if (superstate?.spaceManager) {
        return superstate.spaceManager.uriByString(uri, source);
      }

      return {
        scheme: "",
        authority: "",
        path: uri,
        basePath: uri,
        fullPath: uri,
        ref: null,
        trailSlash: false,
      };
    },
    [superstate]
  );

  const pathExists = useCallback(
    async (path: string): Promise<boolean> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        const lookupPath = convertMKitPath(path);
        const mkitSpaceData =
          mkitContext.getSpaceByFullPath(lookupPath) ||
          mkitContext.getSpaceByRelativePath(lookupPath);
        return !!mkitSpaceData;
      }

      if (superstate?.spaceManager) {
        return await superstate.spaceManager.pathExists(path);
      }

      return false;
    },
    [mkitContext, isMKitPath, convertMKitPath, superstate]
  );

  return {
    tablesForSpace,
    framesForSpace,
    resolvePath,
    uriByString,
    pathExists,
  };
}
