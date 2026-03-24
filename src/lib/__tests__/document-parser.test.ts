import { describe, it, expect } from "vitest";
import { parseDocument } from "../document-parser";

describe("parseDocument — CSV parsing", () => {
  it("extracts columns correctly", async () => {
    const csv = Buffer.from(
      "name,price,category\nWidget,9.99,Gadgets\nGizmo,14.50,Gadgets\n"
    );
    const result = await parseDocument(csv, "products.csv");

    expect(result.type).toBe("csv");
    expect(result.columns).toEqual(["name", "price", "category"]);
    expect(result.rowCount).toBe(2);
  });

  it("detects numeric column types", async () => {
    const csv = Buffer.from(
      "item,price,qty\nA,10.00,5\nB,20.00,3\nC,15.00,8\n"
    );
    const result = await parseDocument(csv, "data.csv");

    const priceCol = result.columnAnalysis?.find((c) => c.name === "price");
    expect(priceCol?.type).toBe("numeric");
    expect(priceCol?.stats).toBeDefined();
    expect(priceCol?.stats?.min).toBe(10);
    expect(priceCol?.stats?.max).toBe(20);
    expect(priceCol?.stats?.sum).toBe(45);
  });

  it("detects text column types", async () => {
    const csv = Buffer.from(
      "name,city\nAlice,NYC\nBob,LA\nCharlie,Chicago\n"
    );
    const result = await parseDocument(csv, "people.csv");

    const nameCol = result.columnAnalysis?.find((c) => c.name === "name");
    expect(nameCol?.type).toBe("text");
  });

  it("detects date column types", async () => {
    const csv = Buffer.from(
      "event,date\nLaunch,2024-01-15\nUpdate,2024-03-20\nRelease,2024-06-01\n"
    );
    const result = await parseDocument(csv, "events.csv");

    const dateCol = result.columnAnalysis?.find((c) => c.name === "date");
    expect(dateCol?.type).toBe("date");
  });

  it("generates a summary with row and column counts", async () => {
    const csv = Buffer.from(
      "a,b,c\n1,2,3\n4,5,6\n"
    );
    const result = await parseDocument(csv, "test.csv");

    expect(result.summary).toContain("test.csv");
    expect(result.summary).toContain("2 rows");
    expect(result.summary).toContain("3 columns");
  });

  it("computes numeric statistics correctly (avg, median)", async () => {
    const csv = Buffer.from(
      "val\n10\n20\n30\n40\n50\n"
    );
    const result = await parseDocument(csv, "nums.csv");

    const valCol = result.columnAnalysis?.find((c) => c.name === "val");
    expect(valCol?.stats?.avg).toBe(30);
    expect(valCol?.stats?.median).toBe(30);
    expect(valCol?.stats?.sum).toBe(150);
  });

  it("handles empty CSV (headers only, no data rows)", async () => {
    const csv = Buffer.from("name,price\n");
    const result = await parseDocument(csv, "empty.csv");

    expect(result.type).toBe("csv");
    expect(result.rowCount).toBe(0);
    expect(result.columns).toEqual([]);
  });

  it("returns unknown type for unsupported file extensions", async () => {
    const buf = Buffer.from("some random content");
    const result = await parseDocument(buf, "data.xyz");

    expect(result.type).toBe("unknown");
    expect(result.summary).toContain("Unable to parse");
  });

  it("generates insights for numeric columns", async () => {
    const csv = Buffer.from(
      "product,revenue\nA,100\nB,200\nC,300\n"
    );
    const result = await parseDocument(csv, "sales.csv");

    expect(result.insights).toBeDefined();
    expect(result.insights!.length).toBeGreaterThan(0);
    // Should mention the revenue column range
    const revenueInsight = result.insights!.find((i) => i.includes("revenue"));
    expect(revenueInsight).toBeDefined();
  });

  it("identifies low-cardinality text columns as categories", async () => {
    const csv = Buffer.from(
      "name,status\nA,active\nB,inactive\nC,active\nD,pending\n"
    );
    const result = await parseDocument(csv, "items.csv");

    // Both "name" (4 unique) and "status" (3 unique) qualify as category columns
    const categoryInsights = result.insights?.filter((i) =>
      i.includes("category")
    );
    expect(categoryInsights).toBeDefined();
    expect(categoryInsights!.length).toBeGreaterThanOrEqual(1);
  });
});
