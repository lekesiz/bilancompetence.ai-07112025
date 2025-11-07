# BilanCompetence.AI - TODO List

## Phase 1: Configuration de la base de données et du schéma Drizzle

### Schéma de base de données
- [x] Créer les tables principales (organizations, bilans, sessions, recommendations)
- [x] Ajouter les enums (UserRole, BilanStatus, SessionStatus, DocumentType, RecommendationType)
- [x] Configurer les relations entre tables
- [x] Ajouter les index pour optimiser les requêtes
- [x] Exécuter la migration initiale (pnpm db:push)

### Helpers de base de données
- [x] Créer les fonctions CRUD pour organizations
- [x] Créer les fonctions CRUD pour bilans
- [x] Créer les fonctions CRUD pour sessions
- [x] Créer les fonctions CRUD pour recommendations
- [x] Créer les fonctions CRUD pour documents
- [x] Créer les fonctions CRUD pour messages

## Phase 2: Développement du système d'authentification et des rôles

### Système de rôles
- [x] Étendre le schéma users avec les 4 rôles (BENEFICIARY, CONSULTANT, ORG_ADMIN, ADMIN)
- [x] Créer adminProcedure pour les opérations admin
- [x] Créer orgAdminProcedure pour les opérations org_admin
- [x] Créer consultantProcedure pour les opérations consultant
- [x] Implémenter la vérification des rôles dans les procédures

### Gestion des utilisateurs
- [x] Procédure pour lister les utilisateurs (avec filtres par rôle)
- [x] Procédure pour inviter un consultant
- [x] Procédure pour affecter un consultant à un bilan
- [x] Procédure pour mettre à jour le profil utilisateur
- [x] Procédure pour désactiver un utilisateur

## Phase 3: Création des procédures tRPC pour la gestion des bilans

### CRUD Bilans
- [x] Procédure pour créer un nouveau bilan
- [x] Procédure pour lister les bilans (avec filtres par statut, bénéficiaire, consultant)
- [x] Procédure pour obtenir les détails d'un bilan
- [x] Procédure pour mettre à jour un bilan
- [x] Procédure pour changer le statut d'un bilan (workflow 3 phases)
- [x] Procédure pour archiver un bilan
- [x] Procédure pour supprimer un bilan

### Gestion des sessions
- [x] Procédure pour créer une session
- [x] Procédure pour lister les sessions d'un bilan
- [x] Procédure pour mettre à jour une session
- [x] Procédure pour marquer une session comme complétée
- [x] Procédure pour annuler/reporter une session

### Évaluation des compétences
- [ ] Procédure pour sauvegarder l'auto-évaluation du bénéficiaire
- [ ] Procédure pour valider l'évaluation par le consultant
- [ ] Procédure pour obtenir les compétences d'un bilan

## Phase 4: Développement de l'interface utilisateur (Dashboard et pages)

### Layout et navigation
- [x] Créer DashboardLayout avec sidebar
- [x] Configurer la navigation par rôle (menu différent selon BENEFICIARY/CONSULTANT/ORG_ADMIN/ADMIN)
- [x] Ajouter le profil utilisateur dans le header
- [x] Implémenter la déconnexion

### Pages Bénéficiaire
- [x] Page d'accueil bénéficiaire (mes bilans)
- [ ] Page détail d'un bilan
- [ ] Page auto-évaluation des compétences
- [ ] Page mes sessions
- [ ] Page mes documents

### Pages Consultant
- [x] Page d'accueil consultant (bilans assignés)
- [ ] Page détail bilan (vue consultant)
- [ ] Page validation évaluation
- [ ] Page planification sessions
- [ ] Page recommandations IA

### Pages Org Admin
- [x] Dashboard organisation (statistiques)
- [ ] Page gestion des consultants
- [ ] Page gestion des bénéficiaires
- [x] Page tous les bilans
- [ ] Page paramètres organisation

### Pages Admin
- [x] Dashboard admin (toutes les organisations)
- [ ] Page gestion des organisations
- [ ] Page gestion des utilisateurs
- [ ] Page logs d'audit

## Phase 5: Intégration IA (Gemini) et API France Travail

### Intégration Gemini
- [ ] Configurer la clé API Gemini dans les secrets
- [ ] Créer le helper pour appeler Gemini
- [ ] Procédure pour analyser un CV (extraction compétences)
- [ ] Procédure pour générer des recommandations métiers
- [ ] Procédure pour générer le contenu de synthèse
- [ ] Procédure pour identifier les compétences transférables

### Intégration France Travail
- [ ] Configurer l'accès à l'API France Travail
- [ ] Créer le helper pour appeler l'API ROME
- [ ] Procédure pour rechercher des métiers par compétences
- [ ] Procédure pour obtenir les détails d'un métier (code ROME)
- [ ] Procédure pour obtenir les formations recommandées
- [ ] Implémenter le cache des données France Travail

### Interface IA
- [ ] Page upload CV et analyse
- [ ] Page visualisation des compétences extraites
- [ ] Page recommandations métiers (avec scores)
- [ ] Page suggestions de formations

## Phase 6: Module Qualiopi, messagerie et génération PDF

### Module Qualiopi
- [ ] Créer le schéma pour satisfaction_surveys et survey_responses
- [ ] Procédure pour créer une enquête de satisfaction
- [ ] Procédure pour répondre à une enquête
- [ ] Procédure pour obtenir les statistiques Qualiopi
- [ ] Page dashboard Qualiopi (indicateurs)
- [ ] Page création/édition enquête
- [ ] Page résultats enquêtes

### Messagerie interne
- [ ] Créer le schéma messages
- [ ] Procédure pour envoyer un message
- [ ] Procédure pour lister les messages (boîte de réception)
- [ ] Procédure pour marquer un message comme lu
- [ ] Page messagerie (liste + détail)
- [ ] Notifications temps réel (optionnel)

### Génération PDF
- [ ] Créer le template PDF de synthèse
- [ ] Procédure pour générer le PDF de synthèse
- [ ] Procédure pour télécharger un document
- [ ] Page prévisualisation PDF
- [ ] Bouton télécharger PDF

### Gestion des documents
- [ ] Procédure pour uploader un document (CV, etc.)
- [ ] Procédure pour lister les documents d'un bilan
- [ ] Procédure pour supprimer un document
- [ ] Page gestion documents

## Phase 7: Tests, documentation et présentation finale

### Tests
- [ ] Tests des procédures tRPC principales
- [ ] Tests du workflow de bilan (3 phases)
- [ ] Tests des permissions par rôle
- [ ] Tests de l'intégration Gemini
- [ ] Tests de l'intégration France Travail

### Documentation
- [ ] Mettre à jour le README avec les instructions d'installation
- [ ] Documenter les variables d'environnement
- [ ] Créer un guide utilisateur pour chaque rôle
- [ ] Documenter l'architecture technique
- [ ] Créer un guide de déploiement

### Déploiement et finalisation
- [ ] Configurer le domaine personnalisé
- [ ] Configurer les secrets de production
- [ ] Créer un checkpoint de production
- [ ] Tester l'application en production
- [ ] Former le client sur l'utilisation

### Rapport final
- [ ] Créer le rapport de livraison
- [ ] Lister les fonctionnalités implémentées
- [ ] Documenter les points d'amélioration futurs
- [ ] Préparer la présentation pour le client

---

## Notes

- Ce fichier sera mis à jour régulièrement au fur et à mesure de l'avancement
- Chaque tâche cochée [x] sera commitée sur Git
- Les priorités peuvent être ajustées selon les retours du client
