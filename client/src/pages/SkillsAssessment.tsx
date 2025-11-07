import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle, Heart, ThumbsUp, ThumbsDown, Save, Loader2 } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface SkillToEvaluate {
  id: string;
  name: string;
  category: string;
  description: string;
}

const SKILLS_CATALOG: SkillToEvaluate[] = [
  {
    id: "1",
    name: "Gestion de projet",
    category: "Management",
    description: "Planification, coordination et suivi de projets de A à Z",
  },
  {
    id: "2",
    name: "Communication interpersonnelle",
    category: "Soft Skills",
    description: "Capacité à communiquer efficacement avec différents interlocuteurs",
  },
  {
    id: "3",
    name: "Analyse de données",
    category: "Technique",
    description: "Exploitation et interprétation de données pour la prise de décision",
  },
  {
    id: "4",
    name: "Formation d'équipes",
    category: "Management",
    description: "Transmission de connaissances et accompagnement des collaborateurs",
  },
  {
    id: "5",
    name: "Budgétisation",
    category: "Finance",
    description: "Élaboration et suivi de budgets prévisionnels",
  },
  {
    id: "6",
    name: "Leadership",
    category: "Management",
    description: "Capacité à inspirer et guider une équipe vers des objectifs communs",
  },
  {
    id: "7",
    name: "Résolution de problèmes",
    category: "Soft Skills",
    description: "Analyse et résolution de situations complexes de manière créative",
  },
  {
    id: "8",
    name: "Négociation",
    category: "Commercial",
    description: "Capacité à trouver des accords gagnant-gagnant",
  },
];

const frequencyMap = {
  daily: "DAILY",
  weekly: "FREQUENT",
  monthly: "OCCASIONAL",
  rarely: "RARE",
} as const;

const preferenceMap = {
  love: "LOVE",
  neutral: "NEUTRAL",
  dislike: "DISLIKE",
} as const;

