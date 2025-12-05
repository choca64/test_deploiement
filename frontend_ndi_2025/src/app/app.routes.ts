import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'landing-page',
        pathMatch: 'full'
    },
    {
        path: 'landing-page',
        loadComponent: () => import('./defis/carte-talents/pages/landing-page/landing-page').then(m => m.LandingPage),
        data: { animation: 'LandingPage' }
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/pages/login/login').then(m => m.LoginPage),
        data: { animation: 'LoginPage' }
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/pages/register/register').then(m => m.RegisterPage),
        data: { animation: 'RegisterPage' }
    },
    {
        path: 'talents',
        loadComponent: () => import('./defis/carte-talents/pages/talent-page/talent-page').then(m => m.TalentPage),
        data: { animation: 'TalentsPage' }
    },
    {
        path: 'add-talent',
        loadComponent: () => import('./defis/carte-talents/pages/add-talent-page/add-talent-page').then(m => m.AddTalentPage),
        data: { animation: 'AddTalentPage' }
    },
    {
        path: 'collaborations',
        loadComponent: () => import('./defis/carte-talents/pages/collaborations-page/collaborations-page').then(m => m.CollaborationsPage),
        data: { animation: 'CollaborationsPage' }
    },
    {
        path: 'messages',
        loadComponent: () => import('./pages/messages/messages').then(m => m.MessagesPage),
        data: { animation: 'MessagesPage' }
    }
];
