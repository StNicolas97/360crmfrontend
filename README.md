# 360 AutoWrap CRM — Frontend

CRM sur mesure développé pour **360 AutoWrap**, un atelier de covering automobile (PPF, lettrage, affichage).
L'application centralise le suivi des travaux de l'atelier : tâches et sous-tâches, production en Kanban,
calendrier, fiches clients, gestion des employés et suivi des pertes de matériel.

> Ce dépôt contient uniquement le **frontend**. L'API backend (Node.js / Express, base de données, intégration QuickBooks)
> est dans un dépôt **privé** : l'application ne peut donc pas être lancée seule sans une API compatible.

## Fonctionnalités

- Authentification JWT et interface adaptée au rôle (employé / administrateur)
- Tableau de bord, calendrier (FullCalendar) et tableau Kanban de production
- Gestion des tâches PPF, lettrage et affichage avec formulaires dynamiques
- Fiches clients, employés et suivi des pertes
- Interface responsive (desktop, tablette, mobile)

## Stack

**Vue 3** · **Vite** · **Pinia** · **Vue Router** · **Axios** · **Bootstrap 5** · **Sass** · **FullCalendar** · **Vitest**

## Compétences mises en œuvre

- Conception d'une SPA Vue 3 structurée (Composition API, composables, composants réutilisables)
- Gestion d'état centralisée avec Pinia et cache local des données
- Consommation d'une API REST sécurisée (intercepteurs Axios, gestion des jetons et des erreurs)
- Contrôle d'accès par rôles côté interface (routes protégées, champs en lecture seule)
- Formulaires déclaratifs pilotés par configuration
- Responsive design et adaptation tactile
- Tests unitaires et de composants avec Vitest
- Travail sur un projet réel, pour un client réel, du besoin métier à la mise en production

## Lancer le projet

```bash
npm install
cp .env.example .env.local   # définir VITE_API_URL
npm run dev
```
