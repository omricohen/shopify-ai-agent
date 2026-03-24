// Sanitize UI messages to remove incomplete tool call/result pairs.
// When a tool execution times out or fails mid-stream, the frontend may
// store a tool invocation part without the corresponding result, causing
// OpenAI to reject the next request with "Tool result is missing for tool call".
export function sanitizeMessages(messages: any[]): any[] {
  return messages
    .map((msg: any) => {
      if (!msg.parts) return msg;

      const sanitizedParts = msg.parts.filter((part: any) => {
        // Keep non-tool parts as-is (text, etc.)
        if (!part.type?.startsWith("tool-")) return true;
        // Only keep tool parts that have completed with a result
        return part.state === "output-available";
      });

      // If all tool parts were removed and no text remains, skip the message
      const hasContent = sanitizedParts.some(
        (p: any) => p.type === "text" || p.type?.startsWith("tool-")
      );
      if (!hasContent && msg.role === "assistant") return null;

      return { ...msg, parts: sanitizedParts };
    })
    .filter(Boolean);
}
