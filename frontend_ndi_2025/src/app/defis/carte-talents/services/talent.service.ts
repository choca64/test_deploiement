import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * ========================================
 * MODÈLE DE DONNÉES COMPLET POUR UN TALENT
 * ========================================
 */

// Types pour les niveaux et catégories
export type NiveauMaitrise = 'débutant' | 'intermédiaire' | 'avancé' | 'expert' | 'maître' | 'légendaire';
export type CategorieTalent = 'technique' | 'artistique' | 'physique' | 'social' | 'analytique' | 'créatif' | 'leadership';
export type ImpactLevel = 'faible' | 'moyen' | 'fort' | 'destructeur';

// Interface pour les statistiques
export interface TalentStats {
  principale: { nom: string; valeur: number }; // ex: { nom: 'Intelligence', valeur: 85 }
  secondaires: { nom: string; valeur: number }[];
  tauxReussite: number;      // 0-100
  precision: number;         // 0-100
  rapidite: number;          // 0-100
  impact: ImpactLevel;
}

// Interface pour les coûts/ressources
export interface TalentCost {
  energie: number;           // 0-100
  fatigue: number;           // 0-100
  ressourcesRequises?: string[];
}

// Interface pour les limites
export interface TalentLimites {
  conditions: string[];      // Conditions d'activation
  dureeEffet?: string;       // "2 heures", "permanent"
  cooldown?: string;         // "1 jour", "1 semaine"
  frequenceMax?: string;     // "3x/jour"
  risqueEchec: number;       // 0-100
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
  acquisition: string;       // Comment acquis
  mentor?: string;
  formation?: string;
  evenementDeclencheur?: string;
  evolutionTemps: string[];  // Étapes d'évolution
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
  signature?: string;        // Gestuelle, marque de fabrique
  surnom?: string;           // Surnom lié au talent
  citation?: string;         // Citation associée
  effetsVisuels?: string;    // Description des effets
}

// Interface pour les interactions sociales
export interface TalentSocial {
  appreciePar: string[];
  redoutePar: string[];
  influenceGroupe: string;
  compatibilitesProfils: string[];
}

/**
 * Interface principale du Talent - VERSION COMPLÈTE
 */
export interface Talent {
  id: string;
  
  // ===== 1. INFORMATIONS GÉNÉRALES =====
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
  
  // ===== 2. DESCRIPTION DU TALENT =====
  role: string;                    // Titre du talent
  niveau: NiveauMaitrise;
  categorie: CategorieTalent;
  bio?: string;                    // Description globale
  specificites: string[];          // Sous-talents
  domainesApplication: string[];   // Où ça s'applique
  
  // ===== 3. ATTRIBUTS TECHNIQUES =====
  stats: TalentStats;
  cout: TalentCost;
  limites: TalentLimites;
  
  // ===== 4. COMPÉTENCES & AVANTAGES =====
  competences: string[];           // Skills principales
  forcesPrincipales: string[];
  bonusPassifs: string[];
  effetsSpeciaux: string[];
  synergies: TalentSynergie;
  
  // ===== 5. FAIBLESSES =====
  faiblesses: TalentFaiblesses;
  
  // ===== 6. HISTORIQUE =====
  historique: TalentHistorique;
  
  // ===== 7. EXEMPLES D'UTILISATION =====
  exemplesUtilisation: string[];
  casReels: string[];
  
  // ===== 8. ÉVOLUTIONS =====
  evolution: TalentEvolution;
  xpActuel: number;
  
  // ===== 9. RESSOURCES =====
  materielRequis: string[];
  environnementIdeal: string[];
  competencesComplementaires: string[];
  
  // ===== 10. STYLE & SIGNATURE =====
  style: TalentStyle;
  
  // ===== 11. INTERACTIONS SOCIALES =====
  social: TalentSocial;
  
  // ===== 12. AUTRES =====
  langues: string[];
  passions: string[];
  projets: string[];
  tags: string[];
  verified: boolean;
  createdAt: Date;
  
  // ===== 13. LIEN UTILISATEUR =====
  userId?: string;  // ID de l'utilisateur propriétaire du talent
}

