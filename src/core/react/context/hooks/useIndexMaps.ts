import { useCallback } from "react";
import { useMKitPreviewContext } from "../MKitContext";
import { Superstate } from "makemd-core";
import { ContextState, PathState } from "shared/types/superstate";

interface UseIndexMapsProps {
  superstate: Superstate | null;
}

/**
 * Custom hook for accessing index maps (contexts and paths)
 * Handles both MKit preview mode and regular mode
 */
export function useIndexMaps({ superstate }: UseIndexMapsProps) {
  const mkitContext = useMKitPreviewContext();

  const getContextsIndexMap = useCallback((): Map<string, ContextState> => {
    if (mkitContext?.isPreviewMode && mkitContext?.getContextsIndexMap) {
      // In MKit preview mode, use MKit context's map
      return mkitContext.getContextsIndexMap();
    } else if (superstate?.contextsIndex) {
      // In regular mode, return superstate's contexts index
      return superstate.contextsIndex;
    }
    // Fallback to empty map
    return new Map<string, ContextState>();
  }, [mkitContext, superstate]);

  const getPathsIndexMap = useCallback((): Map<string, PathState> => {
    if (mkitContext?.isPreviewMode && mkitContext?.getPathsIndexMap) {
      // In MKit preview mode, use MKit context's map
      return mkitContext.getPathsIndexMap();
    } else if (superstate?.pathsIndex) {
      // In regular mode, return superstate's paths index
      return superstate.pathsIndex;
    }
    // Fallback to empty map
    return new Map<string, PathState>();
  }, [mkitContext, superstate]);

  return { getContextsIndexMap, getPathsIndexMap };
}
