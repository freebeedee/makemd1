/**
 * Adaptive LRU Cache implementation with dynamic sizing
 * @template K, V
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private baseMaxSize: number;
  private adaptiveFactor: number = 1.0;
  private accessCount: number = 0;
  private resizeThreshold: number = 1000;
  
  constructor(baseMaxSize: number = 500) {
    this.baseMaxSize = baseMaxSize;
    this.cache = new Map();
  }
  
  /**
   * Adjust cache size based on vault size
   * Call this periodically or when vault size changes
   */
  adjustSize(vaultSize: number): void {
    // Adaptive sizing: scale cache based on vault size
    // Small vaults (< 500 files): 2x multiplier
    // Medium vaults (500-2000): 1.5x multiplier
    // Large vaults (> 2000): 1x multiplier with floor
    if (vaultSize < 500) {
      this.adaptiveFactor = 2.0;
    } else if (vaultSize < 2000) {
      this.adaptiveFactor = 1.5;
    } else {
      this.adaptiveFactor = 1.0;
    }
    
    const newSize = Math.max(500, Math.floor(this.baseMaxSize * this.adaptiveFactor));
    
    // Trim cache if new size is smaller
    if (newSize < this.cache.size) {
      const iterator = this.cache.keys();
      while (this.cache.size > newSize) {
        const firstKey = iterator.next().value;
        if (firstKey !== undefined) {
          this.cache.delete(firstKey);
        }
      }
    }
  }
  
  /**
   * Get value and track access for adaptive sizing
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      this.accessCount++;
      
      // Periodically check if we should expand
      if (this.accessCount % this.resizeThreshold === 0 && this.cache.size >= this.getMaxSize()) {
        // High hit rate suggests we need more cache
        this.adaptiveFactor = Math.min(3.0, this.adaptiveFactor + 0.1);
      }
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.getMaxSize()) {
      // Delete oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
    this.accessCount = 0;
  }
  
  get size(): number {
    return this.cache.size;
  }
  
  getMaxSize(): number {
    return Math.floor(this.baseMaxSize * this.adaptiveFactor);
  }
  
  /**
   * Batch set multiple entries efficiently
   */
  setMany(entries: Array<[K, V]>): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }
  
  /**
   * Get hit rate statistics for monitoring
   */
  getStats(): { size: number; maxSize: number; accessCount: number; adaptiveFactor: number } {
    return {
      size: this.cache.size,
      maxSize: this.getMaxSize(),
      accessCount: this.accessCount,
      adaptiveFactor: this.adaptiveFactor
    };
  }
}
