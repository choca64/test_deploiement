/**
 * Configuration de production
 * IMPORTANT: Mets à jour apiUrl avec ton URL Render après déploiement !
 */
export const environment = {
  production: true,
  
  // URL du backend NestJS sur Render
  apiUrl: 'https://test-deploiement-backend-ndi-2025.onrender.com',
  
  // Configuration Supabase
  supabase: {
    url: 'https://qdyownvtfqkmdmulgzvc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeW93bnZ0ZnFrbWRtdWxnenZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTUzNTAsImV4cCI6MjA4MDQ3MTM1MH0.GqBksMkc76kXNCFL1y6WJkBBOaWay8ANrfEOQppbOks'
  }
};

