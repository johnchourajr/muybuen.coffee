"use client";

import { performanceMonitor } from "@/lib/performance-monitor";

/**
 * Benchmark helper utilities for testing API performance
 */

export const benchmarkScenarios = {
  // Test scenario 1: Multiple searches for the same location
  repeatedSearch: async (
    location: string = "San Francisco, CA",
    iterations: number = 5,
  ) => {
    console.group(
      `🧪 Benchmark: Repeated Search (${iterations}x for "${location}")`,
    );

    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();

      try {
        const response = await fetch(
          `/api/search/yelp?location=${encodeURIComponent(location)}`,
        );
        const data = await response.json();
        const duration = Date.now() - startTime;

        results.push(duration);
        console.log(`Iteration ${i + 1}: ${duration}ms`);

        // Small delay between requests
        if (i < iterations - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error in iteration ${i + 1}:`, error);
      }
    }

    const avgTime =
      results.reduce((sum, time) => sum + time, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);

    console.log(`📊 Results:`, {
      average: `${avgTime.toFixed(0)}ms`,
      min: `${minTime}ms`,
      max: `${maxTime}ms`,
      improvement:
        minTime < avgTime
          ? `${(((avgTime - minTime) / avgTime) * 100).toFixed(1)}% faster when cached`
          : "No caching detected",
    });

    console.groupEnd();
    return { average: avgTime, min: minTime, max: maxTime, results };
  },

  // Test scenario 2: Different autocomplete queries
  autocompleteTest: async (
    queries: string[] = ["San Fr", "New Y", "Los An", "San Fr"],
  ) => {
    console.group(`🧪 Benchmark: Autocomplete Test`);

    const results: Array<{ query: string; time: number; cached?: boolean }> =
      [];

    for (const query of queries) {
      const startTime = Date.now();

      try {
        const response = await fetch(
          `/api/search/googleautocomplete?input=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        const duration = Date.now() - startTime;

        // Assume cached if very fast
        const cached = duration < 100;

        results.push({ query, time: duration, cached });
        console.log(`"${query}": ${duration}ms ${cached ? "(cached)" : ""}`);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error for "${query}":`, error);
      }
    }

    const cachedQueries = results.filter((r) => r.cached);
    const uncachedQueries = results.filter((r) => !r.cached);

    console.log(`📊 Results:`, {
      totalQueries: results.length,
      cached: cachedQueries.length,
      uncached: uncachedQueries.length,
      avgCachedTime:
        cachedQueries.length > 0
          ? `${(cachedQueries.reduce((sum, r) => sum + r.time, 0) / cachedQueries.length).toFixed(0)}ms`
          : "N/A",
      avgUncachedTime:
        uncachedQueries.length > 0
          ? `${(uncachedQueries.reduce((sum, r) => sum + r.time, 0) / uncachedQueries.length).toFixed(0)}ms`
          : "N/A",
    });

    console.groupEnd();
    return results;
  },

  // Test scenario 3: Business detail fetching
  businessDetailTest: async (
    businessIds: string[] = [
      "blue-bottle-coffee-san-francisco",
      "philz-coffee-mission-san-francisco",
    ],
  ) => {
    console.group(`🧪 Benchmark: Business Detail Test`);

    const results: Array<{ id: string; time: number; cached?: boolean }> = [];

    // Test each business twice to check caching
    const testIds = [...businessIds, ...businessIds];

    for (const businessId of testIds) {
      const startTime = Date.now();

      try {
        const response = await fetch(`/api/business/${businessId}`);
        const data = await response.json();
        const duration = Date.now() - startTime;

        // Assume cached if very fast
        const cached = duration < 100;

        results.push({ id: businessId, time: duration, cached });
        console.log(`${businessId}: ${duration}ms ${cached ? "(cached)" : ""}`);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error for "${businessId}":`, error);
      }
    }

    console.log(
      `📊 Results:`,
      results.map((r) => `${r.id}: ${r.time}ms`),
    );
    console.groupEnd();
    return results;
  },

  // Run all scenarios
  runAll: async () => {
    console.group("🚀 COMPREHENSIVE BENCHMARK SUITE");

    // Save initial state
    performanceMonitor.saveSnapshot("benchmark-start");

    const results = {
      repeatedSearch: await benchmarkScenarios.repeatedSearch(),
      autocomplete: await benchmarkScenarios.autocompleteTest(),
      businessDetails: await benchmarkScenarios.businessDetailTest(),
    };

    // Print final report
    performanceMonitor.printReport();

    console.groupEnd();
    return results;
  },
};

// Helper to simulate user behavior
export const simulateUserSession = async () => {
  console.group("👤 Simulating User Session");

  // User searches for coffee in SF
  await fetch("/api/search/yelp?location=San Francisco, CA");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // User refines search (typing autocomplete)
  await fetch("/api/search/googleautocomplete?input=San Fr");
  await new Promise((resolve) => setTimeout(resolve, 200));
  await fetch("/api/search/googleautocomplete?input=San Fra");
  await new Promise((resolve) => setTimeout(resolve, 200));

  // User clicks on a coffee shop
  await fetch("/api/business/blue-bottle-coffee-san-francisco");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // User goes back and searches again (should be cached)
  await fetch("/api/search/yelp?location=San Francisco, CA");

  console.log("✅ User session simulation complete");
  console.groupEnd();
};

// Add to window for development testing
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).benchmark = benchmarkScenarios;
  (window as any).simulateUserSession = simulateUserSession;
  console.log("🛠️ Benchmark utilities available at window.benchmark");
}
