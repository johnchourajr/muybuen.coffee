"use client";

import {
  PerformanceMetrics,
  performanceMonitor,
} from "@/lib/performance-monitor";
import { useEffect, useState } from "react";

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getPerformanceSummary());
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    // Initial load
    setMetrics(performanceMonitor.getPerformanceSummary());
  }, []);

  const handleSaveSnapshot = () => {
    const name = prompt("Enter snapshot name (e.g., 'before-caching'):");
    if (name) {
      performanceMonitor.saveSnapshot(name);
    }
  };

  const handleCompareSnapshot = () => {
    const name = prompt("Enter snapshot name to compare with:");
    if (name) {
      performanceMonitor.compareWithSnapshot(name);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all performance metrics?")) {
      performanceMonitor.reset();
      setMetrics(performanceMonitor.getPerformanceSummary());
    }
  };

  if (!metrics) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-5 left-16 z-50 bg-primary hover:bg-primary text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        style={{ fontSize: "14px" }}
      >
        Performance
      </button>

      {/* Dashboard */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-white shadow-2xl rounded-lg p-6 w-96 max-h-96 overflow-y-auto border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary">
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-primary hover:text-primary/75"
            >
              ✕
            </button>
          </div>

          {/* Auto-refresh toggle */}
          <div className="mb-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-primary">Auto-refresh</span>
            </label>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded">
              <div className="text-sm text-primary">API Calls</div>
              <div className="text-xl font-bold text-primary">
                {metrics.totalApiCalls}
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded">
              <div className="text-sm text-primary">Cache Hit Rate</div>
              <div className="text-xl font-bold text-primary">
                {metrics.cacheHitRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded">
              <div className="text-sm text-primary">Avg Response</div>
              <div className="text-xl font-bold text-primary">
                {metrics.averageResponseTime.toFixed(0)}ms
              </div>
            </div>
            <div className="bg-primary/10 p-3 rounded">
              <div className="text-sm text-primary">Duplicates</div>
              <div className="text-xl font-bold text-primary">
                {metrics.duplicateQueries}
              </div>
            </div>
          </div>

          {/* Error Rate */}
          {metrics.errorRate > 0 && (
            <div className="bg-primary/10 p-3 rounded mb-4">
              <div className="text-sm text-primary">Error Rate</div>
              <div className="text-xl font-bold text-primary">
                {metrics.errorRate.toFixed(1)}%
              </div>
            </div>
          )}

          {/* Endpoints Breakdown */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-primary mb-2">
              API Calls by Endpoint
            </h4>
            <div className="space-y-1">
              {Object.entries(metrics.apiCallsByEndpoint).map(
                ([endpoint, count]) => (
                  <div key={endpoint} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-48">
                      {endpoint}
                    </span>
                    <span className="text-primary font-medium">{count}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Data Transfer */}
          <div className="mb-4">
            <div className="text-sm text-primary">
              Data Transferred:{" "}
              {(metrics.totalDataTransferred / 1024).toFixed(1)}KB
            </div>
            <div className="text-sm text-primary">
              Unique Queries: {metrics.uniqueQueries}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveSnapshot}
                className="bg-primary/10 hover:bg-primary/25 text-primary px-3 py-2 rounded text-sm transition-colors"
              >
                📸 Save Snapshot
              </button>
              <button
                onClick={handleCompareSnapshot}
                className="bg-primary/10 hover:bg-primary/25 text-primary px-3 py-2 rounded text-sm transition-colors"
              >
                🔄 Compare
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => performanceMonitor.printReport()}
                className="bg-primary/10 hover:bg-primary/25 text-primary px-3 py-2 rounded text-sm transition-colors"
              >
                📋 Print Report
              </button>
              <button
                onClick={handleReset}
                className="bg-primary/10 hover:bg-primary/25 text-primary px-3 py-2 rounded text-sm transition-colors"
              >
                🗑️ Reset
              </button>
            </div>
          </div>

          {/* Slowest Requests */}
          {metrics.slowestRequests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Slowest Requests
              </h4>
              <div className="space-y-1">
                {metrics.slowestRequests.slice(0, 3).map((request, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-32">
                        {request.endpoint}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {request.responseTime}ms
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-500">
                      {request.cacheHit ? "✅ Cached" : "❌ Not cached"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
