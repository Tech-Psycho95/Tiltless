// Address validation - shared with backend

/**
 * Validate and normalize Ethereum address format
 * Returns { valid: true, address: normalized } or { valid: false, error: message }
 */
export function validateAddress(address: unknown): 
  | { valid: true; address: string }
  | { valid: false; error: string } {
  
  // Type check
  if (typeof address !== "string") {
    return {
      valid: false,
      error: `Address must be a string, received ${typeof address}`,
    };
  }

  // Normalize: trim whitespace, remove zero-width chars, strip quotes, lowercase
  let normalized = address
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
    .replace(/^["']|["']$/g, "")            // Remove surrounding quotes
    .toLowerCase();

  // Length check (must be exactly 42 chars: "0x" + 40 hex digits)
  if (normalized.length !== 42) {
    return {
      valid: false,
      error: `Invalid address length: expected 42 characters (0x + 40 hex digits), got ${normalized.length}`,
    };
  }

  // Format check: must start with "0x" and contain only hex digits
  if (!/^0x[0-9a-f]{40}$/.test(normalized)) {
    // More specific error message
    if (!normalized.startsWith("0x")) {
      return {
        valid: false,
        error: `Address must start with "0x", got "${normalized.substring(0, 2)}"`,
      };
    }
    return {
      valid: false,
      error: `Address contains invalid characters. Must be 0x followed by 40 hexadecimal digits (0-9, a-f)`,
    };
  }

  return { valid: true, address: normalized };
}
