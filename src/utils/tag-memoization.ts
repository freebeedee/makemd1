/**
 * Tag Hierarchy Memoization Utility
 * Prevents O(n²) complexity and stack overflows in tag resolution
 */

interface TagHierarchyCache {
  parentTags: Map<string, string[]>;
  subtags: Map<string, string[]>;
  tagSpacePath: Map<string, string>;
  accessCount: number;
  lastInvalidation: number;
}

export class TagMemoizer {
  private cache: TagHierarchyCache;
  private readonly maxCacheSize: number = 2000;
  private readonly invalidationInterval: number = 300000; // 5 minutes
  
  constructor() {
    this.cache = {
      parentTags: new Map(),
      subtags: new Map(),
      tagSpacePath: new Map(),
      accessCount: 0,
      lastInvalidation: Date.now()
    };
  }
  
  /**
   * Get all parent tags for a given tag with memoization
   * @param tag - The tag to get parents for (e.g., "#project/work/task")
   * @returns Array of parent tags (e.g., ["#project", "#project/work"])
   */
  getParentTags(tag: string): string[] {
    this.checkInvalidation();
    
    if (this.cache.parentTags.has(tag)) {
      this.cache.accessCount++;
      return this.cache.parentTags.get(tag)!;
    }
    
    const parents = this.computeParentTags(tag);
    this.setWithLimit(this.cache.parentTags, tag, parents);
    return parents;
  }
  
  /**
   * Get all subtags for a given parent tag with memoization
   * @param parentTag - The parent tag
   * @param allTags - Set of all available tags
   * @returns Array of subtags
   */
  getSubtags(parentTag: string, allTags: Set<string>): string[] {
    this.checkInvalidation();
    
    const cacheKey = `${parentTag}:${allTags.size}`;
    if (this.cache.subtags.has(cacheKey)) {
      this.cache.accessCount++;
      return this.cache.subtags.get(cacheKey)!;
    }
    
    const subtags = this.computeSubtags(parentTag, allTags);
    this.setWithLimit(this.cache.subtags, cacheKey, subtags);
    return subtags;
  }
  
  /**
   * Convert tag to space path with memoization
   * @param tag - The tag
   * @returns The corresponding space path
   */
  tagToSpacePath(tag: string): string {
    this.checkInvalidation();
    
    if (this.cache.tagSpacePath.has(tag)) {
      this.cache.accessCount++;
      return this.cache.tagSpacePath.get(tag)!;
    }
    
    const spacePath = this.computeTagSpacePath(tag);
    this.setWithLimit(this.cache.tagSpacePath, tag, spacePath);
    return spacePath;
  }
  
  /**
   * Batch resolve multiple tags efficiently
   * @param tags - Array of tags to resolve
   * @param allTags - Set of all available tags
   * @returns Map of tag to resolved space paths
   */
  batchResolveTags(tags: string[], allTags: Set<string>): Map<string, string> {
    this.checkInvalidation();
    
    const result = new Map<string, string>();
    const unresolvedTags: string[] = [];
    
    // First pass: check cache
    for (const tag of tags) {
      if (this.cache.tagSpacePath.has(tag)) {
        result.set(tag, this.cache.tagSpacePath.get(tag)!);
        this.cache.accessCount++;
      } else {
        unresolvedTags.push(tag);
      }
    }
    
    // Second pass: resolve missing tags
    for (const tag of unresolvedTags) {
      const spacePath = this.computeTagSpacePath(tag);
      this.setWithLimit(this.cache.tagSpacePath, tag, spacePath);
      result.set(tag, spacePath);
    }
    
    return result;
  }
  
  /**
   * Clear the cache (call when vault changes significantly)
   */
  clear(): void {
    this.cache.parentTags.clear();
    this.cache.subtags.clear();
    this.cache.tagSpacePath.clear();
    this.cache.accessCount = 0;
    this.cache.lastInvalidation = Date.now();
  }
  
  /**
   * Get cache statistics for monitoring
   */
  getStats(): { 
    parentTagsSize: number; 
    subtagsSize: number; 
    tagSpacePathSize: number;
    accessCount: number;
    hitRate?: number;
  } {
    const totalLookups = this.cache.accessCount;
    return {
      parentTagsSize: this.cache.parentTags.size,
      subtagsSize: this.cache.subtags.size,
      tagSpacePathSize: this.cache.tagSpacePath.size,
      accessCount: totalLookups
    };
  }
  
  private checkInvalidation(): void {
    const now = Date.now();
    if (now - this.cache.lastInvalidation > this.invalidationInterval) {
      // Partial invalidation: keep most accessed entries
      this.partialInvalidate();
      this.cache.lastInvalidation = now;
    }
  }
  
  private partialInvalidate(): void {
    // Keep top 50% most accessed entries, remove rest
    const keepRatio = 0.5;
    
    for (const map of [this.cache.parentTags, this.cache.subtags, this.cache.tagSpacePath]) {
      const targetSize = Math.floor(map.size * keepRatio);
      if (map.size > targetSize) {
        const iterator = map.keys();
        while (map.size > targetSize) {
          const key = iterator.next().value;
          if (key !== undefined) {
            map.delete(key);
          }
        }
      }
    }
  }
  
  private setWithLimit<T>(map: Map<string, T>, key: string, value: T): void {
    if (map.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = map.keys().next().value;
      if (firstKey !== undefined) {
        map.delete(firstKey);
      }
    }
    map.set(key, value);
  }
  
  private computeParentTags(tag: string): string[] {
    if (tag.startsWith('#')) {
      tag = tag.slice(1);
    }
    
    const parts = tag.split('/');
    const result: string[] = [];
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (i === 0) {
        result.push(`#${parts[i]}`);
      } else {
        result.push(`${result[i - 1]}/${parts[i]}`);
      }
    }
    
    return result;
  }
  
  private computeSubtags(parentTag: string, allTags: Set<string>): string[] {
    const normalizedParent = parentTag.startsWith('#') ? parentTag.slice(1) : parentTag;
    const prefix = `${normalizedParent}/`;
    
    const subtags: string[] = [];
    for (const tag of allTags) {
      const normalizedTag = tag.startsWith('#') ? tag.slice(1) : tag;
      if (normalizedTag.startsWith(prefix) && normalizedTag !== normalizedParent) {
        subtags.push(tag);
      }
    }
    
    return subtags;
  }
  
  private computeTagSpacePath(tag: string): string {
    // Import here to avoid circular dependency
    const { encodeSpaceName } = require('core/utils/strings');
    const normalizedTag = tag.startsWith('#') ? tag.slice(1) : tag;
    return encodeSpaceName(`#${normalizedTag.toLowerCase()}`);
  }
}

// Singleton instance for global use
export const globalTagMemoizer = new TagMemoizer();
