import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  CheckCircle,
  ArrowRight,
  X,
  UserCircle,
  ClipboardList,
  Calendar,
  BarChart3,
  Sparkles,
  ShieldCheck,
  FileText,
  MessageSquare,
  Target,
} from "lucide-react";

interface OnboardingTutorialProps {
  role: "BENEFICIARY" | "CONSULTANT" | "ORG_ADMIN" | "ADMIN";
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  cta: string;
}

const TUTORIAL_SEEN_KEY = "onboarding-tutorial-seen";

export default function OnboardingTutorial({ role, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    const seen = localStorage.getItem(`${TUTORIAL_SEEN_KEY}-${role}`);
    return seen === "true";
  });

  useEffect(() => {
    if (hasSeenTutorial) {
      onComplete();
    }
  }, [hasSeenTutorial, onComplete]);

  const beneficiarySteps: TutorialStep[] = [
    {
      title: "Bienvenue sur BilanCompetence.AI",
      description:
        "Votre plateforme intelligente pour réaliser votre bilan de compétences avec l'aide de l'IA",
      icon: <Brain size={48} className="text-blue-600" />,
      details: [
        "Évaluez vos compétences de manière interactive",
        "Recevez des recommandations de carrière personnalisées",
        "Explorez les métiers et formations adaptés à votre profil",
        "Suivez votre progression en temps réel",
      ],
      cta: "Commencer la visite",
    },
    {
      title: "Évaluation des compétences",
      description: "Identifiez vos forces et vos axes de développement",
      icon: <Target size={48} className="text-green-600" />,
      details: [
        "Interface intuitive avec slider de maîtrise",
        "Évaluez la fréquence d'utilisation de chaque compétence",
        "Exprimez vos préférences (j'adore, neutre, pas fan)",
        "Sauvegarde automatique de vos réponses",
      ],
      cta: "Suivant",
    },
    {
      title: "Recommandations IA",
      description: "Découvrez les métiers qui vous correspondent",
      icon: <Sparkles size={48} className="text-purple-600" />,
      details: [
        "Suggestions basées sur vos compétences et préférences",
        "Codes ROME et descriptions détaillées",
        "Scores de compatibilité personnalisés",
        "Plans d'action pour atteindre vos objectifs",
      ],
      cta: "Suivant",
    },
    {
      title: "Communication avec votre consultant",
      description: "Restez en contact tout au long de votre parcours",
      icon: <MessageSquare size={48} className="text-orange-600" />,
      details: [
        "Messagerie intégrée sécurisée",
        "Partagez vos documents (CV, lettres de motivation)",
        "Planifiez vos sessions d'accompagnement",
        "Accédez à la bibliothèque de ressources",
      ],
      cta: "Terminer",
    },
  ];

  const consultantSteps: TutorialStep[] = [
    {
      title: "Bienvenue sur BilanCompetence.AI",
      description:
        "Votre assistant intelligent pour réaliser des bilans de compétences professionnels et conformes Qualiopi",
      icon: <Brain size={48} className="text-blue-600" />,
      details: [
        "Gagnez 40% de temps sur les tâches administratives",
        "Recommandations IA basées sur le marché de l'emploi réel",
        "Conformité Qualiopi automatique avec traçabilité complète",
        "Documents de synthèse générés automatiquement",
      ],
      cta: "Commencer la visite",
    },
    {
      title: "Gestion des bilans",
      description: "Suivez tous vos bilans en cours et terminés",
      icon: <ClipboardList size={48} className="text-green-600" />,
      details: [
        "Vue d'ensemble de tous vos bilans assignés",
        "Workflow en 3 phases (préliminaire, investigation, conclusion)",
        "Changement de statut en un clic",
        "Génération automatique de PDF (synthèses, attestations)",
      ],
      cta: "Suivant",
    },
    {
      title: "Intelligence Artificielle",
      description: "Exploitez la puissance de Gemini AI",
      icon: <Sparkles size={48} className="text-purple-600" />,
      details: [
        "Analyse automatique des compétences depuis les CV",
        "Génération de recommandations de carrière personnalisées",
        "Création de plans d'action structurés",
        "Rédaction de synthèses professionnelles",
      ],
      cta: "Suivant",
    },
    {
      title: "Validation et suivi",
      description: "Validez les évaluations et suivez la progression",
      icon: <CheckCircle size={48} className="text-green-600" />,
      details: [
        "Validez les auto-évaluations des bénéficiaires",
        "Planifiez et suivez les sessions d'accompagnement",
        "Accédez aux statistiques de progression",
        "Communiquez via la messagerie intégrée",
      ],
      cta: "Terminer",
    },
  ];

  const orgAdminSteps: TutorialStep[] = [
    {
      title: "Bienvenue sur BilanCompetence.AI",
      description: "Votre plateforme de gestion complète pour votre organisme de formation",
      icon: <Brain size={48} className="text-blue-600" />,
      details: [
        "Gérez tous vos consultants et bénéficiaires",
        "Suivez les indicateurs Qualiopi en temps réel",
        "Générez des rapports et statistiques",
        "Assurez la conformité réglementaire",
      ],
      cta: "Commencer la visite",
    },
    {
      title: "Gestion des équipes",
      description: "Administrez vos consultants et bénéficiaires",
      icon: <UserCircle size={48} className="text-green-600" />,
      details: [
        "Invitez et gérez vos consultants",
        "Affectez les bilans aux consultants disponibles",
        "Suivez la charge de travail de chaque consultant",
        "Gérez les profils et permissions",
      ],
      cta: "Suivant",
    },
    {
      title: "Conformité Qualiopi",
      description: "Assurez la conformité de votre organisme",
      icon: <ShieldCheck size={48} className="text-purple-600" />,
      details: [
        "10 indicateurs Qualiopi suivis automatiquement",
        "Système d'enquêtes de satisfaction intégré",
        "Traçabilité complète avec logs d'audit",
        "Génération de rapports de conformité",
      ],
      cta: "Suivant",
    },
    {
      title: "Statistiques et rapports",
      description: "Analysez les performances de votre organisme",
      icon: <BarChart3 size={48} className="text-orange-600" />,
      details: [
        "Dashboard avec KPIs en temps réel",
        "Taux de satisfaction, d'abandon, de réussite",
        "Durée moyenne des bilans",
        "Exports Excel/CSV pour analyses approfondies",
      ],
      cta: "Terminer",
    },
  ];

  const adminSteps: TutorialStep[] = [
    {
      title: "Bienvenue sur BilanCompetence.AI",
      description: "Plateforme d'administration globale pour gérer toutes les organisations",
      icon: <Brain size={48} className="text-blue-600" />,
      details: [
        "Vue d'ensemble de toutes les organisations",
        "Gestion centralisée des utilisateurs",
        "Accès aux statistiques globales",
        "Administration complète de la plateforme",
      ],
      cta: "Commencer la visite",
    },
    {
      title: "Gestion des organisations",
      description: "Créez et administrez les organismes de formation",
      icon: <ClipboardList size={48} className="text-green-600" />,
      details: [
        "Création et configuration d'organisations",
        "Affectation des administrateurs d'organisation",
        "Suivi des licences et abonnements",
        "Gestion des paramètres globaux",
      ],
      cta: "Suivant",
    },
    {
      title: "Logs d'audit et sécurité",
      description: "Assurez la traçabilité et la sécurité",
      icon: <ShieldCheck size={48} className="text-purple-600" />,
      details: [
        "Logs d'audit complets de toutes les actions",
        "Conformité RGPD automatique",
        "Gestion des droits et permissions",
        "Surveillance des activités suspectes",
      ],
      cta: "Suivant",
    },
    {
      title: "Statistiques globales",
      description: "Analysez les performances de la plateforme",
      icon: <BarChart3 size={48} className="text-orange-600" />,
      details: [
        "Métriques globales de toutes les organisations",
        "Tendances et évolutions",
        "Rapports d'utilisation de la plateforme",
        "Exports pour analyses avancées",
      ],
      cta: "Terminer",
    },
  ];

  const getSteps = (): TutorialStep[] => {
    switch (role) {
      case "BENEFICIARY":
        return beneficiarySteps;
      case "CONSULTANT":
        return consultantSteps;
      case "ORG_ADMIN":
        return orgAdminSteps;
      case "ADMIN":
        return adminSteps;
      default:
        return beneficiarySteps;
    }
  };

  const steps = getSteps();
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`${TUTORIAL_SEEN_KEY}-${role}`, "true");
    setHasSeenTutorial(true);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (hasSeenTutorial) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            {currentStepData.icon}
            <div className="space-y-2">
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <CardDescription className="text-base">{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Details */}
          <div className="space-y-3">
            {currentStepData.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-gray-700">{detail}</p>
              </div>
            ))}
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-blue-600"
                    : index < currentStep
                    ? "w-2 bg-green-600"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={handleSkip}>
              Passer le tutoriel
            </Button>
            <Button onClick={handleNext} size="lg">
              {currentStepData.cta}
              {currentStep < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
