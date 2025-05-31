"use client";

export interface APICallMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  status: number;
  cacheHit: boolean;
  timestamp: number;
  size?: number;
  queryParams?: Record<string, string>;
}

export interface PerformanceMetrics {
  totalApiCalls: number;
  cacheHitRate: number;
  averageResponseTime: number;
  apiCallsByEndpoint: Record<string, number>;
  totalDataTransferred: number;
  slowestRequests: APICallMetrics[];
  errorRate: number;
  uniqueQueries: number;
  duplicateQueries: number;
}

class PerformanceMonitor {
  private metrics: APICallMetrics[] = [];
  private sessionStart: number = Date.now();
  private isDev = process.env.NODE_ENV === "development";

  // Track an API call
  trackAPICall(metric: Omit<APICallMetrics, "timestamp">) {
    const fullMetric: APICallMetrics = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    if (this.isDev) {
      console.log("📊 API Call:", {
        endpoint: metric.endpoint,
        responseTime: `${metric.responseTime}ms`,
        cacheHit: metric.cacheHit ? "✅ CACHE HIT" : "❌ CACHE MISS",
        status: metric.status,
      });
    }
  }

  // Get current performance summary
  getPerformanceSummary(): PerformanceMetrics {
    const total = this.metrics.length;
    const cacheHits = this.metrics.filter((m) => m.cacheHit).length;
    const errors = this.metrics.filter((m) => m.status >= 400).length;

    // Group by endpoint
    const byEndpoint: Record<string, number> = {};
    this.metrics.forEach((m) => {
      byEndpoint[m.endpoint] = (byEndpoint[m.endpoint] || 0) + 1;
    });

    // Calculate unique vs duplicate queries
    const querySignatures = new Set();
    let duplicates = 0;

    this.metrics.forEach((m) => {
      const signature = `${m.endpoint}${JSON.stringify(m.queryParams || {})}`;
      if (querySignatures.has(signature)) {
        duplicates++;
      } else {
        querySignatures.add(signature);
      }
    });

    return {
      totalApiCalls: total,
      cacheHitRate: total > 0 ? (cacheHits / total) * 100 : 0,
      averageResponseTime:
        total > 0
          ? this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / total
          : 0,
      apiCallsByEndpoint: byEndpoint,
      totalDataTransferred: this.metrics.reduce(
        (sum, m) => sum + (m.size || 0),
        0,
      ),
      slowestRequests: this.metrics
        .sort((a, b) => b.responseTime - a.responseTime)
        .slice(0, 5),
      errorRate: total > 0 ? (errors / total) * 100 : 0,
      uniqueQueries: querySignatures.size,
      duplicateQueries: duplicates,
    };
  }

