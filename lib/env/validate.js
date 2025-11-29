/**
 * Environment Configuration Validator
 * Validates that all required environment variables are present
 */

export function validateEnv() {
  const required = {
    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI,
    
    // Gemini API (server-side only)
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    
    // JWT Secret
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const missing = [];
  const present = [];

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    present,
    message: missing.length > 0 
      ? `Missing required environment variables: ${missing.join(', ')}. Please check .env.local and restart the server.`
      : 'All environment variables are configured correctly.'
  };
}

export function getEnvStatus() {
  return {
    nodeEnv: process.env.NODE_ENV,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!process.env.MONGODB_URI,
  };
}
