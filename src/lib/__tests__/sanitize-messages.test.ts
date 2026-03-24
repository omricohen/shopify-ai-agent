import { describe, it, expect } from "vitest";
import { sanitizeMessages } from "../chat-utils";

describe("sanitizeMessages", () => {
  it("passes through messages without parts unchanged", () => {
    const messages = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ];
    expect(sanitizeMessages(messages)).toEqual(messages);
  });

  it("keeps completed tool parts (state: output-available)", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          { type: "tool-invocation", state: "output-available", toolName: "get_products" },
        ],
      },
    ];
    const result = sanitizeMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].parts).toHaveLength(1);
    expect(result[0].parts[0].state).toBe("output-available");
  });

  it("removes incomplete tool parts (state: call)", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          { type: "text", text: "Let me check..." },
          { type: "tool-invocation", state: "call", toolName: "get_products" },
        ],
      },
    ];
    const result = sanitizeMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].parts).toHaveLength(1);
    expect(result[0].parts[0].type).toBe("text");
  });

  it("removes partial-call tool parts", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          { type: "text", text: "Looking up..." },
          { type: "tool-invocation", state: "partial-call", toolName: "get_orders" },
        ],
      },
    ];
    const result = sanitizeMessages(messages);
    expect(result[0].parts).toHaveLength(1);
    expect(result[0].parts[0].type).toBe("text");
  });

  it("always keeps text parts", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          { type: "text", text: "Here are the results" },
        ],
      },
    ];
    const result = sanitizeMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].parts[0].text).toBe("Here are the results");
  });

  it("filters out empty assistant messages (all tool parts removed, no text)", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          { type: "tool-invocation", state: "call", toolName: "get_products" },
        ],
      },
    ];
    const result = sanitizeMessages(messages);
    expect(result).toHaveLength(0);
  });

  it("never filters out user messages even if they have no content parts", () => {
    const messages = [
      {
        role: "user",
        parts: [
          { type: "tool-result", state: "call", toolName: "get_products" },
        ],
      },
    ];
    const result = sanitizeMessages(messages);
    // User messages should not be filtered even when content check fails
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
  });

  it("handles a mix of messages correctly", () => {
    const messages = [
      { role: "user", content: "Show me products" },
      {
        role: "assistant",
        parts: [
          { type: "text", text: "Fetching..." },
          { type: "tool-invocation", state: "output-available", toolName: "get_products" },
        ],
      },
      {
        role: "assistant",
        parts: [
          { type: "tool-invocation", state: "call", toolName: "get_orders" },
        ],
      },
      { role: "user", content: "Thanks" },
    ];
    const result = sanitizeMessages(messages);
    // First user msg, assistant with text+completed tool, last user msg
    // The empty assistant (only incomplete tool) should be removed
    expect(result).toHaveLength(3);
    expect(result[0].content).toBe("Show me products");
    expect(result[1].parts).toHaveLength(2);
    expect(result[2].content).toBe("Thanks");
  });
});
