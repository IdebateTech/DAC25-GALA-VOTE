import React, { useEffect, useState } from 'react';
import { Activity, Zap, Clock, Database } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor performance metrics
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // Memory usage (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0;
      
      // Simulate cache hit rate calculation
      const cacheEntries = performance.getEntriesByType('resource').filter(
        entry => entry.transferSize === 0
      );
      const totalEntries = performance.getEntriesByType('resource').length;
      const cacheHitRate = totalEntries > 0 ? (cacheEntries.length / totalEntries) * 100 : 0;

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: Math.round(memoryUsage),
        cacheHitRate: Math.round(cacheHitRate)
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Show monitor only in development
    setIsVisible(process.env.NODE_ENV === 'development');

    return () => window.removeEventListener('load', measurePerformance);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-50">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Performance Monitor
      </h4>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
          </div>
          <span className={`font-mono ${metrics.loadTime < 2000 ? 'text-green-600' : 'text-yellow-600'}`}>
            {metrics.loadTime}ms
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Render:</span>
          </div>
          <span className={`font-mono ${metrics.renderTime < 100 ? 'text-green-600' : 'text-yellow-600'}`}>
            {metrics.renderTime}ms
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Memory:</span>
          </div>
          <span className={`font-mono ${metrics.memoryUsage < 50 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.memoryUsage}%
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Cache:</span>
          </div>
          <span className={`font-mono ${metrics.cacheHitRate > 70 ? 'text-green-600' : 'text-yellow-600'}`}>
            {metrics.cacheHitRate}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;