import jwt from 'jsonwebtoken';

// Use a secure secret key (in production, store in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

/**
 * Generate a JWT token for a user
 * @param {Object} payload - User data to encode
 * @param {string} payload.userId - User ID
 * @param {string} payload.username - Username
 * @param {string} payload.email - User email
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  const token = jwt.sign(
    {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
  return token;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

/**
 * Refresh a JWT token (generate new token with same payload)
 * @param {string} token - Current JWT token
 * @returns {string|null} New JWT token or null if invalid
 */
export function refreshToken(token) {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  return generateToken({
    userId: decoded.userId,
    email: decoded.email,
  });
}
