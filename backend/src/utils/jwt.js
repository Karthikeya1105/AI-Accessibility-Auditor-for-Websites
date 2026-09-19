import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_a11y_auditor_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Signs a JWT payload for an authenticated user.
 * @param {object} payload 
 * @returns {string} Signed JWT token string
 */
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JWT token.
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
