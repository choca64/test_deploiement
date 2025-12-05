import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig, validateSupabaseConfig } from '../../../config/supabase.config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  async onModuleInit() {
    console.log('');
    console.log('\x1b[36m╔════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[36m║          🗄️  CONNEXION SUPABASE                        ║\x1b[0m');
    console.log('\x1b[36m╚════════════════════════════════════════════════════════╝\x1b[0m');
    
    validateSupabaseConfig();
    
    console.log('\x1b[33m📡 URL:\x1b[0m', supabaseConfig.url);
    console.log('\x1b[33m🔑 API Key:\x1b[0m', supabaseConfig.anonKey.substring(0, 20) + '...');
    
    this.supabase = createClient(
      supabaseConfig.url,
      supabaseConfig.anonKey
    );

    // Test de connexion
    try {
      const { data, error } = await this.supabase.from('talents').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log('\x1b[31m❌ ERREUR DE CONNEXION À SUPABASE:\x1b[0m', error.message);
        console.log('\x1b[33m⚠️  Vérifiez que la table "talents" existe dans Supabase\x1b[0m');
      } else {
        console.log('\x1b[32m✅ CONNEXION SUPABASE RÉUSSIE !\x1b[0m');
        console.log('\x1b[32m🎉 Base de données prête à recevoir des données\x1b[0m');
      }
    } catch (e) {
      console.log('\x1b[31m❌ Impossible de tester la connexion\x1b[0m');
    }
    
    console.log('\x1b[36m══════════════════════════════════════════════════════════\x1b[0m');
    console.log('');
  }

  /**
   * Retourne le client Supabase pour effectuer des requêtes
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}

