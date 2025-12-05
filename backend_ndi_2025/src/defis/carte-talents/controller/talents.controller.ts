import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TalentsService } from '../services/talents.service';
import { CreateTalentDto, UpdateTalentDto, TalentDto } from '../model/talent.dto';

@Controller('api/talents')
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  /**
   * GET /api/talents
   * Récupérer tous les talents
   */
  @Get()
  async findAll(): Promise<TalentDto[]> {
    return this.talentsService.findAll();
  }

  /**
   * GET /api/talents/search?q=term
   * Rechercher des talents
   */
  @Get('search')
  async search(@Query('q') query: string): Promise<TalentDto[]> {
    if (!query) {
      return this.talentsService.findAll();
    }
    return this.talentsService.search(query);
  }

  /**
   * GET /api/talents/categorie/:categorie
   * Filtrer par catégorie
   */
  @Get('categorie/:categorie')
  async findByCategorie(@Param('categorie') categorie: string): Promise<TalentDto[]> {
    return this.talentsService.findByCategorie(categorie);
  }

  /**
   * GET /api/talents/niveau/:niveau
   * Filtrer par niveau
   */
  @Get('niveau/:niveau')
  async findByNiveau(@Param('niveau') niveau: string): Promise<TalentDto[]> {
    return this.talentsService.findByNiveau(niveau);
  }

  /**
   * GET /api/talents/:id
   * Récupérer un talent par son ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<TalentDto> {
    return this.talentsService.findById(id);
  }

  /**
   * POST /api/talents
   * Créer un nouveau talent
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTalentDto: CreateTalentDto): Promise<TalentDto> {
    return this.talentsService.create(createTalentDto);
  }

  /**
   * PUT /api/talents/:id
   * Mettre à jour un talent
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTalentDto: UpdateTalentDto,
  ): Promise<TalentDto> {
    return this.talentsService.update(id, updateTalentDto);
  }

  /**
   * PATCH /api/talents/:id/verify
   * Basculer le statut vérifié
   */
  @Patch(':id/verify')
  async toggleVerified(@Param('id') id: string): Promise<TalentDto> {
    return this.talentsService.toggleVerified(id);
  }

  /**
   * DELETE /api/talents/:id
   * Supprimer un talent
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.talentsService.delete(id);
  }
}

