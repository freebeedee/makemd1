/**
 * Space Evaluation Index
 * Optimizes space membership evaluation from O(n*m) to O(n)
 * by pre-indexing paths by their properties and tags
 */

import { PathState } from "shared/types/PathState";
import { SpaceState } from "shared/types/PathState";

interface PropertyIndex {
  // Maps property name -> value -> set of path keys
  byProperty: Map<string, Map<string, Set<string>>>;
  // Maps tag -> set of path keys
  byTag: Map<string, Set<string>>;
  // Maps parent path -> set of child path keys
  byParent: Map<string, Set<string>>;
}

export class SpaceEvaluationIndex {
  private index: PropertyIndex;
  private pathCache: Map<string, PathState>;
  private version: number = 0;
  
  constructor() {
    this.index = {
      byProperty: new Map(),
      byTag: new Map(),
      byParent: new Map()
    };
    this.pathCache = new Map();
  }
  
  /**
   * Build or rebuild the evaluation index from paths
   * @param paths - Array of all path states
   */
  build(paths: PathState[]): void {
    this.index.byProperty.clear();
    this.index.byTag.clear();
    this.index.byParent.clear();
    this.pathCache.clear();
    
    for (const path of paths) {
      this.indexPath(path);
    }
    
    this.version++;
  }
  
  /**
   * Incrementally update index for a single path
   * @param path - The path state to update
   * @param removed - Whether the path was removed
   */
  updatePath(path: PathState, removed: boolean = false): void {
    if (removed) {
      this.removePathFromIndex(path);
    } else {
      this.indexPath(path);
    }
    this.version++;
  }
  
  /**
   * Get all paths matching a space's join conditions efficiently
   * @param space - The space state with join conditions
   * @returns Set of matching path keys
   */
  getPathsForSpace(space: SpaceState): Set<string> {
    const joins = space.metadata?.joins;
    if (!joins || joins.length === 0) {
      return new Set();
    }
    
    // Start with the most restrictive condition
    let candidateSet: Set<string> | null = null;
    
    for (const join of joins) {
      let conditionSet: Set<string>;
      
      if (join.type === 'tag') {
        conditionSet = this.index.byTag.get(join.value) ?? new Set();
      } else if (join.type === 'property') {
        const propIndex = this.index.byProperty.get(join.property);
        conditionSet = propIndex?.get(join.value) ?? new Set();
      } else if (join.type === 'parent') {
        conditionSet = this.index.byParent.get(join.value) ?? new Set();
      } else {
        continue;
      }
      
      if (candidateSet === null) {
        candidateSet = new Set(conditionSet);
      } else {
        // Intersect with current candidate set
        candidateSet = this.intersectSets(candidateSet, conditionSet);
      }
      
      // Early exit if no candidates remain
      if (candidateSet.size === 0) {
        break;
      }
    }
    
    return candidateSet ?? new Set();
  }
  
  /**
   * Get all paths with a specific tag
   */
  getPathsByTag(tag: string): Set<string> {
    return new Set(this.index.byTag.get(tag.toLowerCase()) ?? []);
  }
  
  /**
   * Get all paths with a specific property value
   */
  getPathsByProperty(property: string, value: string): Set<string> {
    const propIndex = this.index.byProperty.get(property.toLowerCase());
    return new Set(propIndex?.get(value.toLowerCase()) ?? []);
  }
  
  /**
   * Get all child paths for a parent
   */
  getPathsByParent(parent: string): Set<string> {
    return new Set(this.index.byParent.get(parent) ?? []);
  }
  
  /**
   * Batch evaluate multiple spaces efficiently
   * @param spaces - Array of space states
   * @returns Map of space path to matching paths
   */
  batchEvaluateSpaces(spaces: SpaceState[]): Map<string, Set<string>> {
    const results = new Map<string, Set<string>>();
    
    for (const space of spaces) {
      results.set(space.path, this.getPathsForSpace(space));
    }
    
    return results;
  }
  