/**
 * Données de test enrichies
 */
const MOCK_TALENTS: Talent[] = [
  {
    id: '1',
    nom: 'Alexandra Martin',
    age: 24,
    genre: 'femme',
    origine: 'Bretagne',
    nationalite: 'Française',
    ville: 'Lyon',
    promo: 'CESI 2025',
    email: 'alexandra.martin@example.com',
    avatarColor: '#22c55e',
    
    role: 'Facilitatrice & UX designer',
    niveau: 'expert',
    categorie: 'créatif',
    bio: `Spécialisée en facilitation d'ateliers et design d'expérience utilisateur. 
          Je crée des ponts entre les équipes techniques et les utilisateurs finaux.`,
    specificites: ['Design Thinking', 'Prototypage rapide', 'User Research'],
    domainesApplication: ['Startups', 'ESN', 'Associations'],
    
    stats: {
      principale: { nom: 'Créativité', valeur: 92 },
      secondaires: [
        { nom: 'Empathie', valeur: 88 },
        { nom: 'Communication', valeur: 85 },
        { nom: 'Analyse', valeur: 78 }
      ],
      tauxReussite: 94,
      precision: 89,
      rapidite: 82,
      impact: 'fort'
    },
    cout: {
      energie: 35,
      fatigue: 25,
      ressourcesRequises: ['Post-its', 'Whiteboard', 'Figma']
    },
    limites: {
      conditions: ['Équipe de min. 3 personnes', 'Espace calme'],
      dureeEffet: '2-4 heures par session',
      cooldown: 'Récupération 1 jour',
      frequenceMax: '2 sessions/jour',
      risqueEchec: 8
    },
    
    competences: ['UX Design', 'Figma', 'Facilitation', 'Miro'],
    forcesPrincipales: ['Vision utilisateur', 'Synthèse visuelle', 'Animation de groupe'],
    bonusPassifs: ['+15% cohésion équipe', '+20% clarté des specs'],
    effetsSpeciaux: ['Déblocage créatif instantané', 'Alignement des parties prenantes'],
    synergies: {
      talentsCompatibles: ['Développeur Frontend', 'Product Manager', 'Data Analyst'],
      bonusEquipe: ['Vitesse de décision x2', 'Moins de bugs UX'],
      situationsExcellence: ['Kick-off projet', 'Résolution de conflits', 'Innovation'],
      combos: ['UX + Dev = Prototype en 1 jour', 'UX + PM = Roadmap claire']
    },
    
    faiblesses: {
      contreIndications: ['Projets très techniques sans users', 'Deadlines < 2h'],
      talentsNeutralisants: ['Micro-manager', 'Client indécis'],
      defautsNaturels: ['Perfectionnisme', 'Trop de questions'],
      coutEleve: ['Grands groupes > 15 pers.']
    },
    
    historique: {
      acquisition: 'Formation Design Thinking à Stanford d-school (online)',
      mentor: 'Julie Chapon (ex-Yuka)',
      formation: 'Master UX Design - Gobelins',
      evenementDeclencheur: 'Hackathon 2022 - Prix du meilleur UX',
      evolutionTemps: ['2020: UI Designer', '2022: UX Designer', '2024: Lead UX & Facilitatrice']
    },
    
    exemplesUtilisation: [
      'Refonte app mobile bancaire (+40% satisfaction)',
      'Workshop innovation PME (3 nouveaux produits lancés)',
      'Formation équipe dev à l\'empathie utilisateur'
    ],
    casReels: ['BlaBlaCar - Amélioration du flow de réservation', 'Startup EdTech - MVP en 2 semaines'],
    
    evolution: {
      niveauSuivant: 'Design Director',
      conditionsAmelioration: ['Certif. facilitation avancée', '50 workshops menés'],
      capacitesDebloquables: ['Design System', 'Formation équipes', 'Audit UX'],
      xpNecessaire: 2500
    },
    xpActuel: 1850,
    
    materielRequis: ['MacBook Pro', 'Figma Pro', 'Post-its XXL', 'Markers'],
    environnementIdeal: ['Open space créatif', 'Salle avec tableaux'],
    competencesComplementaires: ['HTML/CSS basics', 'Notion', 'Analytics'],
    
    style: {
      signature: 'Toujours un croquis sur papier avant le digital',
      surnom: 'La Facilitatrice',
      citation: '"Un bon design est invisible, seul l\'impact reste"',
      effetsVisuels: 'Moodboards colorés et wireframes annotés'
    },
    
    social: {
      appreciePar: ['Équipes produit', 'Startups', 'Associations'],
      redoutePar: ['Développeurs pressés', 'Clients sans budget UX'],
      influenceGroupe: 'Fédératrice naturelle, crée de la cohésion',
      compatibilitesProfils: ['Product Manager', 'Développeur curieux', 'Marketeur']
    },
    
    langues: ['FR', 'EN'],
    passions: ['Jeux vidéo', 'Escape games', 'Sketchnoting'],
    projets: ['Plateforme de talents (NDI 2025)', 'App de méditation collaborative'],
    tags: ['UX', 'Design', 'Facilitation', 'Innovation'],
    verified: true,
    createdAt: new Date('2025-08-15')
  },
  {
    id: '2',
    nom: 'Yassine Bou',
    age: 26,
    genre: 'homme',
    origine: 'Maroc',
    nationalite: 'Franco-marocain',
    ville: 'Grenoble',
    promo: 'Epitech 2024',
    email: 'yassine.bourahla@example.com',
    avatarColor: '#3DB4AD',
    
    role: 'Développeur fullstack',
    niveau: 'avancé',
    categorie: 'technique',
    bio: `Passionné par le code propre et les architectures scalables.
          Je construis des applications web modernes avec Angular et Node.js.`,
    specificites: ['Angular avancé', 'API REST', 'DevOps basics'],
    domainesApplication: ['SaaS', 'E-commerce', 'Applications métier'],
    
    stats: {
      principale: { nom: 'Logique', valeur: 90 },
      secondaires: [
        { nom: 'Rigueur', valeur: 88 },
        { nom: 'Autonomie', valeur: 85 },
        { nom: 'Curiosité', valeur: 82 }
      ],
      tauxReussite: 91,
      precision: 94,
      rapidite: 78,
      impact: 'fort'
    },
    cout: {
      energie: 40,
      fatigue: 35,
      ressourcesRequises: ['IDE', 'Documentation', 'Café ☕']
    },
    limites: {
      conditions: ['Specs claires', 'Accès Git'],
      dureeEffet: 'Permanent (code livré)',
      cooldown: 'Aucun',
      frequenceMax: '8-10h/jour',
      risqueEchec: 12
    },
    
    competences: ['Angular', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    forcesPrincipales: ['Code maintenable', 'Tests unitaires', 'Documentation'],
    bonusPassifs: ['+25% vélocité sprint', '-30% dette technique'],
    effetsSpeciaux: ['Debugging éclair', 'Refactoring miracle'],
    synergies: {
      talentsCompatibles: ['DevOps', 'UX Designer', 'Product Owner'],
      bonusEquipe: ['CI/CD fiable', 'Moins de bugs en prod'],
      situationsExcellence: ['Développement from scratch', 'Migration technique'],
      combos: ['Fullstack + DevOps = Déploiement auto', 'Fullstack + UX = MVP rapide']
    },
    
    faiblesses: {
      contreIndications: ['Specs floues', 'Projet legacy sans tests'],
      talentsNeutralisants: ['Changements de scope fréquents'],
      defautsNaturels: ['Over-engineering parfois', 'Impatient avec mauvais code'],
      coutEleve: ['Projets sans challenge technique']
    },
    
    historique: {
      acquisition: 'Autodidacte puis Epitech',
      mentor: 'Senior dev chez OVH',
      formation: 'Epitech + certifications Angular',
      evenementDeclencheur: 'Premier projet open source à 1k stars',
      evolutionTemps: ['2020: Junior', '2022: Confirmé', '2024: Senior']
    },
    
    exemplesUtilisation: [
      'API e-commerce gérant 10k requêtes/min',
      'Migration Angular 12 → 17 sans downtime',
      'Dashboard analytics temps réel'
    ],
    casReels: ['Plateforme RH - 50k users', 'App logistique - 200 entrepôts'],
    
    evolution: {
      niveauSuivant: 'Tech Lead',
      conditionsAmelioration: ['Certif. architecture', 'Mentorer 3 juniors'],
      capacitesDebloquables: ['System Design', 'Team management', 'Tech strategy'],
      xpNecessaire: 3000
    },
    xpActuel: 2100,
    
    materielRequis: ['MacBook M2', 'Écran 4K', 'Clavier mécanique'],
    environnementIdeal: ['Calme', 'Musique lo-fi', 'Standing desk'],
    competencesComplementaires: ['AWS', 'Kubernetes', 'GraphQL'],
    
    style: {
      signature: 'Commits atomiques et PRs bien documentées',
      surnom: 'Le Debugger',
      citation: '"Un code sans tests est un code qui n\'existe pas"',
      effetsVisuels: 'Terminal customisé avec Oh-My-Zsh'
    },
    
    social: {
      appreciePar: ['Product managers', 'QA', 'Autres devs'],
      redoutePar: ['Ceux qui pushent en prod le vendredi'],
      influenceGroupe: 'Référent technique, aide les juniors',
      compatibilitesProfils: ['DevOps', 'UX', 'Data Engineer']
    },
    
    langues: ['FR', 'EN', 'AR'],
    passions: ['Open source', 'Gaming', 'Domotique'],
    projets: ['Contrib Angular Material', 'Bot Discord pour NDI'],
    tags: ['Angular', 'Node.js', 'TypeScript', 'Clean Code'],
    verified: true,
    createdAt: new Date('2025-09-20')
  },
  {
    id: '3',
    nom: 'Clara Dupuis',
    age: 23,
    genre: 'femme',
    origine: 'Normandie',
    nationalite: 'Française',
    ville: 'Paris',
    promo: 'CESI 2026',
    email: 'clara.dupuis@example.com',
    avatarColor: '#f97316',
    
    role: 'Chargée de projets RSE',
    niveau: 'intermédiaire',
    categorie: 'social',
    bio: `Je construis des projets concrets autour de la RSE et de la transition,
          en impliquant le plus possible les étudiants et entreprises.`,
    specificites: ['Gestion de projet durable', 'Animation RSE', 'Communication impact'],
    domainesApplication: ['Entreprises', 'Associations', 'Collectivités'],
    
    stats: {
      principale: { nom: 'Leadership', valeur: 84 },
      secondaires: [
        { nom: 'Communication', valeur: 88 },
        { nom: 'Organisation', valeur: 82 },
        { nom: 'Persuasion', valeur: 80 }
      ],
      tauxReussite: 87,
      precision: 85,
      rapidite: 75,
      impact: 'fort'
    },
    cout: {
      energie: 30,
      fatigue: 40,
      ressourcesRequises: ['Partenaires', 'Budget com\'', 'Temps']
    },
    limites: {
      conditions: ['Soutien direction', 'Budget minimum'],
      dureeEffet: 'Long terme (6-12 mois)',
      cooldown: 'Entre projets: 1 mois',
      frequenceMax: '2-3 projets/an',
      risqueEchec: 20
    },
    
    competences: ['Gestion de projet', 'RSE', 'Communication', 'Animation'],
    forcesPrincipales: ['Vision long terme', 'Fédération des acteurs', 'Impact mesurable'],
    bonusPassifs: ['+20% engagement employés', '+15% image marque'],
    effetsSpeciaux: ['Transformation culturelle', 'Mobilisation collective'],
    synergies: {
      talentsCompatibles: ['Community Manager', 'RH', 'Direction'],
      bonusEquipe: ['Cohésion autour des valeurs', 'Fierté d\'appartenance'],
      situationsExcellence: ['Lancement initiative RSE', 'Crise réputation'],
      combos: ['RSE + RH = Marque employeur forte', 'RSE + Com = Storytelling impact']
    },
    
    faiblesses: {
      contreIndications: ['Entreprise sans budget RSE', 'Direction non engagée'],
      talentsNeutralisants: ['Greenwashing', 'Court-termisme'],
      defautsNaturels: ['Idéalisme parfois', 'Frustration face à l\'inertie'],
      coutEleve: ['Changements de grande envergure']
    },
    
    historique: {
      acquisition: 'Engagement associatif depuis le lycée',
      mentor: 'Directrice RSE Danone',
      formation: 'Master Management Responsable',
      evenementDeclencheur: 'Organisation TEDx sur le climat',
      evolutionTemps: ['2021: Bénévole', '2023: Chargée de mission', '2025: Chef de projet']
    },
    
    exemplesUtilisation: [
      'Forum étudiants-entreprises engagées (500 participants)',
      'Podcast transition écologique (10k écoutes)',
      'Bilan carbone campus (-15% en 1 an)'
    ],
    casReels: ['Label RSE PME locale', 'Partenariat école-ONG'],
    
    evolution: {
      niveauSuivant: 'Responsable RSE',
      conditionsAmelioration: ['Certification ISO 26000', '5 projets réussis'],
      capacitesDebloquables: ['Stratégie RSE', 'Reporting extra-financier', 'Lobbying'],
      xpNecessaire: 2000
    },
    xpActuel: 1200,
    
    materielRequis: ['Outils de gestion projet', 'Réseau partenaires'],
    environnementIdeal: ['Entreprise engagée', 'Équipe motivée'],
    competencesComplementaires: ['Data analyse', 'Juridique RSE', 'Finance durable'],
    
    style: {
      signature: 'Toujours des chiffres d\'impact concrets',
      surnom: 'Miss Impact',
      citation: '"Chaque action compte, ensemble on change l\'échelle"',
      effetsVisuels: 'Présentations avec infographies impact'
    },
    
    social: {
      appreciePar: ['Millennials/Gen Z', 'Direction visionnaire', 'ONG'],
      redoutePar: ['Conservateurs', 'Profit-only mindset'],
      influenceGroupe: 'Inspirante, donne du sens au travail',
      compatibilitesProfils: ['Communication', 'RH', 'Innovation']
    },
    
    langues: ['FR', 'EN', 'ES'],
    passions: ['Climat', 'Podcast', 'Événementiel', 'Randonnée'],
    projets: ['Forum étudiants-entreprises', 'Podcast interne transition'],
    tags: ['RSE', 'Climat', 'Impact', 'Leadership'],
    verified: true,
    createdAt: new Date('2025-11-05')
  }
];

// URL de l'API Backend
const API_URL = environment.apiUrl + '/api/talents';

@Injectable({
  providedIn: 'root',
})
export class TalentService {

  private readonly _talents$ = new BehaviorSubject<Talent[]>([]);
  private isLoading = false;

  constructor(private http: HttpClient) {
    this.loadFromAPI();
  }

  get talents$(): Observable<Talent[]> {
    return this._talents$.asObservable();
  }

  getTalentsSnapshot(): Talent[] {
    return this._talents$.getValue();
  }

  /**
   * Charger les talents depuis l'API Backend (Supabase)
   */
  async loadFromAPI(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    console.log('🔄 [FRONTEND] Chargement des talents depuis l\'API...');
    console.log('📡 [FRONTEND] URL:', API_URL);

    try {
      const talents = await firstValueFrom(this.http.get<any[]>(API_URL));
      
      // Convertir les données de l'API au format frontend
      const formattedTalents = talents.map(t => this.mapApiToTalent(t));
      
      this._talents$.next(formattedTalents);
      console.log('✅ [FRONTEND] Talents chargés depuis SUPABASE via API:', formattedTalents.length);
      
      if (formattedTalents.length > 0) {
        console.log('📋 [FRONTEND] Liste:');
        formattedTalents.forEach((t, i) => console.log(`   ${i+1}. ${t.nom} - ${t.role}`));
      }
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erreur API:', error.message || error);
      console.log('📦 [FRONTEND] Chargement des données mock en fallback...');
      this._talents$.next([...MOCK_TALENTS]);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Mapper les données API vers le format Talent frontend
   */
  private mapApiToTalent(apiData: any): Talent {
    return {
      id: apiData.id,
      nom: apiData.nom,
      age: apiData.age,
      genre: apiData.genre,
      origine: apiData.origine,
      nationalite: apiData.nationalite,
      ville: apiData.ville,
      promo: apiData.promo,
      email: apiData.email,
      avatarUrl: apiData.avatar_url,
      avatarInitials: apiData.avatar_initials,
      avatarColor: apiData.avatar_color,
      role: apiData.role,
      niveau: apiData.niveau,
      categorie: apiData.categorie,
      bio: apiData.bio,
      specificites: apiData.specificites || [],
      domainesApplication: apiData.domaines_application || [],
      stats: apiData.stats || { principale: { nom: '', valeur: 0 }, secondaires: [], tauxReussite: 0, precision: 0, rapidite: 0, impact: 'moyen' },
      cout: apiData.cout || { energie: 0, fatigue: 0, ressourcesRequises: [] },
      limites: apiData.limites || { conditions: [], risqueEchec: 0 },
      competences: apiData.competences || [],
      forcesPrincipales: apiData.forces_principales || [],
      bonusPassifs: apiData.bonus_passifs || [],
      effetsSpeciaux: apiData.effets_speciaux || [],
      synergies: apiData.synergies || { talentsCompatibles: [], bonusEquipe: [], situationsExcellence: [], combos: [] },
      faiblesses: apiData.faiblesses || { contreIndications: [], talentsNeutralisants: [], defautsNaturels: [], coutEleve: [] },
      historique: apiData.historique || { acquisition: '', evolutionTemps: [] },
      exemplesUtilisation: apiData.exemples_utilisation || [],
      casReels: apiData.cas_reels || [],
      evolution: apiData.evolution || { conditionsAmelioration: [], capacitesDebloquables: [], xpNecessaire: 0 },
      xpActuel: apiData.xp_actuel || 0,
      materielRequis: apiData.materiel_requis || [],
      environnementIdeal: apiData.environnement_ideal || [],
      competencesComplementaires: apiData.competences_complementaires || [],
      style: apiData.style || {},
      social: apiData.social || { appreciePar: [], redoutePar: [], influenceGroupe: '', compatibilitesProfils: [] },
      langues: apiData.langues || [],
      passions: apiData.passions || [],
      projets: apiData.projets || [],
      tags: apiData.tags || [],
      verified: apiData.verified || false,
      createdAt: new Date(apiData.created_at),
      // IMPORTANT: Récupérer le lien vers le compte utilisateur
      userId: apiData.user_id
    };
  }

  /**
   * Mapper un Talent frontend vers le format API
   */
  private mapTalentToApi(talent: Partial<Talent>): any {
    return {
      nom: talent.nom,
      age: talent.age,
      genre: talent.genre,
      origine: talent.origine,
      nationalite: talent.nationalite,
      ville: talent.ville,
      promo: talent.promo,
      email: talent.email,
      avatar_url: talent.avatarUrl,
      avatar_initials: talent.avatarInitials,
      avatar_color: talent.avatarColor,
      role: talent.role,
      niveau: talent.niveau,
      categorie: talent.categorie,
      bio: talent.bio,
      specificites: talent.specificites,
      domaines_application: talent.domainesApplication,
      stats: talent.stats,
      cout: talent.cout,
      limites: talent.limites,
      competences: talent.competences,
      forces_principales: talent.forcesPrincipales,
      bonus_passifs: talent.bonusPassifs,
      effets_speciaux: talent.effetsSpeciaux,
      synergies: talent.synergies,
      faiblesses: talent.faiblesses,
      historique: talent.historique,
      exemples_utilisation: talent.exemplesUtilisation,
      cas_reels: talent.casReels,
      evolution: talent.evolution,
      xp_actuel: talent.xpActuel,
      materiel_requis: talent.materielRequis,
      environnement_ideal: talent.environnementIdeal,
      competences_complementaires: talent.competencesComplementaires,
      style: talent.style,
      social: talent.social,
      langues: talent.langues,
      passions: talent.passions,
      projets: talent.projets,
      tags: talent.tags,
      verified: talent.verified,
      // IMPORTANT: Lier le talent au compte utilisateur !
      user_id: talent.userId
    };
  }

  /**
   * Ajouter un nouveau talent via l'API
   */
  async addTalent(talent: Talent): Promise<void> {
    console.log('✨ [FRONTEND] Création talent via API...', talent.nom);
    
    try {
      const apiData = this.mapTalentToApi(talent);
      const created = await firstValueFrom(this.http.post<any>(API_URL, apiData));
      
      console.log('✅ [FRONTEND] Talent créé dans SUPABASE ! ID:', created.id);
      
      // Recharger la liste
      await this.loadFromAPI();
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erreur création:', error.message || error);
      throw error;
    }
  }

  /**
   * Mettre à jour un talent existant via l'API
   */
  async updateTalent(id: string, partial: Partial<Talent>): Promise<void> {
    console.log('📝 [FRONTEND] Mise à jour talent via API...', id);
    
    try {
      const apiData = this.mapTalentToApi(partial);
      await firstValueFrom(this.http.put(`${API_URL}/${id}`, apiData));
      
      console.log('✅ [FRONTEND] Talent mis à jour dans SUPABASE !');
      
      // Recharger la liste
      await this.loadFromAPI();
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erreur mise à jour:', error.message || error);
      throw error;
    }
  }

  /**
   * Supprimer un talent via l'API
   */
  async deleteTalent(id: string): Promise<void> {
    console.log('🗑️ [FRONTEND] Suppression talent via API...', id);
    
    try {
      await firstValueFrom(this.http.delete(`${API_URL}/${id}`));
      
      console.log('✅ [FRONTEND] Talent supprimé de SUPABASE !');
      
      // Recharger la liste
      await this.loadFromAPI();
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erreur suppression:', error.message || error);
      throw error;
    }
  }

  /**
   * Basculer le statut vérifié via l'API
   */
  async toggleVerified(id: string): Promise<void> {
    console.log('✓ [FRONTEND] Toggle verified via API...', id);
    
    try {
      await firstValueFrom(this.http.patch(`${API_URL}/${id}/verify`, {}));
      
      console.log('✅ [FRONTEND] Statut vérifié mis à jour !');
      
      // Recharger la liste
      await this.loadFromAPI();
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erreur toggle:', error.message || error);
      throw error;
    }
  }

  /**
   * Récupérer un talent par ID
   */
  getById(id: string): Talent | undefined {
    return this._talents$.getValue().find((t) => t.id === id);
  }

  /**
   * Recharger les données depuis l'API
   */
  async refresh(): Promise<void> {
    await this.loadFromAPI();
  }

  /**
   * Réinitialiser avec les données mock (pour debug)
   */
  resetToMock(): void {
    this._talents$.next([...MOCK_TALENTS]);
    console.log('🔄 Données réinitialisées avec les mock (local uniquement)');
  }

  /**
   * Effacer toutes les données locales
   */
  clearAll(): void {
    this._talents$.next([]);
    console.log('🗑️ Toutes les données locales effacées');
  }

  // Méthodes utilitaires (fonctionnent sur les données en mémoire)
  getTalentsByCategorie(categorie: CategorieTalent): Talent[] {
    return this._talents$.getValue().filter(t => t.categorie === categorie);
  }

  getTalentsByNiveau(niveau: NiveauMaitrise): Talent[] {
    return this._talents$.getValue().filter(t => t.niveau === niveau);
  }

  searchTalents(query: string): Talent[] {
    const q = query.toLowerCase();
    return this._talents$.getValue().filter(t => {
      const searchable = [
        t.nom, t.role, t.bio, t.ville,
        ...t.competences, ...t.tags, ...t.passions
      ].filter(Boolean).join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }

  /**
   * Obtenir le nombre de talents
   */
  getTalentsCount(): number {
    return this._talents$.getValue().length;
  }
}
