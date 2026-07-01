import { useCallback } from "react";
import { useMKitPreviewContext } from "../MKitContext";

/**
 * Custom hook for MKit path utilities
 * Provides functions to check and convert MKit preview paths
 */
export function useMKitPathUtils() {
  const mkitContext = useMKitPreviewContext();

  const isMKitPath = useCallback((path: string): boolean => {
    return path?.startsWith("mkit://preview/") || false;
  }, []);

  const convertMKitPath = useCallback(
    (path: string): string => {
      if (!isMKitPath(path)) {
        return path;
      }

      const pathAfterPrefix = path.replace("mkit://preview/", "");
      const kitId = mkitContext?.rootPath?.replace("mkit://preview/", "") || "";

      if (pathAfterPrefix === kitId || pathAfterPrefix === "") {
        return ".";
      } else if (pathAfterPrefix.startsWith(kitId + "/")) {
        let relativePath = pathAfterPrefix.slice((kitId + "/").length);
        // Remove trailing slashes
        relativePath = relativePath.replace(/\/+$/, "");
        return relativePath || ".";
      }

      // Remove trailing slashes from the result
      let result = pathAfterPrefix.replace(/\/+$/, "");
      return result || ".";
    },
    [mkitContext?.rootPath, isMKitPath]
  );

  return { isMKitPath, convertMKitPath };
}
