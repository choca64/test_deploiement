/**
 * Configuration de production
 * IMPORTANT: Mets à jour apiUrl avec ton URL Render après déploiement !
 */
export const environment = {
  production: true,
  
  // URL du backend NestJS sur Render
  // ⚠️ REMPLACE PAR TON URL RENDER (ex: https://ndi-2025-backend.onrender.com)
  apiUrl: 'https://ndi-2025-backend.onrender.com',
  
  // Configuration Supabase
  supabase: {
    url: 'https://qdyownvtfqkmdmulgzvc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeW93bnZ0ZnFrbWRtdWxnenZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTUzNTAsImV4cCI6MjA4MDQ3MTM1MH0.GqBksMkc76kXNCFL1y6WJkBBOaWay8ANrfEOQppbOks'
  }
};

