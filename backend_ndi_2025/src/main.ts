import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app.module';

// Charger les variables d'environnement depuis .env
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour permettre les requêtes depuis le frontend
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // URL Vercel
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (ex: Postman, curl)
      if (!origin) return callback(null, true);
      
      // Autoriser les origines dans la liste ou les domaines Vercel
      if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
        return callback(null, true);
      }
      
      callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  
  // Bind sur 0.0.0.0 pour Render
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend démarré sur le port ${port}`);
}
bootstrap();
