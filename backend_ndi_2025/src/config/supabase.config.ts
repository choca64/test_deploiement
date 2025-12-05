/**
 * Configuration Supabase
 * Les valeurs sont lues depuis les variables d'environnement ou utilisent les valeurs par défaut
 */
export const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://qdyownvtfqkmdmulgzvc.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeW93bnZ0ZnFrbWRtdWxnenZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTUzNTAsImV4cCI6MjA4MDQ3MTM1MH0.GqBksMkc76kXNCFL1y6WJkBBOaWay8ANrfEOQppbOks',
};

/**
 * Vérifie que la configuration Supabase est valide
 */
export function validateSupabaseConfig(): void {
  if (!supabaseConfig.url) {
    console.error('❌ SUPABASE_URL manquant dans les variables d\'environnement');
    throw new Error('SUPABASE_URL est requis');
  }
  if (!supabaseConfig.anonKey) {
    console.error('❌ SUPABASE_ANON_KEY manquant dans les variables d\'environnement');
    throw new Error('SUPABASE_ANON_KEY est requis');
  }
  console.log('✅ Configuration Supabase valide');
}

