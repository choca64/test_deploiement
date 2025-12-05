/**
 * DTOs pour l'authentification
 */

export class RegisterDto {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  ville?: string;
  promo?: string;
  bio?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class UpdateProfileDto {
  displayName?: string;
  bio?: string;
  ville?: string;
  promo?: string;
  avatarUrl?: string;
  avatarColor?: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;
  bio?: string;
  ville?: string;
  promo?: string;
  role: string;
  isVerified: boolean;
  xpTotal: number;
  niveau: number;
  talentId?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  expiresIn: number;
}

