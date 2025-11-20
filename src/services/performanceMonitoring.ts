// Performance Monitoring Service for Terminal
import { PerformanceMetric } from '../types/terminal.types';

export class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private observers: Set<(metrics: PerformanceMetric[]) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private maxMetrics = 1000;
  private isEnabled = false;

  /**
   * Enable performance monitoring
   */
  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.startMonitoring();
  }

  /**
   * Disable performance monitoring
   */
  disable(): void {
    this.isEnabled = false;
    this.stopMonitoring();
  }

  /**
   * Start monitoring performance
   */
  private startMonitoring(): void {
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, 1000);
  }

  /**
   * Stop monitoring performance
   */
  private stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Collect performance metrics
   */
  private collectMetrics(): void {
    const timestamp = Date.now();

    // CPU usage (simulated)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.addMetric({
        name: 'memory',
        value: memory.usedJSHeapSize / 1024 / 1024, // MB
        unit: 'MB',
        timestamp,
        category: 'memory',
      });
    }

    // Memory usage
    const memoryInfo = this.getMemoryInfo();
    memoryInfo.forEach(metric => {
      this.addMetric({
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        category: metric.category,
        tags: metric.tags,
        timestamp,
      });
    });

    // CPU usage (estimated)
    const cpuUsage = this.getCpuUsage();
    this.addMetric({
      name: cpuUsage.name,
      value: cpuUsage.value,
      unit: cpuUsage.unit,
      category: cpuUsage.category,
      timestamp,
    });

    // Network metrics
    const networkMetrics = this.getNetworkMetrics();
    networkMetrics.forEach(metric => {
      this.addMetric({
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        category: metric.category,
        tags: metric.tags,
        timestamp,
      });
    });

    // Custom performance metrics
    const customMetrics = this.getCustomMetrics();
    customMetrics.forEach(metric => {
      this.addMetric({
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        category: metric.category,
        tags: metric.tags,
        timestamp,
      });
    });

    // Notify observers
    this.notifyObservers();
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const timestamp = Date.now();

    // Browser memory API
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.push(
        {
          name: 'jsHeapSizeLimit',
          value: memory.jsHeapSizeLimit / 1024 / 1024,
          unit: 'MB',
          category: 'memory' as const,
          timestamp,
        },
        {
          name: 'totalJSHeapSize',
          value: memory.totalJSHeapSize / 1024 / 1024,
          unit: 'MB',
          category: 'memory' as const,
          timestamp,
        },
        {
          name: 'usedJSHeapSize',
          value: memory.usedJSHeapSize / 1024 / 1024,
          unit: 'MB',
          category: 'memory' as const,
          timestamp,
        }
      );
    }

    // DOM performance metrics
    const domMetrics = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (domMetrics) {
      metrics.push(
        {
          name: 'domContentLoaded',
          value: domMetrics.domContentLoadedEventEnd - domMetrics.domContentLoadedEventStart,
          unit: 'ms',
          category: 'custom' as const,
          tags: { type: 'dom' },
          timestamp,
        },
        {
          name: 'loadComplete',
          value: domMetrics.loadEventEnd - domMetrics.loadEventStart,
          unit: 'ms',
          category: 'custom' as const,
          tags: { type: 'dom' },
          timestamp,
        }
      );
    }

    return metrics;
  }

  /**
   * Get CPU usage (simulated)
   */
  private getCpuUsage(): PerformanceMetric {
    // Simulate CPU usage based on active processes and load
    const activeProcesses = this.getActiveProcessCount();
    const baseUsage = Math.random() * 100; // Simulated
    const loadAdjustedUsage = Math.min(baseUsage + activeProcesses * 2, 100);

    return {
      name: 'cpu',
      value: loadAdjustedUsage,
      unit: '%',
      category: 'cpu' as const,
      timestamp: Date.now(),
    };
  }

  /**
   * Get active process count
   */
  private getActiveProcessCount(): number {
    // Simulate active processes
    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Get network metrics
   */
  private getNetworkMetrics(): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const timestamp = Date.now();

    // Connection type
    const connection = (navigator as any).connection;
    if (connection) {
      metrics.push({
        name: 'connectionType',
        value: connection.effectiveType === '4g' ? 100 : 
               connection.effectiveType === '3g' ? 50 : 25,
        unit: 'score',
        category: 'network' as const,
        tags: { type: connection.effectiveType },
        timestamp,
      });
    }

    return metrics;
  }

  /**
   * Get custom performance metrics
   */
  private getCustomMetrics(): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const timestamp = Date.now();

    // Frame rate
    metrics.push({
      name: 'fps',
      value: this.getCurrentFPS(),
      unit: 'fps',
      category: 'custom' as const,
      timestamp,
    });

    // Event loop lag
    metrics.push({
      name: 'eventLoopLag',
      value: this.getEventLoopLag(),
      unit: 'ms',
      category: 'custom' as const,
      timestamp,
    });

    return metrics;
  }

  /**
   * Get current FPS
   */
  private getCurrentFPS(): number {
    // Simple FPS calculation
    const frames = performance.now() % 1000 < 16 ? 1 : 0;
    return frames * 60; // Simplified calculation
  }

  /**
   * Get event loop lag
   */
  private getEventLoopLag(): number {
    // Simulate event loop lag
    return Math.random() * 5; // 0-5ms lag
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Add observer
   */
  addObserver(observer: (metrics: PerformanceMetric[]) => void): void {
    this.observers.add(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer: (metrics: PerformanceMetric[]) => void): void {
    this.observers.delete(observer);
  }

  /**
   * Notify observers
   */
  private notifyObservers(): void {
    this.observers.forEach(observer => {
      try {
        observer(this.metrics);
      } catch (error) {
        console.error('Error in performance monitoring observer:', error);
      }
    });
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  /**
   * Get metrics in time range
   */
  getMetricsInRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(
      metric => metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string, timeRange?: number): number {
    let metrics = this.metrics.filter(metric => metric.name === name);

    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      metrics = metrics.filter(metric => metric.timestamp >= cutoff);
    }

    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalMetrics: number;
    categories: string[];
    recentActivity: number;
    memoryUsage: number;
    cpuUsage: number;
  } {
    const recentMetrics = this.metrics.filter(
      metric => metric.timestamp > Date.now() - 60000 // Last minute
    );

    return {
      totalMetrics: this.metrics.length,
      categories: [...new Set(this.metrics.map(m => m.category))],
      recentActivity: recentMetrics.length,
      memoryUsage: this.getAverageMetric('usedJSHeapSize', 60000),
      cpuUsage: this.getAverageMetric('cpu', 60000),
    };
  }

  /**
   * Export metrics
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getPerformanceSummary(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disable();
    this.observers.clear();
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();