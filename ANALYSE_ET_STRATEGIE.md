# Analyse et Stratégie de Reconstruction - BilanCompetence.AI v2.0

**Date**: 7 novembre 2025  
**Projet**: BilanCompetence.AI - Refonte complète  
**Responsable**: NETZ INFORMATIQUE  

---

## 1. ANALYSE DE L'ANCIEN PROJET

### 1.1 Architecture Actuelle (Problématique)

L'ancien projet (`bilancompetence.ai`) présente une architecture **monorepo complexe** avec plusieurs problèmes majeurs :

#### Structure Technique Actuelle
- **Frontend**: Next.js 14 (App Router) dans `apps/frontend`
- **Backend**: Express.js séparé dans `apps/backend`
- **Base de données**: Supabase PostgreSQL
- **Déploiement**: Vercel (frontend) + Railway/Neon (backend) - **PROBLÈME MAJEUR**

#### Problèmes Identifiés

1. **Séparation Frontend/Backend inutile**
   - Next.js peut gérer le backend via API Routes
   - Déploiement sur deux plateformes différentes (Vercel + Railway)
   - Complexité de synchronisation des environnements
   - Coûts d'infrastructure multipliés

2. **Multiples bases de données**
   - Supabase ET Neon mentionnés dans les configurations
   - Confusion dans les connexions
   - Migrations dispersées

3. **Complexité excessive**
   - Monorepo avec workspaces npm
   - Configuration Docker complexe
   - Scripts de migration multiples et conflictuels
   - Documentation fragmentée (100+ fichiers MD)

4. **Problèmes de maintenance**
   - Code dupliqué entre frontend et backend
   - Types TypeScript non partagés efficacement
   - Tests E2E nombreux mais fragiles

### 1.2 Éléments Réutilisables

Malgré les problèmes, l'ancien projet contient des éléments précieux :

#### ✅ Schéma de Base de Données (Excellent)
```sql
Tables principales identifiées:
- users (id, email, full_name, role, organization_id)
- organizations (id, name, settings)
- bilans (id, beneficiary_id, consultant_id, status, dates)
- assessments (évaluations de compétences)
- sessions (séances d'accompagnement)
- recommendations (recommandations IA)
- messages (messagerie interne)
- documents (stockage fichiers)
- satisfaction_surveys + survey_responses (Qualiopi)
- audit_logs (traçabilité)

Rôles: BENEFICIARY, CONSULTANT, ORG_ADMIN, ADMIN
Statuts bilan: PRELIMINARY, INVESTIGATION, CONCLUSION, COMPLETED, ARCHIVED
```

#### ✅ Composants UI Réutilisables
- Design system basé sur Tailwind CSS
- Composants React bien structurés
- Système d'internationalisation (next-intl)

#### ✅ Logique Métier
- Gestion des bilans de compétences
- Workflow en 3 phases (conforme au cahier des charges)
- Système de permissions RLS (Row Level Security)

---

## 2. STRATÉGIE DE RECONSTRUCTION

### 2.1 Nouvelle Architecture (Simplifiée)

#### Principe Directeur
**"Une application Next.js full-stack unifiée, déployée sur Vercel, connectée à Supabase"**

#### Stack Technique v2.0

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Framework** | Next.js 15 (App Router) | Full-stack (frontend + backend API), SSR, optimisé Vercel |
| **Base de données** | Supabase PostgreSQL | Auth intégrée, Storage, Realtime, RLS natif |
| **ORM** | Prisma | Type-safety, migrations gérées, excellent avec PostgreSQL |
| **Déploiement** | Vercel | Intégration native Next.js, CI/CD automatique, edge functions |
| **Styling** | Tailwind CSS | Rapidité, cohérence, déjà utilisé dans l'ancien projet |
| **UI Components** | shadcn/ui | Composants accessibles, personnalisables, basés sur Radix |
| **Validation** | Zod | Validation type-safe, réutilisable frontend/backend |
| **IA** | Google Gemini 2.0 Flash | Conforme cahier des charges (section 5.1) |
| **Intégration** | France Travail API | Conforme cahier des charges (section 5.2) |

#### Avantages de cette Architecture

1. **Simplicité**
   - Un seul projet Next.js
   - Un seul déploiement (Vercel)
   - Une seule base de données (Supabase)

2. **Performance**
   - Server Components Next.js (SSR)
   - Edge Functions Vercel
   - Caching optimisé

3. **Maintenabilité**
   - Code unifié
   - Types partagés automatiquement
   - Migrations Prisma simples

4. **Coûts**
   - Vercel: gratuit jusqu'à usage significatif
   - Supabase: gratuit jusqu'à 500MB + 2GB bande passante
   - Pas de Railway/Neon nécessaire

### 2.2 Structure du Projet

