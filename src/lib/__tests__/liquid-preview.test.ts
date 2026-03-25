import { describe, it, expect } from "vitest";
import { extractSchemaDefaults, buildPreviewHtml } from "../liquid-utils";

describe("extractSchemaDefaults", () => {
  it("parses schema block and returns defaults map", () => {
    const code = `
<div>{{ section.settings.heading }}</div>
{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Welcome" },
    { "type": "color", "id": "bg_color", "label": "Background", "default": "#ffffff" }
  ]
}
{% endschema %}
`;
    const defaults = extractSchemaDefaults(code);
    expect(defaults).toEqual({
      heading: "Welcome",
      bg_color: "#ffffff",
    });
  });

  it("returns empty object for code without schema", () => {
    const code = "<div>Hello</div>";
    expect(extractSchemaDefaults(code)).toEqual({});
  });

  it("handles malformed JSON gracefully", () => {
    const code = `{% schema %}{ this is not valid json {% endschema %}`;
    expect(extractSchemaDefaults(code)).toEqual({});
  });

  it("skips settings without a default value", () => {
    const code = `
{% schema %}
{
  "name": "Test",
  "settings": [
    { "type": "text", "id": "title", "label": "Title" },
    { "type": "text", "id": "subtitle", "label": "Subtitle", "default": "Hello" }
  ]
}
{% endschema %}
`;
    const defaults = extractSchemaDefaults(code);
    expect(defaults).toEqual({ subtitle: "Hello" });
    expect(defaults.title).toBeUndefined();
  });

  it("converts numeric defaults to strings", () => {
    const code = `
{% schema %}
{
  "name": "Test",
  "settings": [
    { "type": "range", "id": "columns", "default": 3 }
  ]
}
{% endschema %}
`;
    const defaults = extractSchemaDefaults(code);
    expect(defaults.columns).toBe("3");
  });
});

describe("buildPreviewHtml", () => {
  it("replaces section.settings with schema defaults", () => {
    const code = `
<h1>{{ section.settings.heading }}</h1>
{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "heading", "default": "Welcome Home" }
  ]
}
{% endschema %}
`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("Welcome Home");
    expect(html).not.toContain("section.settings.heading");
  });

  it("replaces section.id with stable ID", () => {
    const code = `<div id="section-{{ section.id }}">content</div>`;
    const html = buildPreviewHtml(code);
    expect(html).toContain('id="section-preview-1"');
  });

  it("strips Liquid control tags and uses else branch for preview", () => {
    const code = `{% if collection %}<p>has collection</p>{% else %}<p>fallback</p>{% endif %}`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("<p>fallback</p>");
    expect(html).not.toContain("has collection");
    expect(html).not.toContain("{% if");
    expect(html).not.toContain("{% endif");
  });

  it("converts money filter ({{ 7800 | money }} -> $78.00)", () => {
    const code = `<span>{{ 7800 | money }}</span>`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("$78.00");
  });

  it("replaces product fields with placeholders", () => {
    const code = `<h2>{{ product.title }}</h2><p>{{ product.description }}</p>`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("Sample Product");
    expect(html).toContain("A wonderful product for your store.");
  });

  it("replaces product.price with placeholder value", () => {
    const code = `<span>{{ product.price | money }}</span>`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("$29.99");
  });

  it("wraps output in a valid HTML document", () => {
    const code = `<p>Hello</p>`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html>");
    expect(html).toContain("<head>");
    expect(html).toContain("<body>");
    expect(html).toContain("</html>");
  });

  it("removes schema blocks from output", () => {
    const code = `
<p>Content</p>
{% schema %}
{ "name": "Test", "settings": [] }
{% endschema %}
`;
    const html = buildPreviewHtml(code);
    expect(html).not.toContain("{% schema %}");
    expect(html).not.toContain('"name": "Test"');
  });

  it("replaces shop fields with placeholders", () => {
    const code = `<p>{{ shop.name }} - {{ shop.email }}</p>`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("My Store");
    expect(html).toContain("hello@example.com");
  });

  it("extracts default filter values", () => {
    const code = `<p>{{ some_var | default: "Fallback Text" }}</p>`;
    const html = buildPreviewHtml(code);
    expect(html).toContain("Fallback Text");
  });
});
