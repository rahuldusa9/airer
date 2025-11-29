import { verifyToken } from '@/lib/auth/jwt';

/**
 * Middleware to verify JWT token on protected routes
 * Usage: Add this to API routes that need authentication
 */
export async function authMiddleware(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      error: 'No authorization token provided',
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      authorized: false,
      error: 'Invalid or expired token',
    };
  }

  return {
    authorized: true,
    user: {
      userId: decoded.userId,
      email: decoded.email,
    },
  };
}

/**
 * Client-side token validation helper
 */
export async function validateClientToken() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    if (data.valid) {
      return {
        userId: data.userId,
        email: data.email,
      };
    }
    
    // Token invalid, clear it
    localStorage.removeItem('auth_token');
    return null;
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
}
