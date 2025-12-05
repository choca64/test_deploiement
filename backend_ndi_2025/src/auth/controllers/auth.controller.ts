import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, AuthResponse, UserResponse } from '../dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/auth/login
   * Connexion d'un utilisateur
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * GET /api/auth/profile
   * Récupérer le profil de l'utilisateur connecté
   */
  @Get('profile')
  async getProfile(@Headers('authorization') authHeader: string): Promise<UserResponse> {
    const userId = this.extractUserId(authHeader);
    return this.authService.getProfile(userId);
  }

  /**
   * PUT /api/auth/profile
   * Mettre à jour le profil
   */
  @Put('profile')
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() updateDto: UpdateProfileDto,
  ): Promise<UserResponse> {
    const userId = this.extractUserId(authHeader);
    return this.authService.updateProfile(userId, updateDto);
  }

  /**
   * POST /api/auth/change-password
   * Changer le mot de passe
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Headers('authorization') authHeader: string,
    @Body() changeDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = this.extractUserId(authHeader);
    await this.authService.changePassword(userId, changeDto);
    return { message: 'Mot de passe changé avec succès' };
  }

  /**
   * POST /api/auth/link-talent
   * Lier un talent au profil
   */
  @Post('link-talent')
  @HttpCode(HttpStatus.OK)
  async linkTalent(
    @Headers('authorization') authHeader: string,
    @Body() body: { talentId: string },
  ): Promise<UserResponse> {
    const userId = this.extractUserId(authHeader);
    return this.authService.linkTalent(userId, body.talentId);
  }

  /**
   * GET /api/auth/verify
   * Vérifier si le token est valide
   */
  @Get('verify')
  async verifyToken(@Headers('authorization') authHeader: string): Promise<{ valid: boolean; user: UserResponse }> {
    const userId = this.extractUserId(authHeader);
    const user = await this.authService.getProfile(userId);
    return { valid: true, user };
  }

  /**
   * Extraire l'ID utilisateur du token JWT
   */
  private extractUserId(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.authService.verifyToken(token);
    return decoded.sub;
  }
}

