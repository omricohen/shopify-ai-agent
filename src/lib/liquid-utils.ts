export function extractSchemaDefaults(code: string): Record<string, string> {
  const defaults: Record<string, string> = {};
  const schemaMatch = code.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!schemaMatch) return defaults;

  try {
    const schema = JSON.parse(schemaMatch[1]);
    if (schema.settings) {
      for (const setting of schema.settings) {
        if (setting.id && setting.default !== undefined) {
          defaults[setting.id] = String(setting.default);
        }
      }
    }
  } catch {
    // Schema parse failed, return empty defaults
  }
  return defaults;
}

export function buildPreviewHtml(code: string): string {
  // Extract schema defaults before stripping
  const defaults = extractSchemaDefaults(code);
  const sectionId = "preview-1";

  let html = code
    // Remove Liquid comment blocks
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "")
    // Remove Liquid schema blocks (not visible HTML)
    .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, "")
    // Replace section.id with a stable preview ID
    .replace(/\{\{\s*section\.id\s*\}\}/g, sectionId)
    // Replace section.settings.X with schema defaults
    .replace(/\{\{\s*section\.settings\.(\w+)\s*\}\}/g, (_match, key) => {
      return defaults[key] ?? "";
    })
    // Handle section.settings with filters (e.g., | escape, | image_url)
    .replace(/\{\{\s*section\.settings\.(\w+)\s*\|[^}]*\}\}/g, (_match, key) => {
      return defaults[key] ?? "";
    })

    // ── Smart control flow handling ──

    // if/else blocks: keep only the {% else %} branch (fallback content for preview)
    .replace(/\{%-?\s*if\b[\s\S]*?-?%\}([\s\S]*?)\{%-?\s*else\s*-?%\}([\s\S]*?)\{%-?\s*endif\s*-?%\}/g, "$2")
    // if blocks without else: remove entirely (condition is false in preview)
    .replace(/\{%-?\s*if\b[\s\S]*?-?%\}[\s\S]*?\{%-?\s*endif\s*-?%\}/g, "")

    // case/when blocks: keep only the first {% when %} branch
    .replace(/\{%-?\s*case\b[\s\S]*?-?%\}\s*\{%-?\s*when\b[\s\S]*?-?%\}([\s\S]*?)\{%-?\s*(?:when|endcase)\b[\s\S]*?-?%\}[\s\S]*?\{%-?\s*endcase\s*-?%\}/g, "$1")
    // Clean up any remaining case blocks
    .replace(/\{%-?\s*case\b[\s\S]*?-?%\}([\s\S]*?)\{%-?\s*endcase\s*-?%\}/g, "$1")

    // for loops: keep inner content once (show one iteration)
    .replace(/\{%-?\s*for\b[\s\S]*?-?%\}([\s\S]*?)\{%-?\s*endfor\s*-?%\}/g, "$1")

    // Remove assign, capture, and other non-output tags
    .replace(/\{%-?\s*(?:capture|endcapture|assign|increment|decrement|paginate|endpaginate|layout|section|render|include|liquid|break|continue|cycle|tablerow|endtablerow|raw|endraw|style|endstyle|unless|endunless)\b[\s\S]*?-?%\}/g, "")
    // Remove any remaining {% %} tags
    .replace(/\{%[\s\S]*?%\}/g, "")

    // ── Variable replacements ──

    // Variables with | default: "value" — extract and use the default value
    .replace(/\{\{[^}]*\|\s*default:\s*"([^"]*)"\s*\}\}/g, "$1")
    .replace(/\{\{[^}]*\|\s*default:\s*'([^']*)'\s*\}\}/g, "$1")
    // Money filter: {{ 7800 | money }} -> $78.00
    .replace(/\{\{\s*(\d+)\s*\|\s*money\s*\}\}/g, (_m, cents) => {
      return `$${(parseInt(cents) / 100).toFixed(2)}`;
    })
    // Product image URLs with image_url filter
    .replace(/\{\{\s*product\.featured_image\s*\|[^}]*\}\}/g, "")
    .replace(/\{\{\s*product\.featured_image\.alt[^}]*\}\}/g, "Product image")
    // Product fields
    .replace(/\{\{\s*product\.title\s*\}\}/g, "Sample Product")
    .replace(/\{\{\s*product\.price\s*\|[^}]*\}\}/g, "$29.99")
    .replace(/\{\{\s*product\.compare_at_price\s*\|[^}]*\}\}/g, "$49.99")
    .replace(/\{\{\s*product\.description\s*\}\}/g, "A wonderful product for your store.")
    .replace(/\{\{\s*product\.url\s*\}\}/g, "#")
    // Routes
    .replace(/\{\{\s*routes\.\w+\s*\}\}/g, "#")
    // Placeholder SVG tags
    .replace(/\{\{\s*'[^']*'\s*\|\s*placeholder_svg_tag[^}]*\}\}/g,
      '<div style="width:100%;aspect-ratio:1;background:#e2e8f0;display:grid;place-items:center;color:#94a3b8;font-size:14px;">Product Image</div>')
    // Shop fields
    .replace(/\{\{\s*shop\.email\s*\}\}/g, "hello@example.com")
    .replace(/\{\{\s*shop\.name\s*\}\}/g, "My Store")
    .replace(/\{\{\s*shop\.address1?\s*\}\}/g, "123 Main Street")
    .replace(/\{\{\s*shop\.city\s*\}\}/g, "New York")
    .replace(/\{\{\s*shop\.province\s*\}\}/g, "NY")
    .replace(/\{\{\s*shop\.zip\s*\}\}/g, "10001")
    // Any remaining {{ ... }} — show empty string
    .replace(/\{\{[^}]*\}\}/g, "");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    img { max-width: 100%; height: auto; }
    a { color: inherit; text-decoration: none; }
    svg { max-width: 100%; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}
