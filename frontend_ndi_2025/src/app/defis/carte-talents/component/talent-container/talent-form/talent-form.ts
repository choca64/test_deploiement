import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Talent, 
  TalentService, 
  NiveauMaitrise, 
  CategorieTalent,
  ImpactLevel 
} from '../../../services/talent.service';
import { AuthService, User } from '../../../../../auth/services/auth.service';

@Component({
  selector: 'app-talent-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './talent-form.html',
  styleUrls: ['./talent-form.css']
})
export class TalentForm implements OnInit {
  @Output() talentCreated = new EventEmitter<Talent>();

  currentUser: User | null = null;

  // Options pour les selects
  niveaux: NiveauMaitrise[] = ['débutant', 'intermédiaire', 'avancé', 'expert', 'maître', 'légendaire'];
  categories: CategorieTalent[] = ['technique', 'artistique', 'physique', 'social', 'analytique', 'créatif', 'leadership'];
  impacts: ImpactLevel[] = ['faible', 'moyen', 'fort', 'destructeur'];
  
  // Formulaire
  form = {
    // 1. Infos générales
    nom: '',
    age: null as number | null,
    genre: 'non-specifie' as 'homme' | 'femme' | 'autre' | 'non-specifie',
    origine: '',
    nationalite: '',
    ville: '',
    promo: '',
    email: '',
    
    // 2. Description du talent
    role: '',
    niveau: 'intermédiaire' as NiveauMaitrise,
    categorie: 'technique' as CategorieTalent,
    bio: '',
    specificites: '',  // sera splitté en array
    domainesApplication: '', // sera splitté
    
    // 3. Stats
    statPrincipalNom: 'Créativité',
    statPrincipalValeur: 75,
    statSecondaire1Nom: '',
    statSecondaire1Valeur: 70,
    statSecondaire2Nom: '',
    statSecondaire2Valeur: 65,
    tauxReussite: 85,
    precision: 80,
    rapidite: 75,
    impact: 'moyen' as ImpactLevel,
    
    // 4. Coûts et limites
    energie: 30,
    fatigue: 25,
    ressourcesRequises: '',
    conditions: '',
    dureeEffet: '',
    cooldown: '',
    frequenceMax: '',
    risqueEchec: 10,
    
    // 5. Compétences
    competences: '',
    forcesPrincipales: '',
    bonusPassifs: '',
    effetsSpeciaux: '',
    
    // 6. Synergies
    talentsCompatibles: '',
    bonusEquipe: '',
    situationsExcellence: '',
    combos: '',
    
    // 7. Faiblesses
    contreIndications: '',
    talentsNeutralisants: '',
    defautsNaturels: '',
    coutEleve: '',
    
    // 8. Historique
    acquisition: '',
    mentor: '',
    formation: '',
    evenementDeclencheur: '',
    evolutionTemps: '',
    
    // 9. Exemples
    exemplesUtilisation: '',
    casReels: '',
    
    // 10. Évolution
    niveauSuivant: '',
    conditionsAmelioration: '',
    capacitesDebloquables: '',
    xpNecessaire: 2000,
    xpActuel: 0,
    
    // 11. Ressources
    materielRequis: '',
    environnementIdeal: '',
    competencesComplementaires: '',
    
    // 12. Style
    signature: '',
    surnom: '',
    citation: '',
    effetsVisuels: '',
    
    // 13. Social
    appreciePar: '',
    redoutePar: '',
    influenceGroupe: '',
    compatibilitesProfils: '',
    
    // 14. Autres
    langues: '',
    passions: '',
    projets: '',
    tags: '',
    verified: false
  };

  // Couleurs d'avatar
  avatarColors = [
    '#22c55e', '#3DB4AD', '#F97316', '#5ECEC7',
    '#FF7F6B', '#F5D547', '#8B5CF6', '#EC4899'
  ];
  selectedColor = '#22c55e';

  currentStep = 1;
  totalSteps = 6;

  constructor(
    private talentService: TalentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Pré-remplir avec les infos de l'utilisateur connecté
    if (this.currentUser) {
      this.form.nom = this.currentUser.displayName || this.currentUser.username;
      this.form.email = this.currentUser.email;
      if (this.currentUser.ville) this.form.ville = this.currentUser.ville;
      if (this.currentUser.promo) this.form.promo = this.currentUser.promo;
      if (this.currentUser.avatarColor) this.selectedColor = this.currentUser.avatarColor;
    }
  }

