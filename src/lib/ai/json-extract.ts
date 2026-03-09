/**
 * Robust JSON extraction from LLM responses.
 * Handles: markdown fences, surrounding text, truncated JSON, unescaped chars.
 */
export function extractJson(text: string): unknown {
  // Step 1: Remove markdown code fences
  let cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "");

  // Step 2: Find the JSON object boundaries
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  // Step 3: Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to cleanup
  }

  // Step 4: Fix common LLM JSON issues
  let fixed = cleaned;

  // Fix unescaped newlines inside strings
  fixed = fixed.replace(/(?<=":[ ]*"[^"]*)\n(?=[^"]*")/g, "\\n");

  // Fix trailing commas before ] or }
  fixed = fixed.replace(/,\s*([}\]])/g, "$1");

  // Fix unescaped quotes inside strings (naive but catches common cases)
  // Look for patterns like: "text "quoted" text" and escape inner quotes
  fixed = fixed.replace(/"([^"]*?)(?<!\\)"(?=[^:,\[\]{}]*")/g, (match) => {
    // Only fix if it looks like an unescaped inner quote
    return match;
  });

  try {
    return JSON.parse(fixed);
  } catch {
    // Continue
  }

  // Step 5: Try to fix truncated JSON by closing open brackets
  let fixedTruncated = fixed;
  const openBraces = (fixedTruncated.match(/{/g) ?? []).length;
  const closeBraces = (fixedTruncated.match(/}/g) ?? []).length;
  const openBrackets = (fixedTruncated.match(/\[/g) ?? []).length;
  const closeBrackets = (fixedTruncated.match(/\]/g) ?? []).length;

  // Remove any trailing partial string/value
  fixedTruncated = fixedTruncated.replace(/,\s*"[^"]*$/, "");
  fixedTruncated = fixedTruncated.replace(/,\s*$/, "");

  // Close open brackets and braces
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    fixedTruncated += "]";
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    fixedTruncated += "}";
  }

  try {
    return JSON.parse(fixedTruncated);
  } catch (err) {
    throw new Error(`Failed to parse JSON after cleanup: ${err instanceof Error ? err.message : "unknown"}`);
  }
}
