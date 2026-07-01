import { useCallback } from "react";
import { Superstate } from "makemd-core";
import { SpaceTables, MDBFrames } from "shared/types/mdb";
import { useMKitPreviewContext } from "../MKitContext";

interface UseFileAndSpaceOperationsProps {
  superstate: Superstate | null;
  isMKitPath: (path: string) => boolean;
  convertMKitPath: (path: string) => string;
}

/**
 * Custom hook for file and space enumeration operations
 * Handles both MKit preview mode and regular mode
 */
export function useFileAndSpaceOperations({
  superstate,
  isMKitPath,
  convertMKitPath,
}: UseFileAndSpaceOperationsProps) {
  const mkitContext = useMKitPreviewContext();

  const createItemAtPath = useCallback(
    async (
      parent: string,
      type: string,
      name: string,
      content?: any
    ): Promise<string> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.createItemAtPath(
          parent,
          type,
          name,
          content
        );
      }
      return "";
    },
    [superstate]
  );

  const deletePath = useCallback(
    (path: string): void => {
      if (superstate?.spaceManager) {
        superstate.spaceManager.deletePath(path);
      }
    },
    [superstate]
  );

  const readPath = useCallback(
    async (path: string): Promise<string> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.readPath(path);
      }
      return "";
    },
    [superstate]
  );

  const writeToPath = useCallback(
    async (path: string, content: any, binary?: boolean): Promise<void> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.writeToPath(path, content, binary);
      }
    },
    [superstate]
  );

  const parentPathForPath = useCallback(
    (path: string): string => {
      if (superstate?.spaceManager) {
        return superstate.spaceManager.parentPathForPath(path);
      }
      return "";
    },
    [superstate]
  );

  const allSpaces = useCallback((): any[] => {
    if (superstate?.spaceManager) {
      return superstate.spaceManager.allSpaces();
    }
    return [];
  }, [superstate]);

  const childrenForSpace = useCallback(
    (path: string): string[] => {
      if (superstate?.spaceManager) {
        return superstate.spaceManager.childrenForSpace(path);
      }
      return [];
    },
    [superstate]
  );

  const spaceInitiated = useCallback(
    async (path: string): Promise<boolean> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.spaceInitiated(path);
      }
      return false;
    },
    [superstate]
  );

  const contextInitiated = useCallback(
    async (path: string): Promise<boolean> => {
      if (superstate?.spaceManager) {
        return await superstate.spaceManager.contextInitiated(path);
      }
      return false;
    },
    [superstate]
  );

  const readAllTables = useCallback(
    async (path: string): Promise<SpaceTables> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        const convertedPath = convertMKitPath(path);
        const spaceData =
          mkitContext.getSpaceByFullPath(convertedPath) ||
          mkitContext.getSpaceByRelativePath(convertedPath);

        if (spaceData?.contextTables) {
          return spaceData.contextTables;
        }
      }

      if (superstate?.spaceManager) {
        return await superstate.spaceManager.readAllTables(path);
      }
      return {};
    },
    [superstate, mkitContext, isMKitPath, convertMKitPath]
  );

  const readAllFrames = useCallback(
    async (path: string): Promise<MDBFrames> => {
      if (mkitContext?.isPreviewMode && isMKitPath(path)) {
        const convertedPath = convertMKitPath(path);
        const spaceData =
          mkitContext.getSpaceByFullPath(convertedPath) ||
          mkitContext.getSpaceByRelativePath(convertedPath);

        if (spaceData?.frameData) {
          return spaceData.frameData;
        }
      }

      if (superstate?.spaceManager) {
        return await superstate.spaceManager.readAllFrames(path);
      }
      return {};
    },
    [superstate, mkitContext, isMKitPath, convertMKitPath]
  );

  return {
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
  };
}
