import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { supabaseConfig } from '../../config/supabase.config';
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, UserResponse, AuthResponse } from '../dto/auth.dto';

const TABLE_NAME = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'ndi2025_super_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

// Logs colorés
const LOG = {
  AUTH: '\x1b[35m[AUTH]\x1b[0m',
  SUCCESS: '\x1b[32m✅\x1b[0m',
  ERROR: '\x1b[31m❌\x1b[0m',
  INFO: '\x1b[33m📊\x1b[0m',
};

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    console.log(`${LOG.AUTH} Service d'authentification initialisé`);
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    console.log(`${LOG.AUTH} 📝 Inscription: ${registerDto.email}`);

    // Vérifier si l'email existe déjà
    const { data: existingEmail } = await this.supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('email', registerDto.email)
      .single();

    if (existingEmail) {
      console.log(`${LOG.AUTH} ${LOG.ERROR} Email déjà utilisé: ${registerDto.email}`);
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Vérifier si le username existe déjà
    const { data: existingUsername } = await this.supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('username', registerDto.username)
      .single();

    if (existingUsername) {
      console.log(`${LOG.AUTH} ${LOG.ERROR} Username déjà utilisé: ${registerDto.username}`);
      throw new ConflictException('Ce nom d\'utilisateur est déjà pris');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(registerDto.password, SALT_ROUNDS);

    // Créer l'utilisateur
    const { data: user, error } = await this.supabase
      .from(TABLE_NAME)
      .insert({
        email: registerDto.email,
        password_hash: passwordHash,
        username: registerDto.username,
        display_name: registerDto.displayName || registerDto.username,
        ville: registerDto.ville,
        promo: registerDto.promo,
        bio: registerDto.bio,
        avatar_color: this.generateRandomColor(),
      })
      .select()
      .single();

    if (error) {
      console.error(`${LOG.AUTH} ${LOG.ERROR} Erreur création:`, error.message);
      throw error;
    }

    console.log(`${LOG.AUTH} ${LOG.SUCCESS} Utilisateur créé: ${user.username} (${user.id})`);

    // Générer le token JWT
    const token = this.generateToken(user);

    return {
      user: this.mapUserToResponse(user),
      token,
      expiresIn: 7 * 24 * 60 * 60, // 7 jours en secondes
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    console.log(`${LOG.AUTH} 🔐 Connexion: ${loginDto.email}`);

    // Trouver l'utilisateur par email
    const { data: user, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('email', loginDto.email)
      .single();

    if (error || !user) {
      console.log(`${LOG.AUTH} ${LOG.ERROR} Utilisateur non trouvé: ${loginDto.email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

    if (!isPasswordValid) {
      console.log(`${LOG.AUTH} ${LOG.ERROR} Mot de passe incorrect pour: ${loginDto.email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      console.log(`${LOG.AUTH} ${LOG.ERROR} Compte désactivé: ${loginDto.email}`);
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    // Mettre à jour last_login
    await this.supabase
      .from(TABLE_NAME)
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    console.log(`${LOG.AUTH} ${LOG.SUCCESS} Connexion réussie: ${user.username}`);

    // Générer le token JWT
    const token = this.generateToken(user);

    return {
      user: this.mapUserToResponse(user),
      token,
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(userId: string): Promise<UserResponse> {
    console.log(`${LOG.AUTH} 👤 Récupération profil: ${userId}`);

    const { data: user, error } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.mapUserToResponse(user);
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserResponse> {
    console.log(`${LOG.AUTH} 📝 Mise à jour profil: ${userId}`);

    const updateData: any = {};
    if (updateDto.displayName) updateData.display_name = updateDto.displayName;
    if (updateDto.bio !== undefined) updateData.bio = updateDto.bio;
    if (updateDto.ville !== undefined) updateData.ville = updateDto.ville;
    if (updateDto.promo !== undefined) updateData.promo = updateDto.promo;
    if (updateDto.avatarUrl !== undefined) updateData.avatar_url = updateDto.avatarUrl;
    if (updateDto.avatarColor !== undefined) updateData.avatar_color = updateDto.avatarColor;

    const { data: user, error } = await this.supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error(`${LOG.AUTH} ${LOG.ERROR} Erreur mise à jour:`, error.message);
      throw error;
    }

    console.log(`${LOG.AUTH} ${LOG.SUCCESS} Profil mis à jour: ${user.username}`);

    return this.mapUserToResponse(user);
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId: string, changeDto: ChangePasswordDto): Promise<void> {
    console.log(`${LOG.AUTH} 🔑 Changement mot de passe: ${userId}`);

    // Récupérer l'utilisateur
    const { data: user } = await this.supabase
      .from(TABLE_NAME)
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isValid = await bcrypt.compare(changeDto.currentPassword, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Hasher le nouveau mot de passe
    const newHash = await bcrypt.hash(changeDto.newPassword, SALT_ROUNDS);

    // Mettre à jour
    await this.supabase
      .from(TABLE_NAME)
      .update({ password_hash: newHash })
      .eq('id', userId);

    console.log(`${LOG.AUTH} ${LOG.SUCCESS} Mot de passe changé`);
  }

  /**
   * Vérifier un token JWT
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  /**
   * Lier un talent à l'utilisateur
   */
  async linkTalent(userId: string, talentId: string): Promise<UserResponse> {
    console.log(`${LOG.AUTH} 🔗 Liaison talent ${talentId} → user ${userId}`);

    const { data: user, error } = await this.supabase
      .from(TABLE_NAME)
      .update({ talent_id: talentId })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`${LOG.AUTH} ${LOG.SUCCESS} Talent lié au profil`);

    return this.mapUserToResponse(user);
  }

  /**
   * Générer un token JWT
   */
  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Mapper les données Supabase vers UserResponse
   */
  private mapUserToResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name || user.username,
      avatarUrl: user.avatar_url,
      avatarColor: user.avatar_color || '#3DB4AD',
      bio: user.bio,
      ville: user.ville,
      promo: user.promo,
      role: user.role,
      isVerified: user.is_verified,
      xpTotal: user.xp_total || 0,
      niveau: user.niveau || 1,
      talentId: user.talent_id,
      createdAt: user.created_at,
    };
  }

  /**
   * Générer une couleur aléatoire pour l'avatar
   */
  private generateRandomColor(): string {
    const colors = ['#3DB4AD', '#F5D547', '#FF7F6B', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