export default function SkillsAssessment() {
  const { user } = useAuth();
  const [, params] = useRoute("/bilans/:id/skills");
  const [, setLocation] = useLocation();
  const bilanId = params?.id ? parseInt(params.id) : 0;

  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [masteryLevel, setMasteryLevel] = useState([75]);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "rarely">("weekly");
  const [preference, setPreference] = useState<"love" | "neutral" | "dislike">("neutral");
  const [assessments, setAssessments] = useState<
    Record<
      string,
      {
        masteryLevel: number;
        frequency: string;
        preference: string;
      }
    >
  >({});

  // Charger les évaluations existantes
  const { data: existingEvaluations, isLoading } = trpc.skillsEvaluations.listByBilan.useQuery(
    { bilanId },
    { enabled: !!bilanId }
  );

  // Mutation pour sauvegarder
  const saveBatchMutation = trpc.skillsEvaluations.saveBatch.useMutation({
    onSuccess: () => {
      toast.success("Évaluation sauvegardée avec succès");
      setTimeout(() => setLocation(`/bilans/${bilanId}`), 1500);
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    },
  });

  // Charger les évaluations au démarrage
  useEffect(() => {
    if (existingEvaluations && existingEvaluations.length > 0) {
      const loadedAssessments: Record<string, any> = {};
      existingEvaluations.forEach((evaluation) => {
        const skillIndex = SKILLS_CATALOG.findIndex((s) => s.name === evaluation.skillName);
        if (skillIndex !== -1) {
          const skill = SKILLS_CATALOG[skillIndex];
          loadedAssessments[skill.id] = {
            masteryLevel: evaluation.level * 20, // Convert 1-5 to 0-100
            frequency:
              evaluation.frequency === "DAILY"
                ? "daily"
                : evaluation.frequency === "FREQUENT"
                ? "weekly"
                : evaluation.frequency === "OCCASIONAL"
                ? "monthly"
                : "rarely",
            preference:
              evaluation.preference === "LOVE"
                ? "love"
                : evaluation.preference === "DISLIKE"
                ? "dislike"
                : "neutral",
          };
        }
      });
      setAssessments(loadedAssessments);

      // Charger la première compétence évaluée
      const firstSkill = SKILLS_CATALOG[0];
      if (loadedAssessments[firstSkill.id]) {
        setMasteryLevel([loadedAssessments[firstSkill.id].masteryLevel]);
        setFrequency(loadedAssessments[firstSkill.id].frequency);
        setPreference(loadedAssessments[firstSkill.id].preference);
      }
    }
  }, [existingEvaluations]);

  const currentSkill = SKILLS_CATALOG[currentSkillIndex];
  const progressPercentage = ((currentSkillIndex + 1) / SKILLS_CATALOG.length) * 100;

  const handleNext = () => {
    // Save current assessment
    setAssessments({
      ...assessments,
      [currentSkill.id]: {
        masteryLevel: masteryLevel[0],
        frequency,
        preference,
      },
    });

    toast.success(`Compétence "${currentSkill.name}" évaluée`);

    if (currentSkillIndex < SKILLS_CATALOG.length - 1) {
      const nextIndex = currentSkillIndex + 1;
      setCurrentSkillIndex(nextIndex);
      const nextSkill = SKILLS_CATALOG[nextIndex];
      
      // Load next skill assessment if exists
      if (assessments[nextSkill.id]) {
        setMasteryLevel([assessments[nextSkill.id].masteryLevel]);
        setFrequency(assessments[nextSkill.id].frequency as any);
        setPreference(assessments[nextSkill.id].preference as any);
      } else {
        // Reset for next skill
        setMasteryLevel([75]);
        setFrequency("weekly");
        setPreference("neutral");
      }
    } else {
      // Save all assessments to backend
      handleSaveAll();
    }
  };

  const handleSaveAll = () => {
    // Include current skill
    const finalAssessments = {
      ...assessments,
      [currentSkill.id]: {
        masteryLevel: masteryLevel[0],
        frequency,
        preference,
      },
    };

    const evaluations = SKILLS_CATALOG.map((skill) => {
      const assessment = finalAssessments[skill.id];
      if (!assessment) {
        return {
          skillName: skill.name,
          category: skill.category,
          level: 3, // Default
          frequency: "OCCASIONAL" as const,
          preference: "NEUTRAL" as const,
        };
      }

      return {
        skillName: skill.name,
        category: skill.category,
        level: Math.ceil(assessment.masteryLevel / 20), // Convert 0-100 to 1-5
        frequency: frequencyMap[assessment.frequency as keyof typeof frequencyMap],
        preference: preferenceMap[assessment.preference as keyof typeof preferenceMap],
      };
    });

    saveBatchMutation.mutate({
      bilanId,
      evaluations,
    });
  };

  const handlePrevious = () => {
    if (currentSkillIndex > 0) {
      const prevIndex = currentSkillIndex - 1;
      setCurrentSkillIndex(prevIndex);
      const prevSkill = SKILLS_CATALOG[prevIndex];
      const prevAssessment = assessments[prevSkill.id];
      if (prevAssessment) {
        setMasteryLevel([prevAssessment.masteryLevel]);
        setFrequency(prevAssessment.frequency as any);
        setPreference(prevAssessment.preference as any);
      }
    }
  };

  const getMasteryLabel = (value: number) => {
    if (value < 25) return "Débutant";
    if (value < 50) return "Intermédiaire";
    if (value < 75) return "Avancé";
    return "Expert";
  };

  const frequencyOptions = [
    { value: "daily", label: "Quotidien" },
    { value: "weekly", label: "Hebdomadaire" },
    { value: "monthly", label: "Mensuel" },
    { value: "rarely", label: "Rarement" },
  ];

  if (!user) return null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/bilans/${bilanId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Évaluation des compétences</h1>
              <p className="text-gray-600 mt-1">
                Compétence {currentSkillIndex + 1} sur {SKILLS_CATALOG.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleSaveAll} disabled={saveBatchMutation.isPending}>
              {saveBatchMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Sauvegarder
            </Button>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-gray-500">Progression</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Démarré</span>
            <span>
              {currentSkillIndex + 1} / {SKILLS_CATALOG.length}
            </span>
            <span>Terminé</span>
          </div>
        </div>

        {/* Assessment Card */}
        <Card className="border-2">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{currentSkill.category}</Badge>
              <span className="text-sm text-gray-500">
                Question {currentSkillIndex + 1}/{SKILLS_CATALOG.length}
              </span>
            </div>
            <CardTitle className="text-2xl">{currentSkill.name}</CardTitle>
            <CardDescription className="text-base">{currentSkill.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            {/* Mastery Level */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Niveau de maîtrise</label>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{masteryLevel[0]}%</div>
                  <div className="text-sm text-gray-500">{getMasteryLabel(masteryLevel[0])}</div>
                </div>
              </div>
              <Slider value={masteryLevel} onValueChange={setMasteryLevel} min={0} max={100} step={5} />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Débutant</span>
                <span>Intermédiaire</span>
                <span>Avancé</span>
                <span>Expert</span>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Fréquence d'utilisation</label>
              <div className="grid grid-cols-2 gap-3">
                {frequencyOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={frequency === option.value ? "default" : "outline"}
                    onClick={() => setFrequency(option.value as any)}
                    className="justify-start"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preference */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Votre ressenti</label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={preference === "love" ? "default" : "outline"}
                  onClick={() => setPreference("love")}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <Heart className={`h-6 w-6 ${preference === "love" ? "fill-current" : ""}`} />
                  <span>J'adore</span>
                </Button>
                <Button
                  variant={preference === "neutral" ? "default" : "outline"}
                  onClick={() => setPreference("neutral")}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <ThumbsUp className="h-6 w-6" />
                  <span>Neutre</span>
                </Button>
                <Button
                  variant={preference === "dislike" ? "default" : "outline"}
                  onClick={() => setPreference("dislike")}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <ThumbsDown className="h-6 w-6" />
                  <span>Pas fan</span>
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={currentSkillIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              <Button onClick={handleNext} disabled={saveBatchMutation.isPending}>
                {currentSkillIndex === SKILLS_CATALOG.length - 1 ? (
                  <>
                    {saveBatchMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
