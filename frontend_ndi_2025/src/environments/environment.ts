/**
 * Configuration de développement
 * Ce fichier contient les URLs pour l'environnement de développement
 */
export const environment = {
  production: false,
  
  // URL du backend NestJS
  apiUrl: 'http://localhost:3000',
  
  // Configuration Supabase
  supabase: {
    url: 'https://qdyownvtfqkmdmulgzvc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeW93bnZ0ZnFrbWRtdWxnenZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTUzNTAsImV4cCI6MjA4MDQ3MTM1MH0.GqBksMkc76kXNCFL1y6WJkBBOaWay8ANrfEOQppbOks'
  }
};

