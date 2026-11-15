import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { filterFrameworks, searchVideos, searchBenchmarks, listAllBenchmarks } from "../src/matrix.js";
import { getCodeScaffold, listCodeScaffolds } from "../src/code-lab.js";

describe("SLC-002: Framework Matrix, Benchmark Encyclopedia & Code Lab", () => {
  test("BR-1: Normal path - filters frameworks by category and keyword", () => {
    // Category filter
    const ragList = filterFrameworks("rag", "");
    assert.ok(ragList.length >= 1);
    assert.ok(ragList.every((item) => item.category === "rag"));

    // Keyword search
    const results = filterFrameworks("all", "deepeval");
    assert.equal(results.length, 1);
    assert.equal(results[0].id, "deepeval");

    // Case-insensitive search
    const caseResults = filterFrameworks("all", "RAGAS");
    assert.equal(caseResults.length, 1);
    assert.equal(caseResults[0].id, "ragas");
  });

  test("BR-1: Normal path - retrieves 18+ benchmark datasets across 6 categories", () => {
    const allBenchmarks = listAllBenchmarks();
    assert.ok(allBenchmarks.length >= 18, `Should have at least 18 benchmarks, found ${allBenchmarks.length}`);

    // Check key benchmarks exist
    const mmluPro = allBenchmarks.find((b) => b.id === "mmlu-pro");
    assert.ok(mmluPro);
    assert.equal(mmluPro.name, "MMLU-Pro");
    assert.ok(mmluPro.antiContaminationMechanism.length > 5);

    const gpqa = allBenchmarks.find((b) => b.id === "gpqa");
    assert.ok(gpqa);
    assert.ok(gpqa.keyMetrics.includes("Google-Proof"));

    const sweBench = allBenchmarks.find((b) => b.id === "swe-bench");
    assert.ok(sweBench);
    assert.equal(sweBench.category, "code");

    const ifEval = allBenchmarks.find((b) => b.id === "ifeval");
    assert.ok(ifEval);
    assert.equal(ifEval.category, "instruction");

    // Category filter for benchmarks
    const codeBench = searchBenchmarks("code", "");
    assert.ok(codeBench.length >= 3);
    assert.ok(codeBench.some((b) => b.id === "swe-bench" || b.id === "bigcodebench"));

    // Keyword search for benchmarks
    const ifevalSearch = searchBenchmarks("all", "格式");
    assert.ok(ifevalSearch.length >= 1);
    assert.ok(ifevalSearch.some((b) => b.id === "ifeval"));
  });

  test("BR-2: Invalid input & regex injection safety", () => {
    // Special regex characters should not crash the filter
    const dangerousQuery = ".*+?^${}()|[]\\";
    const safeResults = filterFrameworks("all", dangerousQuery);
    assert.deepEqual(safeResults, []);

    const safeBench = searchBenchmarks("all", dangerousQuery);
    assert.deepEqual(safeBench, []);

    // Null and undefined arguments
    const nullCatResults = filterFrameworks(null, null);
    assert.ok(nullCatResults.length > 0);

    const nullBench = searchBenchmarks(null, null);
    assert.ok(nullBench.length >= 18);
  });

  test("BR-3: Boundary cases - empty query, 50+ char string, non-matching query", () => {
    // All category returns full list
    const all = filterFrameworks("all", "");
    assert.ok(all.length >= 8);

    // 50+ character string
    const longQuery = "a".repeat(60);
    const emptyResults = filterFrameworks("all", longQuery);
    assert.deepEqual(emptyResults, []);

    const emptyBench = searchBenchmarks("all", longQuery);
    assert.deepEqual(emptyBench, []);
  });

  test("BR-1 & BR-2: Code Lab scaffold retrieval", () => {
    const scaffolds = listCodeScaffolds();
    assert.equal(scaffolds.length, 4);

    const deepeval = getCodeScaffold("scaffold-deepeval");
    assert.ok(deepeval);
    assert.equal(deepeval.filename, "test_customer_support.py");
    assert.ok(deepeval.code.includes("assert_test"));
    assert.ok(deepeval.keyPoints.length >= 2);

    // Invalid id defaults to first scaffold safely
    const fallback = getCodeScaffold("non-existent-id");
    assert.equal(fallback.id, scaffolds[0].id);
  });

  test("BR-1 & BR-3: Video search helper", () => {
    const allVideos = searchVideos("");
    assert.ok(allVideos.length >= 6);

    const hamel = searchVideos("Hamel");
    assert.equal(hamel.length, 1);
    assert.ok(hamel[0].speakers.includes("Hamel"));
  });
});
