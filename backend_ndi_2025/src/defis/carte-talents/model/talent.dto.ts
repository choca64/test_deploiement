/**
 * ========================================
 * DTOs pour les Talents - Backend NestJS
 * ========================================
 */

// Types pour les niveaux et catégories
export type NiveauMaitrise = 'débutant' | 'intermédiaire' | 'avancé' | 'expert' | 'maître' | 'légendaire';
export type CategorieTalent = 'technique' | 'artistique' | 'physique' | 'social' | 'analytique' | 'créatif' | 'leadership';
export type ImpactLevel = 'faible' | 'moyen' | 'fort' | 'destructeur';

// Interface pour les statistiques
export interface TalentStats {
  principale: { nom: string; valeur: number };
  secondaires: { nom: string; valeur: number }[];
  tauxReussite: number;
  precision: number;
  rapidite: number;
  impact: ImpactLevel;
}

// Interface pour les coûts/ressources
export interface TalentCost {
  energie: number;
  fatigue: number;
  ressourcesRequises?: string[];
}

// Interface pour les limites
export interface TalentLimites {
  conditions: string[];
  dureeEffet?: string;
  cooldown?: string;
  frequenceMax?: string;
  risqueEchec: number;
}

// Interface pour l'évolution
export interface TalentEvolution {
  niveauSuivant?: string;
  conditionsAmelioration: string[];
  capacitesDebloquables: string[];
  xpNecessaire: number;
}

// Interface pour l'historique
export interface TalentHistorique {
  acquisition: string;
  mentor?: string;
  formation?: string;
  evenementDeclencheur?: string;
  evolutionTemps: string[];
}

// Interface pour les synergies
export interface TalentSynergie {
  talentsCompatibles: string[];
  bonusEquipe: string[];
  situationsExcellence: string[];
  combos: string[];
}

// Interface pour les faiblesses
export interface TalentFaiblesses {
  contreIndications: string[];
  talentsNeutralisants: string[];
  defautsNaturels: string[];
  coutEleve: string[];
}

// Interface pour le style
export interface TalentStyle {
  signature?: string;
  surnom?: string;
  citation?: string;
  effetsVisuels?: string;
}

// Interface pour les interactions sociales
export interface TalentSocial {
  appreciePar: string[];
  redoutePar: string[];
  influenceGroupe: string;
  compatibilitesProfils: string[];
}

/**
 * Interface principale du Talent
 */
export interface TalentDto {
  id?: string;
  
  // Informations générales
  nom: string;
  age?: number;
  genre?: 'homme' | 'femme' | 'autre' | 'non-specifie';
  origine?: string;
  nationalite?: string;
  ville?: string;
  promo?: string;
  email?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  
  // Description du talent
  role: string;
  niveau: NiveauMaitrise;
  categorie: CategorieTalent;
  bio?: string;
  specificites: string[];
  domainesApplication: string[];
  
  // Attributs techniques
  stats: TalentStats;
  cout: TalentCost;
  limites: TalentLimites;
  
  // Compétences & Avantages
  competences: string[];
  forcesPrincipales: string[];
  bonusPassifs: string[];
  effetsSpeciaux: string[];
  synergies: TalentSynergie;
  
  // Faiblesses
  faiblesses: TalentFaiblesses;
  
  // Historique
  historique: TalentHistorique;
  
  // Exemples d'utilisation
  exemplesUtilisation: string[];
  casReels: string[];
  
  // Évolutions
  evolution: TalentEvolution;
  xpActuel: number;
  
  // Ressources
  materielRequis: string[];
  environnementIdeal: string[];
  competencesComplementaires: string[];
  
  // Style & Signature
  style: TalentStyle;
  
  // Interactions sociales
  social: TalentSocial;
  
  // Autres
  langues: string[];
  passions: string[];
  projets: string[];
  tags: string[];
  verified: boolean;
  createdAt?: string;
  
  // Lien utilisateur
  userId?: string;
}

/**
 * DTO pour la création d'un talent (champs optionnels simplifiés)
 */
export class CreateTalentDto {
  nom: string;
  role: string;
  niveau: NiveauMaitrise;
  categorie: CategorieTalent;
  
  age?: number;
  genre?: 'homme' | 'femme' | 'autre' | 'non-specifie';
  origine?: string;
  nationalite?: string;
  ville?: string;
  promo?: string;
  email?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  bio?: string;
  
  specificites?: string[];
  domainesApplication?: string[];
  stats?: TalentStats;
  cout?: TalentCost;
  limites?: TalentLimites;
  competences?: string[];
  forcesPrincipales?: string[];
  bonusPassifs?: string[];
  effetsSpeciaux?: string[];
  synergies?: TalentSynergie;
  faiblesses?: TalentFaiblesses;
  historique?: TalentHistorique;
  exemplesUtilisation?: string[];
  casReels?: string[];
  evolution?: TalentEvolution;
  xpActuel?: number;
  materielRequis?: string[];
  environnementIdeal?: string[];
  competencesComplementaires?: string[];
  style?: TalentStyle;
  social?: TalentSocial;
  langues?: string[];
  passions?: string[];
  projets?: string[];
  tags?: string[];
  verified?: boolean;
  userId?: string;
}

/**
 * DTO pour la mise à jour (tous les champs sont optionnels)
 */
export class UpdateTalentDto {
  nom?: string;
  role?: string;
  niveau?: NiveauMaitrise;
  categorie?: CategorieTalent;
  age?: number;
  genre?: 'homme' | 'femme' | 'autre' | 'non-specifie';
  origine?: string;
  nationalite?: string;
  ville?: string;
  promo?: string;
  email?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  bio?: string;
  specificites?: string[];
  domainesApplication?: string[];
  stats?: TalentStats;
  cout?: TalentCost;
  limites?: TalentLimites;
  competences?: string[];
  forcesPrincipales?: string[];
  bonusPassifs?: string[];
  effetsSpeciaux?: string[];
  synergies?: TalentSynergie;
  faiblesses?: TalentFaiblesses;
  historique?: TalentHistorique;
  exemplesUtilisation?: string[];
  casReels?: string[];
  evolution?: TalentEvolution;
  xpActuel?: number;
  materielRequis?: string[];
  environnementIdeal?: string[];
  competencesComplementaires?: string[];
  style?: TalentStyle;
  social?: TalentSocial;
  langues?: string[];
  passions?: string[];
  projets?: string[];
  tags?: string[];
  verified?: boolean;
  userId?: string;
}