  /**
   * Get index statistics for monitoring
   */
  getStats(): { 
    version: number;
    pathCount: number;
    propertyCount: number;
    tagCount: number;
    parentCount: number;
  } {
    let totalPropertyEntries = 0;
    for (const propMap of this.index.byProperty.values()) {
      totalPropertyEntries += propMap.size;
    }
    
    return {
      version: this.version,
      pathCount: this.pathCache.size,
      propertyCount: totalPropertyEntries,
      tagCount: this.index.byTag.size,
      parentCount: this.index.byParent.size
    };
  }
  
  /**
   * Clear the index
   */
  clear(): void {
    this.index.byProperty.clear();
    this.index.byTag.clear();
    this.index.byParent.clear();
    this.pathCache.clear();
    this.version++;
  }
  
  private indexPath(path: PathState): void {
    const pathKey = path.path;
    this.pathCache.set(pathKey, path);
    
    // Index by tags
    for (const tag of path.tags ?? []) {
      const normalizedTag = tag.toLowerCase();
      if (!this.index.byTag.has(normalizedTag)) {
        this.index.byTag.set(normalizedTag, new Set());
      }
      this.index.byTag.get(normalizedTag)!.add(pathKey);
    }
    
    // Index by parent
    if (path.parent) {
      if (!this.index.byParent.has(path.parent)) {
        this.index.byParent.set(path.parent, new Set());
      }
      this.index.byParent.get(path.parent)!.add(pathKey);
    }
    
    // Index by properties (from metadata)
    const metadata = path.metadata;
    if (metadata?.property) {
      for (const [propName, propValue] of Object.entries(metadata.property)) {
        const normalizedProp = propName.toLowerCase();
        const values = Array.isArray(propValue) ? propValue : [propValue];
        
        if (!this.index.byProperty.has(normalizedProp)) {
          this.index.byProperty.set(normalizedProp, new Map());
        }
        
        const valueMap = this.index.byProperty.get(normalizedProp)!;
        
        for (const value of values) {
          const normalizedValue = String(value).toLowerCase();
          if (!valueMap.has(normalizedValue)) {
            valueMap.set(normalizedValue, new Set());
          }
          valueMap.get(normalizedValue)!.add(pathKey);
        }
      }
    }
  }
  
  private removePathFromIndex(path: PathState): void {
    const pathKey = path.path;
    this.pathCache.delete(pathKey);
    
    // Remove from tag index
    for (const tag of path.tags ?? []) {
      const normalizedTag = tag.toLowerCase();
      const tagSet = this.index.byTag.get(normalizedTag);
      if (tagSet) {
        tagSet.delete(pathKey);
        if (tagSet.size === 0) {
          this.index.byTag.delete(normalizedTag);
        }
      }
    }
    
    // Remove from parent index
    if (path.parent) {
      const parentSet = this.index.byParent.get(path.parent);
      if (parentSet) {
        parentSet.delete(pathKey);
        if (parentSet.size === 0) {
          this.index.byParent.delete(path.parent);
        }
      }
    }
    
    // Remove from property index
    const metadata = path.metadata;
    if (metadata?.property) {
      for (const [propName, propValue] of Object.entries(metadata.property)) {
        const normalizedProp = propName.toLowerCase();
        const valueMap = this.index.byProperty.get(normalizedProp);
        
        if (valueMap) {
          const values = Array.isArray(propValue) ? propValue : [propValue];
          
          for (const value of values) {
            const normalizedValue = String(value).toLowerCase();
            const pathSet = valueMap.get(normalizedValue);
            
            if (pathSet) {
              pathSet.delete(pathKey);
              if (pathSet.size === 0) {
                valueMap.delete(normalizedValue);
              }
            }
          }
          
          if (valueMap.size === 0) {
            this.index.byProperty.delete(normalizedProp);
          }
        }
      }
    }
  }
  
  private intersectSets<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    // Always iterate over the smaller set for efficiency
    const [smaller, larger] = set1.size < set2.size 
      ? [set1, set2] 
      : [set2, set1];
    
    const result = new Set<T>();
    for (const item of smaller) {
      if (larger.has(item)) {
        result.add(item);
      }
    }
    
    return result;
  }
}

// Singleton instance for global use
export const globalSpaceEvaluationIndex = new SpaceEvaluationIndex();
