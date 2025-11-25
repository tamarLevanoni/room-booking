import '../config'; // Load env vars FIRST
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories';
import { HttpErrors } from '../utils/HttpError';

/**
 * JWT Payload Interface
 */
interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Login Response Interface
 */
interface LoginResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * User Response Interface (for register)
 */
interface UserResponse {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AuthService
 *
 * Handles authentication business logic including:
 * - User registration with password hashing
 * - Login with JWT token generation
 * - Token refresh and verification
 */
export class AuthService {
  private readonly bcryptRounds: number;
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    // Load configuration from environment variables
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    this.jwtSecret = process.env.JWT_SECRET || '';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';
    this.accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

    // Validate required secrets
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is required in environment variables');
    }
    if (!this.jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is required in environment variables');
    }
    if (this.jwtSecret === this.jwtRefreshSecret) {
      throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different for security');
    }
  }

  /**
   * Register a new user
   *
   * @param email - User's email address
   * @param password - User's plain text password (will be hashed)
   * @param name - User's full name
   * @returns User object without password (NO tokens)
   * @throws Error with status 409 if email already exists
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<UserResponse> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw HttpErrors.conflict('Email already registered');
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    // Create user in database
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    // Return user without password and without tokens
    return {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Login user with email and password
   *
   * @param email - User's email address
   * @param password - User's plain text password
   * @returns Object containing user, accessToken, and refreshToken
   * @throws Error with status 401 if credentials are invalid
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw HttpErrors.unauthorized('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw HttpErrors.unauthorized('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = this.generateRefreshToken(user._id.toString());

    // Return user without password, along with tokens
    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using a valid refresh token
   *
   * @param refreshToken - Valid refresh token
   * @returns New access token
   * @throws Error with status 401 if refresh token is invalid or expired
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        this.jwtRefreshSecret
      ) as JWTPayload;

      // Verify user still exists
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        throw HttpErrors.unauthorized('Invalid refresh token');
      }

      // Generate new access token
      return this.generateAccessToken(decoded.userId);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw HttpErrors.unauthorized('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw HttpErrors.unauthorized('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Verify and decode access token
   *
   * @param token - Access token to verify
   * @returns Decoded JWT payload containing userId
   * @throws Error with status 401 if token is invalid or expired
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw HttpErrors.unauthorized('Invalid access token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw HttpErrors.unauthorized('Access token expired');
      }
      throw error;
    }
  }

  /**
   * Generate access token
   * Private helper method
   *
   * @param userId - User's ID
   * @returns JWT access token
   */
  private generateAccessToken(userId: string): string {
    const payload: JWTPayload = { userId };
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   * Private helper method
   *
   * @param userId - User's ID
   * @returns JWT refresh token
   */
  private generateRefreshToken(userId: string): string {
    const payload: JWTPayload = { userId };
    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.refreshTokenExpiry,
    } as jwt.SignOptions);
  }
}

// Export singleton instance
export const authService = new AuthService();