  // Get detailed breakdown by endpoint
  getEndpointBreakdown() {
    const breakdown: Record<
      string,
      {
        count: number;
        averageTime: number;
        cacheHitRate: number;
        errorRate: number;
        totalSize: number;
      }
    > = {};

    this.metrics.forEach((metric) => {
      if (!breakdown[metric.endpoint]) {
        breakdown[metric.endpoint] = {
          count: 0,
          averageTime: 0,
          cacheHitRate: 0,
          errorRate: 0,
          totalSize: 0,
        };
      }

      const ep = breakdown[metric.endpoint];
      ep.count++;
      ep.averageTime =
        (ep.averageTime * (ep.count - 1) + metric.responseTime) / ep.count;
      ep.cacheHitRate =
        (ep.cacheHitRate * (ep.count - 1)) / ep.count +
        (metric.cacheHit ? 100 / ep.count : 0);
      ep.errorRate =
        (ep.errorRate * (ep.count - 1)) / ep.count +
        (metric.status >= 400 ? 100 / ep.count : 0);
      ep.totalSize += metric.size || 0;
    });

    return breakdown;
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      sessionStart: this.sessionStart,
      sessionDuration: Date.now() - this.sessionStart,
      summary: this.getPerformanceSummary(),
      breakdown: this.getEndpointBreakdown(),
      rawMetrics: this.metrics,
    };
  }

  // Print performance report to console
  printReport() {
    const summary = this.getPerformanceSummary();
    const breakdown = this.getEndpointBreakdown();

    console.group("🎯 PERFORMANCE REPORT");
    console.log("📊 Summary:", {
      "Total API Calls": summary.totalApiCalls,
      "Cache Hit Rate": `${summary.cacheHitRate.toFixed(1)}%`,
      "Average Response Time": `${summary.averageResponseTime.toFixed(0)}ms`,
      "Error Rate": `${summary.errorRate.toFixed(1)}%`,
      "Unique Queries": summary.uniqueQueries,
      "Duplicate Queries": summary.duplicateQueries,
      "Data Transferred": `${(summary.totalDataTransferred / 1024).toFixed(1)}KB`,
    });

    console.log("📈 By Endpoint:", breakdown);

    if (summary.slowestRequests.length > 0) {
      console.log(
        "🐌 Slowest Requests:",
        summary.slowestRequests.map((r) => ({
          endpoint: r.endpoint,
          time: `${r.responseTime}ms`,
          cacheHit: r.cacheHit,
        })),
      );
    }
    console.groupEnd();
  }

  // Reset metrics (useful for before/after comparisons)
  reset() {
    this.metrics = [];
    this.sessionStart = Date.now();
  }

  // Save current metrics snapshot
  saveSnapshot(name: string) {
    const snapshot = this.exportMetrics();
    localStorage.setItem(`perf-snapshot-${name}`, JSON.stringify(snapshot));
    console.log(`📸 Performance snapshot saved: ${name}`);
  }

  // Load and compare with saved snapshot
  compareWithSnapshot(name: string) {
    const savedData = localStorage.getItem(`perf-snapshot-${name}`);
    if (!savedData) {
      console.warn(`No snapshot found: ${name}`);
      return null;
    }

    const saved = JSON.parse(savedData);
    const current = this.exportMetrics();

    const comparison = {
      apiCalls: {
        before: saved.summary.totalApiCalls,
        after: current.summary.totalApiCalls,
        change: current.summary.totalApiCalls - saved.summary.totalApiCalls,
        improvement:
          saved.summary.totalApiCalls > 0
            ? ((saved.summary.totalApiCalls - current.summary.totalApiCalls) /
                saved.summary.totalApiCalls) *
              100
            : 0,
      },
      cacheHitRate: {
        before: saved.summary.cacheHitRate,
        after: current.summary.cacheHitRate,
        change: current.summary.cacheHitRate - saved.summary.cacheHitRate,
      },
      responseTime: {
        before: saved.summary.averageResponseTime,
        after: current.summary.averageResponseTime,
        change:
          current.summary.averageResponseTime -
          saved.summary.averageResponseTime,
        improvement:
          saved.summary.averageResponseTime > 0
            ? ((saved.summary.averageResponseTime -
                current.summary.averageResponseTime) /
                saved.summary.averageResponseTime) *
              100
            : 0,
      },
      duplicateQueries: {
        before: saved.summary.duplicateQueries,
        after: current.summary.duplicateQueries,
        change:
          current.summary.duplicateQueries - saved.summary.duplicateQueries,
        improvement:
          saved.summary.duplicateQueries > 0
            ? ((saved.summary.duplicateQueries -
                current.summary.duplicateQueries) /
                saved.summary.duplicateQueries) *
              100
            : 0,
      },
    };

    console.group("🔄 BEFORE/AFTER COMPARISON");
    console.log("📞 API Calls:", {
      before: comparison.apiCalls.before,
      after: comparison.apiCalls.after,
      change: comparison.apiCalls.change,
      improvement: `${comparison.apiCalls.improvement.toFixed(1)}%`,
    });
    console.log("💾 Cache Hit Rate:", {
      before: `${comparison.cacheHitRate.before.toFixed(1)}%`,
      after: `${comparison.cacheHitRate.after.toFixed(1)}%`,
      change: `${comparison.cacheHitRate.change.toFixed(1)}%`,
    });
    console.log("⚡ Response Time:", {
      before: `${comparison.responseTime.before.toFixed(0)}ms`,
      after: `${comparison.responseTime.after.toFixed(0)}ms`,
      change: `${comparison.responseTime.change.toFixed(0)}ms`,
      improvement: `${comparison.responseTime.improvement.toFixed(1)}%`,
    });
    console.log("🔄 Duplicate Queries:", {
      before: comparison.duplicateQueries.before,
      after: comparison.duplicateQueries.after,
      change: comparison.duplicateQueries.change,
      improvement: `${comparison.duplicateQueries.improvement.toFixed(1)}%`,
    });
    console.groupEnd();

    return comparison;
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to wrap fetch with monitoring
export const monitoredFetch = async (
  url: string,
  options: RequestInit = {},
  metadata: { endpoint?: string; queryParams?: Record<string, string> } = {},
): Promise<Response> => {
  const startTime = Date.now();
  const endpoint = metadata.endpoint || new URL(url).pathname;

  try {
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;

    // Check if response was served from cache
    const cacheHit =
      response.headers.get("x-cache") === "HIT" ||
      response.headers.get("cf-cache-status") === "HIT" ||
      responseTime < 50; // Very fast responses likely from cache

    // Get response size if available
    const contentLength = response.headers.get("content-length");
    const size = contentLength ? parseInt(contentLength) : undefined;

    performanceMonitor.trackAPICall({
      endpoint,
      method: options.method || "GET",
      responseTime,
      status: response.status,
      cacheHit,
      size,
      queryParams: metadata.queryParams,
    });

    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;

    performanceMonitor.trackAPICall({
      endpoint,
      method: options.method || "GET",
      responseTime,
      status: 0, // Network error
      cacheHit: false,
      queryParams: metadata.queryParams,
    });

    throw error;
  }
};

// Development helper to add monitoring controls to window
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).performanceMonitor = performanceMonitor;
  console.log("🛠️ Performance monitor available at window.performanceMonitor");
}
