/**
 * CORS configuration helper
 * Reads ALLOWED_ORIGINS from environment and always includes localhost for development
 */

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS || '';
  
  // Parse comma-separated origins, trim whitespace and trailing slashes
  const configuredOrigins = envOrigins
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(origin => origin.length > 0);

  // Always allow localhost for local development
  const localOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
  ];

  return [...localOrigins, ...configuredOrigins];
}

/**
 * Generate CORS headers for a given origin
 * Only returns Access-Control-Allow-Origin if the origin is in the allowed list
 */
export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
  };

  if (origin) {
    const allowedOrigins = getAllowedOrigins();
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    
    if (allowedOrigins.includes(normalizedOrigin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }

  return headers;
}
