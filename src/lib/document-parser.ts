import { parse } from "csv-parse/sync";

export interface ParsedDocument {
  type: "csv" | "pdf" | "unknown";
  filename: string;
  content: string;
  data?: Record<string, string>[];
  summary: string;
  rowCount?: number;
  columns?: string[];
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
  const preview = records.slice(0, 5);

  const summary = `CSV file "${filename}" with ${records.length} rows and ${columns.length} columns: ${columns.join(", ")}. First 5 rows preview available.`;

  return {
    type: "csv",
    filename,
    content: JSON.stringify(preview, null, 2),
    data: records,
    summary,
    rowCount: records.length,
    columns,
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
      content: text.slice(0, 10000), // Limit content size
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
