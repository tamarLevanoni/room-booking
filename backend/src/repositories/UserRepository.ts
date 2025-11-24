import { User } from '../models/User';
import { IUser } from '../types';

/**
 * UserRepository
 *
 * Handles database operations for User model.
 * Provides methods for user creation and retrieval.
 */
export class UserRepository {
  /**
   * Find a user by email address
   * @param email - User's email address (case-insensitive)
   * @returns User document or null if not found
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Find a user by ID
   * @param id - User's ObjectId as string
   * @returns User document or null if not found
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  /**
   * Create a new user
   * @param data - User creation data
   * @param data.email - User's email address
   * @param data.password - User's password (should be hashed before calling this method)
   * @param data.name - User's full name
   * @returns Created user document
   */
  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<IUser> {
    const user = new User({
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
    });
    return user.save();
  }
}

export const userRepository = new UserRepository();
