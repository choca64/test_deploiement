import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CreateTalentDto, TalentDto, UpdateTalentDto } from '../model/talent.dto';

const TABLE_NAME = 'talents';

// Couleurs pour les logs
const LOG_PREFIX = {
  DB: '\x1b[36m[SUPABASE]\x1b[0m',      // Cyan
  SUCCESS: '\x1b[32m✅\x1b[0m',          // Vert
  ERROR: '\x1b[31m❌\x1b[0m',            // Rouge
  INFO: '\x1b[33m📊\x1b[0m',             // Jaune
  CREATE: '\x1b[35m✨\x1b[0m',           // Magenta
  UPDATE: '\x1b[34m📝\x1b[0m',           // Bleu
  DELETE: '\x1b[31m🗑️\x1b[0m',           // Rouge
};

@Injectable()
export class TalentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Récupérer tous les talents
   */
  async findAll(): Promise<TalentDto[]> {
    console.log(`${LOG_PREFIX.DB} 🔍 Requête GET tous les talents...`);
    const startTime = Date.now();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur findAll:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} Données récupérées depuis SUPABASE`);
    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.INFO} ${data?.length || 0} talents trouvés (${duration}ms)`);
    
    if (data && data.length > 0) {
      console.log(`${LOG_PREFIX.DB} 📋 Liste des talents:`);
      data.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.nom} - ${t.role} (${t.categorie})`);
      });
    }

    return data || [];
  }

  /**
   * Récupérer un talent par son ID
   */
  async findById(id: string): Promise<TalentDto> {
    console.log(`${LOG_PREFIX.DB} 🔍 Requête GET talent ID: ${id}`);
    const startTime = Date.now();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Talent non trouvé: ${id}`);
      throw new NotFoundException(`Talent avec l'ID ${id} non trouvé`);
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} Talent trouvé depuis SUPABASE (${duration}ms)`);
    console.log(`${LOG_PREFIX.DB} 👤 ${data.nom} - ${data.role}`);

    return data;
  }

  /**
   * Créer un nouveau talent
   */
  async create(createTalentDto: CreateTalentDto): Promise<TalentDto> {
    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.CREATE} Création d'un nouveau talent...`);
    console.log(`${LOG_PREFIX.DB} 📤 Données envoyées vers SUPABASE:`);
    console.log(`   - Nom: ${createTalentDto.nom}`);
    console.log(`   - Rôle: ${createTalentDto.role}`);
    console.log(`   - Catégorie: ${createTalentDto.categorie}`);
    console.log(`   - Niveau: ${createTalentDto.niveau}`);

    const startTime = Date.now();

    const talentData = {
      ...createTalentDto,
      created_at: new Date().toISOString(),
      verified: createTalentDto.verified ?? false,
      xp_actuel: createTalentDto.xpActuel ?? 0,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .insert(talentData)
      .select()
      .single();

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur création:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} TALENT ENREGISTRÉ DANS SUPABASE ! (${duration}ms)`);
    console.log(`${LOG_PREFIX.DB} 🆔 ID généré: ${data.id}`);
    console.log(`${LOG_PREFIX.DB} 👤 ${data.nom} ajouté avec succès !`);

    return data;
  }

  /**
   * Mettre à jour un talent existant
   */
  async update(id: string, updateTalentDto: UpdateTalentDto): Promise<TalentDto> {
    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.UPDATE} Mise à jour talent ID: ${id}`);
    
    // Vérifier que le talent existe
    await this.findById(id);

    console.log(`${LOG_PREFIX.DB} 📤 Mise à jour envoyée vers SUPABASE...`);
    const startTime = Date.now();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .update(updateTalentDto)
      .eq('id', id)
      .select()
      .single();

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur mise à jour:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} TALENT MIS À JOUR DANS SUPABASE ! (${duration}ms)`);
    console.log(`${LOG_PREFIX.DB} 👤 ${data.nom} modifié avec succès !`);

    return data;
  }

  /**
   * Supprimer un talent
   */
  async delete(id: string): Promise<void> {
    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.DELETE} Suppression talent ID: ${id}`);
    
    // Vérifier que le talent existe
    const talent = await this.findById(id);

    console.log(`${LOG_PREFIX.DB} 🗑️ Suppression de "${talent.nom}" dans SUPABASE...`);
    const startTime = Date.now();

    const { error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur suppression:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} TALENT SUPPRIMÉ DE SUPABASE ! (${duration}ms)`);
    console.log(`${LOG_PREFIX.DB} 👋 "${talent.nom}" a été supprimé définitivement`);
  }

  /**
   * Rechercher des talents par terme
   */
  async search(query: string): Promise<TalentDto[]> {
    console.log(`${LOG_PREFIX.DB} 🔎 Recherche dans SUPABASE: "${query}"`);
    const startTime = Date.now();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .select('*')
      .or(`nom.ilike.%${query}%,role.ilike.%${query}%,bio.ilike.%${query}%,ville.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur recherche:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} Recherche effectuée (${duration}ms)`);
    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.INFO} ${data?.length || 0} résultats pour "${query}"`);

    return data || [];
  }

  /**
   * Filtrer par catégorie
   */
  async findByCategorie(categorie: string): Promise<TalentDto[]> {
    console.log(`${LOG_PREFIX.DB} 🏷️ Filtre par catégorie: ${categorie}`);
    const startTime = Date.now();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('categorie', categorie)
      .order('created_at', { ascending: false });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur filtre catégorie:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} Données SUPABASE filtrées (${duration}ms)`);
    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.INFO} ${data?.length || 0} talents en "${categorie}"`);

    return data || [];
  }

  /**
   * Filtrer par niveau
   */
  async findByNiveau(niveau: string): Promise<TalentDto[]> {
    console.log(`${LOG_PREFIX.DB} 📊 Filtre par niveau: ${niveau}`);
    const startTime = Date.now();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('niveau', niveau)
      .order('created_at', { ascending: false });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur filtre niveau:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} Données SUPABASE filtrées (${duration}ms)`);
    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.INFO} ${data?.length || 0} talents niveau "${niveau}"`);

    return data || [];
  }

  /**
   * Basculer le statut vérifié
   */
  async toggleVerified(id: string): Promise<TalentDto> {
    console.log(`${LOG_PREFIX.DB} ✓ Toggle vérification talent ID: ${id}`);
    
    const talent = await this.findById(id);
    const newStatus = !talent.verified;
    
    console.log(`${LOG_PREFIX.DB} 🔄 ${talent.nom}: verified ${talent.verified} → ${newStatus}`);
    const startTime = Date.now();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE_NAME)
      .update({ verified: newStatus })
      .eq('id', id)
      .select()
      .single();

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`${LOG_PREFIX.DB} ${LOG_PREFIX.ERROR} Erreur toggle:`, error.message);
      throw error;
    }

    console.log(`${LOG_PREFIX.DB} ${LOG_PREFIX.SUCCESS} Statut mis à jour dans SUPABASE (${duration}ms)`);

    return data;
  }
}