  // Helpers pour split les strings en arrays
  private splitToArray(str: string): string[] {
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  onSubmit() {
    const talent: Talent = {
      id: Date.now().toString(),
      
      // Infos générales
      nom: this.form.nom,
      age: this.form.age || undefined,
      genre: this.form.genre,
      origine: this.form.origine || undefined,
      nationalite: this.form.nationalite || undefined,
      ville: this.form.ville || undefined,
      promo: this.form.promo || undefined,
      email: this.form.email || undefined,
      avatarColor: this.selectedColor,
      
      // Description
      role: this.form.role,
      niveau: this.form.niveau,
      categorie: this.form.categorie,
      bio: this.form.bio || undefined,
      specificites: this.splitToArray(this.form.specificites),
      domainesApplication: this.splitToArray(this.form.domainesApplication),
      
      // Stats
      stats: {
        principale: { 
          nom: this.form.statPrincipalNom, 
          valeur: this.form.statPrincipalValeur 
        },
        secondaires: [
          { nom: this.form.statSecondaire1Nom || 'Adaptabilité', valeur: this.form.statSecondaire1Valeur },
          { nom: this.form.statSecondaire2Nom || 'Communication', valeur: this.form.statSecondaire2Valeur }
        ].filter(s => s.nom),
        tauxReussite: this.form.tauxReussite,
        precision: this.form.precision,
        rapidite: this.form.rapidite,
        impact: this.form.impact
      },
      
      // Coûts
      cout: {
        energie: this.form.energie,
        fatigue: this.form.fatigue,
        ressourcesRequises: this.splitToArray(this.form.ressourcesRequises)
      },
      
      // Limites
      limites: {
        conditions: this.splitToArray(this.form.conditions),
        dureeEffet: this.form.dureeEffet || undefined,
        cooldown: this.form.cooldown || undefined,
        frequenceMax: this.form.frequenceMax || undefined,
        risqueEchec: this.form.risqueEchec
      },
      
      // Compétences
      competences: this.splitToArray(this.form.competences),
      forcesPrincipales: this.splitToArray(this.form.forcesPrincipales),
      bonusPassifs: this.splitToArray(this.form.bonusPassifs),
      effetsSpeciaux: this.splitToArray(this.form.effetsSpeciaux),
      
      // Synergies
      synergies: {
        talentsCompatibles: this.splitToArray(this.form.talentsCompatibles),
        bonusEquipe: this.splitToArray(this.form.bonusEquipe),
        situationsExcellence: this.splitToArray(this.form.situationsExcellence),
        combos: this.splitToArray(this.form.combos)
      },
      
      // Faiblesses
      faiblesses: {
        contreIndications: this.splitToArray(this.form.contreIndications),
        talentsNeutralisants: this.splitToArray(this.form.talentsNeutralisants),
        defautsNaturels: this.splitToArray(this.form.defautsNaturels),
        coutEleve: this.splitToArray(this.form.coutEleve)
      },
      
      // Historique
      historique: {
        acquisition: this.form.acquisition,
        mentor: this.form.mentor || undefined,
        formation: this.form.formation || undefined,
        evenementDeclencheur: this.form.evenementDeclencheur || undefined,
        evolutionTemps: this.splitToArray(this.form.evolutionTemps)
      },
      
      // Exemples
      exemplesUtilisation: this.splitToArray(this.form.exemplesUtilisation),
      casReels: this.splitToArray(this.form.casReels),
      
      // Évolution
      evolution: {
        niveauSuivant: this.form.niveauSuivant || undefined,
        conditionsAmelioration: this.splitToArray(this.form.conditionsAmelioration),
        capacitesDebloquables: this.splitToArray(this.form.capacitesDebloquables),
        xpNecessaire: this.form.xpNecessaire
      },
      xpActuel: this.form.xpActuel,
      
      // Ressources
      materielRequis: this.splitToArray(this.form.materielRequis),
      environnementIdeal: this.splitToArray(this.form.environnementIdeal),
      competencesComplementaires: this.splitToArray(this.form.competencesComplementaires),
      
      // Style
      style: {
        signature: this.form.signature || undefined,
        surnom: this.form.surnom || undefined,
        citation: this.form.citation || undefined,
        effetsVisuels: this.form.effetsVisuels || undefined
      },
      
      // Social
      social: {
        appreciePar: this.splitToArray(this.form.appreciePar),
        redoutePar: this.splitToArray(this.form.redoutePar),
        influenceGroupe: this.form.influenceGroupe,
        compatibilitesProfils: this.splitToArray(this.form.compatibilitesProfils)
      },
      
      // Autres
      langues: this.splitToArray(this.form.langues),
      passions: this.splitToArray(this.form.passions),
      projets: this.splitToArray(this.form.projets),
      tags: this.splitToArray(this.form.tags),
      verified: this.form.verified,
      createdAt: new Date(),
      
      // Lien avec l'utilisateur connecté
      userId: this.currentUser?.id
    };

    console.log('🎯 [TALENT] Création talent avec userId:', talent.userId);
    this.talentService.addTalent(talent);
    this.talentCreated.emit(talent);
  }
}