```
bilancompetence.ai-v2/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── migrations/            # Migrations versionnées
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Routes authentification
│   │   ├── (dashboard)/      # Routes protégées
│   │   ├── api/              # API Routes (backend)
│   │   └── layout.tsx
│   ├── components/           # Composants React
│   │   ├── ui/              # Composants de base (shadcn)
│   │   ├── bilans/          # Composants métier
│   │   └── layouts/
│   ├── lib/                 # Utilitaires
│   │   ├── db.ts           # Client Prisma
│   │   ├── supabase.ts     # Client Supabase
│   │   ├── ai/             # Intégration Gemini
│   │   └── france-travail/ # API France Travail
│   ├── types/              # Types TypeScript
│   └── middleware.ts       # Middleware Next.js (auth)
├── public/                 # Assets statiques
├── .env.local             # Variables d'environnement
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### 2.3 Conformité au Cahier des Charges

| Exigence CDC | Solution Technique |
|--------------|-------------------|
| **3 rôles utilisateurs** | Prisma enum + RLS Supabase |
| **Processus 3 phases** | State machine dans bilans table |
| **IA analyse compétences** | Google Gemini API (section 5.1) |
| **France Travail** | API REST + cache Redis (Vercel KV) |
| **Messagerie** | Socket.io ou Supabase Realtime |
| **Génération PDF** | react-pdf ou pdfkit |
| **Conformité Qualiopi** | Module dédié avec indicateurs |
| **RGPD** | RLS Supabase + audit logs |
| **Performance 99.5%** | Vercel SLA + monitoring Sentry |

---

## 3. PLAN D'EXÉCUTION (A à Z)

### Phase 0: Préparation (EN COURS)
**Durée**: 1 jour  
**Statut**: ✅ Analyse terminée

- [x] Analyse ancien projet
- [x] Lecture cahier des charges
- [x] Définition architecture v2.0
- [ ] Création document de stratégie
- [ ] Initialisation nouveau repo Git

### Phase 1: Fondations (Semaine 1)
**Objectif**: Projet Next.js fonctionnel avec auth et DB

#### Tâches
1. **Setup projet**
   - Initialiser Next.js 15 avec TypeScript
   - Configurer Tailwind CSS + shadcn/ui
   - Setup Prisma + connexion Supabase
   - Configuration ESLint + Prettier

2. **Base de données**
   - Créer schéma Prisma (migration depuis ancien schéma SQL)
   - Exécuter première migration
   - Seed data de test

3. **Authentification**
   - Middleware Next.js pour protection routes
   - Pages login/register
   - Gestion sessions (Supabase Auth)
   - Système de rôles (RBAC)

4. **Git et CI/CD**
   - Commit initial sur nouveau repo
   - Configuration Vercel (auto-deploy)
   - Variables d'environnement

**Livrable**: Application déployée avec login fonctionnel

### Phase 2: MVP Métier (Semaines 2-3)
**Objectif**: Fonctionnalités essentielles du bilan de compétences

#### Tâches
1. **CRUD Bilans**
   - Liste des bilans (par rôle)
   - Création nouveau bilan (ORG_ADMIN)
   - Détail bilan avec statut
   - Workflow 3 phases

2. **Gestion Utilisateurs**
   - Dashboard admin
   - Invitation consultants
   - Affectation bénéficiaires

3. **Évaluation Compétences**
   - Formulaire auto-évaluation
   - Validation consultant
   - Stockage JSONB

4. **Documents**
   - Upload CV (Supabase Storage)
   - Génération PDF synthèse basique

**Livrable**: MVP testable par 5 consultants beta

### Phase 3: IA et Intégrations (Semaine 4)
**Objectif**: Valeur ajoutée IA + France Travail

#### Tâches
1. **Intégration Gemini**
   - Analyse CV (extraction compétences)
   - Recommandations métiers
   - Génération contenu synthèse

2. **France Travail API**
   - Connexion API ROME
   - Matching compétences ↔ métiers
   - Cache des données (Vercel KV)

3. **Messagerie**
   - Système messages internes
   - Notifications temps réel

**Livrable**: Système intelligent fonctionnel

### Phase 4: Conformité et Qualité (Semaine 5)
**Objectif**: Qualiopi + RGPD + Performance

#### Tâches
1. **Module Qualiopi**
   - Indicateurs de qualité
   - Enquêtes satisfaction
   - Exports pour audits

2. **Sécurité**
   - Audit RGPD
   - Tests de sécurité
   - Logs d'audit

3. **Performance**
   - Optimisation requêtes
   - Caching stratégique
   - Tests de charge

**Livrable**: Application production-ready

### Phase 5: Déploiement et Documentation (Semaine 6)
**Objectif**: Mise en production et transfert de connaissances

#### Tâches
1. **Production**
   - Configuration domaine
   - SSL/HTTPS
   - Monitoring (Sentry, Vercel Analytics)

2. **Documentation**
   - README complet
   - Guide utilisateur
   - Documentation technique
   - Runbook opérationnel

3. **Formation**
   - Vidéos tutoriels
   - Guide administrateur

**Livrable**: Plateforme en ligne + documentation complète

---

## 4. GESTION GIT ET SUIVI

### 4.1 Stratégie Git

#### Branches
- `main`: Production (protégée)
- `develop`: Développement principal
- `feature/*`: Fonctionnalités
- `fix/*`: Corrections

#### Commits
Format: `type(scope): message`

Exemples:
```
feat(auth): add login page with Supabase
fix(bilans): correct status transition bug
docs(readme): update installation instructions
```

#### Workflow
1. Créer branche feature depuis develop
2. Développer + commit réguliers
3. Push vers GitHub
4. Merge vers develop (review)
5. Deploy automatique Vercel (preview)
6. Merge vers main → Production

### 4.2 Suivi de Projet

#### Outils
- **GitHub Projects**: Kanban board
- **GitHub Issues**: Tickets de tâches
- **GitHub Milestones**: Phases du projet

#### Rapports Réguliers
Fréquence: **Fin de chaque journée de travail**

Format:
```markdown
## Rapport du [DATE]

### ✅ Terminé
- [x] Tâche 1
- [x] Tâche 2

### 🚧 En cours
- [ ] Tâche 3 (50%)

### 📋 Prochaines étapes
- [ ] Tâche 4
- [ ] Tâche 5

### ⚠️ Blocages
- Aucun / [Description si blocage]
```

---

## 5. PROCHAINES ACTIONS IMMÉDIATES

### À faire maintenant (Ordre de priorité)

1. **Valider cette stratégie avec le client** ✋
   - Confirmer l'architecture proposée
   - Valider le planning
   - Obtenir accès Vercel + Supabase

2. **Initialiser le nouveau projet**
   - Créer projet Next.js 15
   - Configurer Prisma
   - Premier commit sur nouveau repo

3. **Créer schéma Prisma**
   - Migrer schéma SQL vers Prisma
   - Tester connexion Supabase

4. **Développer authentification**
   - Pages login/register
   - Middleware protection
   - Tests

---

## 6. QUESTIONS POUR LE CLIENT

Avant de commencer le développement, nous avons besoin de :

1. **Accès Vercel**
   - Avez-vous déjà un compte Vercel ?
   - Puis-je avoir les droits de déploiement ?

2. **Accès Supabase**
   - Faut-il créer un nouveau projet Supabase ?
   - Ou réutiliser l'ancien (après nettoyage) ?

3. **Domaine**
   - Quel domaine utiliser ? (bilancompetence.ai ?)
   - Configuration DNS disponible ?

4. **Priorités**
   - Y a-t-il des fonctionnalités prioritaires dans le MVP ?
   - Des consultants beta déjà identifiés ?

---

## 7. ENGAGEMENT QUALITÉ

### Principes de Développement

1. **Code propre**
   - TypeScript strict
   - ESLint + Prettier
   - Tests unitaires (Jest)

2. **Git rigoureux**
   - Commits atomiques et descriptifs
   - Branches par fonctionnalité
   - Revue de code systématique

3. **Documentation continue**
   - Code commenté
   - README à jour
   - Changelog détaillé

4. **Tests réguliers**
   - Test après chaque feature
   - Validation en environnement de staging
   - Feedback utilisateur intégré

### Garanties

- ✅ **Pas de code dupliqué** (DRY)
- ✅ **Pas de dette technique** (refactoring continu)
- ✅ **Pas de dépendances inutiles** (bundle optimisé)
- ✅ **Pas de secrets en clair** (variables d'environnement)

---

## CONCLUSION

Cette stratégie propose une **refonte complète et simplifiée** du projet BilanCompetence.AI, en éliminant les sources de complexité de l'ancien système (monorepo, backend séparé, multiples bases de données) au profit d'une **architecture moderne et unifiée** basée sur Next.js 15 full-stack.

**Avantages clés** :
- 🚀 **Simplicité** : Un seul projet, un seul déploiement
- 💰 **Coûts réduits** : Vercel + Supabase gratuits en phase de démarrage
- 🔧 **Maintenabilité** : Code unifié, types partagés
- 📈 **Scalabilité** : Architecture cloud-native
- ✅ **Conformité** : Respect total du cahier des charges

**Prêt à démarrer** dès validation de cette stratégie et obtention des accès nécessaires.

---

**Document préparé par** : Manus AI  
**Pour** : NETZ INFORMATIQUE  
**Version** : 1.0  
**Date** : 7 novembre 2025
