import { parse } from "csv-parse/sync";

export interface ColumnAnalysis {
  name: string;
  type: "numeric" | "date" | "boolean" | "text";
  stats?: {
    min: number;
    max: number;
    sum: number;
    avg: number;
    median: number;
  };
  uniqueValues: number;
  nullCount: number;
}

export interface ParsedDocument {
  type: "csv" | "pdf" | "unknown";
  filename: string;
  content: string;
  data?: Record<string, string>[];
  summary: string;
  rowCount?: number;
  columns?: string[];
  columnAnalysis?: ColumnAnalysis[];
  insights?: string[];
}

export async function parseDocument(
  file: File | Buffer,
  filename: string
): Promise<ParsedDocument> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "csv") {
    return parseCSV(file, filename);
  } else if (ext === "pdf") {
    return parsePDF(file, filename);
  }

  return {
    type: "unknown",
    filename,
    content: "Unsupported file type",
    summary: "Unable to parse this file type. Supported formats: CSV, PDF.",
  };
}

function detectColumnType(
  values: string[]
): "numeric" | "date" | "boolean" | "text" {
  const nonEmpty = values.filter((v) => v !== "" && v != null);
  if (nonEmpty.length === 0) return "text";

  // Check boolean
  const boolSet = new Set(nonEmpty.map((v) => v.toLowerCase()));
  if (
    boolSet.size <= 2 &&
    Array.from(boolSet).every((v) =>
      ["true", "false", "yes", "no", "0", "1"].includes(v)
    )
  ) {
    return "boolean";
  }

  // Check numeric
  const numericCount = nonEmpty.filter((v) =>
    /^-?\$?\d[\d,]*\.?\d*%?$/.test(v.replace(/[$,%\s]/g, ""))
  ).length;
  if (numericCount / nonEmpty.length > 0.8) return "numeric";

  // Check date
  const dateCount = nonEmpty.filter((v) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && v.length > 4;
  }).length;
  if (dateCount / nonEmpty.length > 0.8) return "date";

  return "text";
}

function parseNumeric(v: string): number {
  return parseFloat(v.replace(/[$,%\s]/g, ""));
}

function analyzeColumns(
  records: Record<string, string>[],
  columns: string[]
): ColumnAnalysis[] {
  return columns.map((col) => {
    const values = records.map((r) => r[col] ?? "");
    const type = detectColumnType(values);
    const nonEmpty = values.filter((v) => v !== "" && v != null);
    const nullCount = values.length - nonEmpty.length;
    const uniqueValues = new Set(nonEmpty).size;

    const analysis: ColumnAnalysis = { name: col, type, uniqueValues, nullCount };

    if (type === "numeric") {
      const nums = nonEmpty
        .map(parseNumeric)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
      if (nums.length > 0) {
        const sum = nums.reduce((a, b) => a + b, 0);
        const mid = Math.floor(nums.length / 2);
        analysis.stats = {
          min: nums[0],
          max: nums[nums.length - 1],
          sum,
          avg: sum / nums.length,
          median:
            nums.length % 2 === 0
              ? (nums[mid - 1] + nums[mid]) / 2
              : nums[mid],
        };
      }
    }

    return analysis;
  });
}

function generateInsights(
  records: Record<string, string>[],
  columnAnalysis: ColumnAnalysis[]
): string[] {
  const insights: string[] = [];
  const numericCols = columnAnalysis.filter(
    (c) => c.type === "numeric" && c.stats
  );

  for (const col of numericCols) {
    const s = col.stats!;
    insights.push(
      `"${col.name}" ranges from ${s.min.toLocaleString()} to ${s.max.toLocaleString()} (avg: ${s.avg.toFixed(2)}, median: ${s.median.toFixed(2)}, total: ${s.sum.toLocaleString()})`
    );
  }

  // High null counts
  for (const col of columnAnalysis) {
    const pct = (col.nullCount / records.length) * 100;
    if (pct > 20) {
      insights.push(
        `"${col.name}" has ${pct.toFixed(0)}% missing values (${col.nullCount}/${records.length} rows)`
      );
    }
  }

  // Low cardinality text columns (potential categories)
  for (const col of columnAnalysis) {
    if (col.type === "text" && col.uniqueValues > 1 && col.uniqueValues <= 20) {
      insights.push(
        `"${col.name}" looks like a category column with ${col.uniqueValues} unique values`
      );
    }
  }

  // Date range
  const dateCols = columnAnalysis.filter((c) => c.type === "date");
  for (const col of dateCols) {
    const dates = records
      .map((r) => new Date(r[col.name]))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    if (dates.length > 0) {
      insights.push(
        `"${col.name}" spans from ${dates[0].toLocaleDateString()} to ${dates[dates.length - 1].toLocaleDateString()}`
      );
    }
  }

  return insights;
}

async function parseCSV(
  file: File | Buffer,
  filename: string
): Promise<ParsedDocument> {
  let text: string;
  if (Buffer.isBuffer(file)) {
    text = file.toString("utf-8");
  } else {
    text = await (file as File).text();
  }

  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const columns = records.length > 0 ? Object.keys(records[0]) : [];
  const preview = records.slice(0, 50);
  const columnAnalysis = analyzeColumns(records, columns);
  const insights = generateInsights(records, columnAnalysis);

  const summary = `CSV file "${filename}" with ${records.length} rows and ${columns.length} columns: ${columns.join(", ")}. First 50 rows preview available. ${insights.length} insights generated.`;

  return {
    type: "csv",
    filename,
    content: JSON.stringify(preview, null, 2),
    data: records,
    summary,
    rowCount: records.length,
    columns,
    columnAnalysis,
    insights,
  };
}

async function parsePDF(
  file: File | Buffer,
  filename: string
): Promise<ParsedDocument> {
  try {
    // eslint-disable-next-line
    const pdfParse = require("pdf-parse");
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      const arrayBuffer = await (file as File).arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const data = await pdfParse(buffer);
    const text = data.text.trim();
    const pageCount = data.numpages;

    const summary = `PDF file "${filename}" with ${pageCount} pages and ${text.length} characters of text content.`;

    return {
      type: "pdf",
      filename,
      content: text.slice(0, 50000),
      summary,
    };
  } catch (error) {
    return {
      type: "pdf",
      filename,
      content: "",
      summary: `Failed to parse PDF "${filename}": ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
