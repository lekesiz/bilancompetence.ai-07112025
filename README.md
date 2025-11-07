# BilanCompetence.AI v2.0

**Plateforme SaaS de Bilans de Compétences avec Intelligence Artificielle**

## 🚀 Projet

BilanCompetence.AI est une plateforme digitale innovante qui modernise le processus de bilan de compétences en France. Elle combine l'expertise humaine des consultants avec la puissance de l'intelligence artificielle pour offrir une expérience optimale aux bénéficiaires, consultants et organismes de formation.

## 📋 Statut du Projet

**Version**: 2.0 (Refonte complète)  
**Date de début**: 7 novembre 2025  
**Phase actuelle**: Initialisation et conception  
**Porteur du projet**: NETZ INFORMATIQUE

## 🏗️ Architecture Technique

### Stack Technologique

- **Framework**: Next.js 15 (App Router) - Full-stack
- **Base de données**: Supabase PostgreSQL
- **ORM**: Prisma
- **Déploiement**: Vercel
- **Styling**: Tailwind CSS + shadcn/ui
- **IA**: Google Gemini 2.0 Flash
- **Intégration**: API France Travail (ROME)

### Principes Architecturaux

1. **Simplicité**: Une seule application Next.js (pas de monorepo)
2. **Unification**: Backend et frontend dans le même projet
3. **Scalabilité**: Architecture cloud-native
4. **Maintenabilité**: Code propre, types partagés, documentation continue

## 📁 Structure du Projet

```
bilancompetence.ai-v2/
├── prisma/                 # Schéma et migrations DB
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/       # Routes authentification
│   │   ├── (dashboard)/  # Routes protégées
│   │   └── api/          # API Routes (backend)
│   ├── components/       # Composants React
│   ├── lib/             # Utilitaires et clients
│   └── types/           # Types TypeScript
├── public/              # Assets statiques
└── docs/                # Documentation
```

## 🎯 Fonctionnalités Principales

### MVP (Phase 1)
- ✅ Authentification multi-rôles (BENEFICIARY, CONSULTANT, ORG_ADMIN, ADMIN)
- ✅ Gestion des bilans de compétences (CRUD)
- ✅ Workflow en 3 phases (Préliminaire, Investigation, Conclusion)
- ✅ Évaluation des compétences
- ✅ Génération de documents PDF

### Phase 2 (IA et Intégrations)
- 🔄 Analyse CV avec Gemini
- 🔄 Recommandations métiers personnalisées
- 🔄 Intégration API France Travail (ROME)
- 🔄 Messagerie interne temps réel

### Phase 3 (Conformité et Qualité)
- ⏳ Module Qualiopi
- ⏳ Conformité RGPD
- ⏳ Enquêtes de satisfaction
- ⏳ Logs d'audit

## 🔐 Sécurité

- Row Level Security (RLS) Supabase
- Authentification sécurisée (JWT)
- Chiffrement des données sensibles
- Logs d'audit complets
- Conformité RGPD

## 📊 Modèle de Données

Le schéma de base de données comprend :

- **users**: Utilisateurs (4 rôles)
- **organizations**: Organismes de formation
- **bilans**: Bilans de compétences
- **sessions**: Séances d'accompagnement
- **recommendations**: Recommandations IA
- **documents**: Stockage fichiers
- **messages**: Messagerie interne
- **satisfaction_surveys**: Enquêtes Qualiopi
- **audit_logs**: Traçabilité

Voir `schema_prisma_draft.prisma` pour le schéma complet.

## 🚦 Roadmap

### Phase 0: Préparation (EN COURS)
- [x] Analyse ancien projet
- [x] Lecture cahier des charges
- [x] Définition architecture v2.0
- [x] Création documents stratégiques
- [ ] Initialisation projet Next.js

### Phase 1: Fondations (Semaine 1)
- [ ] Setup Next.js 15 + TypeScript
- [ ] Configuration Prisma + Supabase
- [ ] Authentification et rôles
- [ ] Déploiement Vercel

### Phase 2: MVP Métier (Semaines 2-3)
- [ ] CRUD Bilans
- [ ] Gestion utilisateurs
- [ ] Évaluation compétences
- [ ] Génération PDF

### Phase 3: IA et Intégrations (Semaine 4)
- [ ] Intégration Gemini
- [ ] API France Travail
- [ ] Messagerie temps réel

### Phase 4: Conformité (Semaine 5)
- [ ] Module Qualiopi
- [ ] Sécurité RGPD
- [ ] Tests de charge

### Phase 5: Production (Semaine 6)
- [ ] Déploiement production
- [ ] Documentation complète
- [ ] Formation utilisateurs

## 📝 Documentation

- **Analyse et Stratégie**: `ANALYSE_ET_STRATEGIE.md`
- **Cahier des Charges**: Voir fichier joint du client
- **Schéma DB**: `schema_prisma_draft.prisma`

## 🤝 Contribution

Ce projet est développé par **Manus AI** pour **NETZ INFORMATIQUE**.

### Workflow Git

1. Branches:
   - `main`: Production (protégée)
   - `develop`: Développement principal
   - `feature/*`: Fonctionnalités
   - `fix/*`: Corrections

2. Commits: Format `type(scope): message`
   ```
   feat(auth): add login page
   fix(bilans): correct status transition
   docs(readme): update installation
   ```

3. Process:
   - Créer branche depuis `develop`
   - Développer + commits réguliers
   - Push vers GitHub
   - Merge vers `develop`
   - Deploy auto Vercel (preview)
   - Merge vers `main` → Production

## 🔧 Installation (À venir)

```bash
# Cloner le repo
git clone https://github.com/lekesiz/bilancompetence.ai-07112025.git
cd bilancompetence.ai-07112025

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Lancer la base de données
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

## 📧 Contact

**Porteur du projet**: NETZ INFORMATIQUE  
**Développement**: Manus AI  
**Date**: Novembre 2025

---

**Note**: Ce projet est une refonte complète de l'ancien `bilancompetence.ai`. L'architecture a été entièrement repensée pour la simplicité, la maintenabilité et la scalabilité.
