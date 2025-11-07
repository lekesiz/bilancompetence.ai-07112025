# BilanCompetence.AI

Plateforme SaaS complète de gestion de bilans de compétences avec intelligence artificielle intégrée.

## 🚀 Fonctionnalités Principales

- **4 rôles utilisateurs** : ADMIN, ORG_ADMIN, CONSULTANT, BENEFICIARY
- **Workflow 3 phases** : Préliminaire, Investigation, Conclusion
- **IA Gemini** : Recommandations de carrière personnalisées
- **API France Travail** : Référentiel ROME, offres d'emploi, formations
- **Module Qualiopi** : 10 indicateurs de conformité + enquêtes satisfaction
- **Messagerie temps réel** : Communication consultant-bénéficiaire
- **Gestion documentaire** : Upload S3, prévisualisation, téléchargement
- **Génération PDF** : Synthèses, attestations, rapports de session
- **Évaluation compétences** : Interface interactive avec sauvegarde backend
- **Bibliothèque de ressources** : 10 ressources (guides, modèles, formations, vidéos)
- **Tutoriel d'accueil** : 4 parcours interactifs par rôle

## 📦 Stack Technique

### Frontend
- React 19 + TypeScript
- Tailwind CSS 4
- tRPC React Query (type-safe API)
- shadcn/ui (composants UI)
- Wouter (routing)

### Backend
- Express 4
- tRPC 11 (type-safe API)
- Drizzle ORM (MySQL/TiDB)
- Manus OAuth (authentification)

### Services Externes
- Google Gemini AI
- France Travail API
- AWS S3 (via Manus)
- PDFKit

## 🏗️ Architecture

```
client/
  src/
    pages/          # 17 pages fonctionnelles
    components/     # Composants réutilisables + shadcn/ui
    lib/            # tRPC client, utils
    hooks/          # Custom hooks
    
server/
  routers/          # 10 routers tRPC
  db.ts             # Helpers base de données
  gemini.ts         # Intégration Gemini AI
  franceTravail.ts  # Intégration France Travail
  pdfGenerator.ts   # Génération PDF
  storage.ts        # Upload S3
  
drizzle/
  schema.ts         # 11 tables de base de données
```

## 🗄️ Base de Données (11 Tables)

1. **users** - Utilisateurs avec 4 rôles
2. **organizations** - Organismes de formation
3. **bilans** - Bilans de compétences (workflow 3 phases)
4. **sessions** - Séances d'accompagnement
5. **recommendations** - Recommandations IA
6. **documents** - Documents (CV, synthèses, attestations)
7. **messages** - Messagerie interne
8. **satisfactionSurveys** - Enquêtes de satisfaction
9. **surveyResponses** - Réponses aux enquêtes
10. **auditLogs** - Logs d'audit (traçabilité RGPD)
11. **skillsEvaluations** - Évaluations de compétences

## 🔧 Installation

### Prérequis

- Node.js 22+
- MySQL/TiDB
- Compte Manus (OAuth)
- Clé API Google Gemini

### Installation

```bash
# Cloner le repository
git clone https://github.com/lekesiz/bilancompetence.ai-07112025.git
cd bilancompetence.ai-07112025

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
# Les variables Manus (DATABASE_URL, JWT_SECRET, etc.) sont auto-injectées
# Ajouter manuellement :
# - GEMINI_API_KEY (obligatoire)
# - FRANCE_TRAVAIL_CLIENT_ID (optionnel)
# - FRANCE_TRAVAIL_CLIENT_SECRET (optionnel)

# Pousser le schéma vers la base de données
pnpm db:push

# Démarrer en développement
pnpm dev
```

Le serveur démarre sur `http://localhost:3000`

## 📝 Scripts Disponibles

```bash
# Développement
pnpm dev              # Démarre le serveur de développement

# Base de données
pnpm db:push          # Pousse le schéma vers la DB
pnpm db:studio        # Ouvre Drizzle Studio (interface DB)

# Production
pnpm build            # Build pour la production
pnpm start            # Démarre le serveur de production
```

## 🎨 Pages Principales

### Communes (tous rôles)
- `/` - Page d'accueil
- `/dashboard` - Tableau de bord adaptatif
- `/bilans` - Liste des bilans
- `/bilans/:id` - Détails d'un bilan
- `/sessions` - Gestion des sessions
- `/resources` - Bibliothèque de ressources

### Bénéficiaire
- `/bilans/:id/skills` - Évaluation des compétences
- `/bilans/:id/recommendations` - Recommandations IA

### Consultant
- `/bilans/:id/france-travail` - Recherche métiers/formations

### Org Admin
- `/consultants` - Gestion des consultants
- `/beneficiaries` - Gestion des bénéficiaires
- `/qualiopi` - Dashboard Qualiopi

### Admin
- `/organizations` - Gestion des organisations

## 🤖 Intégration IA (Gemini)

### Génération de recommandations

```typescript
const mutation = trpc.recommendations.generate.useMutation();

mutation.mutate({
  bilanId: 123,
  userInput: "Optionnel: contexte supplémentaire"
});
```

### Fonctionnalités IA

1. **Recommandations de carrière** - Métiers avec codes ROME et scores
2. **Analyse des compétences** - Extraction depuis CV
3. **Plans d'action** - Objectifs SMART et étapes
4. **Synthèses** - Génération automatique de documents

## 📊 Module Qualiopi

### 10 Indicateurs

1. Taux de satisfaction (>90%)
2. Taux d'abandon (<10%)
3. Taux de réussite (>85%)
4. Délai moyen (<24h)
5. Nombre de sessions (>95%)
6. Qualification consultants (100%)
7. Documents conformes (100%)
8. Réclamations (<5)
9. Amélioration continue (>10)
10. Accessibilité (100%)

## 🔐 Sécurité

- **RGPD** : Conformité complète avec logs d'audit
- **Authentification** : Manus OAuth
- **Autorisation** : 4 niveaux de rôles avec permissions granulaires
- **Validation** : Zod schemas sur tous les inputs
- **Chiffrement** : Données sensibles chiffrées

## 🚀 Déploiement

### Sur Manus (Recommandé)

1. Créer un checkpoint dans l'interface Manus
2. Cliquer sur "Publish"
3. La plateforme déploie automatiquement sur Vercel
4. URL : `https://[project-name].manus.space`

### Manuel (Vercel/autre)

```bash
# Build
pnpm build

# Variables d'environnement requises
DATABASE_URL=...
JWT_SECRET=...
GEMINI_API_KEY=...
# + autres variables Manus
```

## 📚 Documentation

- `PROJET_COMPLET_FINAL.md` - Documentation technique complète
- `CONFORMITE_CAHIER_DES_CHARGES.md` - Analyse de conformité
- `todo.md` - Suivi des tâches

## 🤝 Contribution

Ce projet est développé pour NETZ INFORMATIQUE.

Pour toute question :
- **Email** : mikail@netzinformatique.fr
- **GitHub Issues** : https://github.com/lekesiz/bilancompetence.ai-07112025/issues

## 📄 Licence

Propriétaire - NETZ INFORMATIQUE

---

**Version** : 1.0.0  
**Statut** : ✅ Production Ready  
**Date** : 7 Novembre 2025
