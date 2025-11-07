import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Sparkles, TrendingUp, Target, BookOpen, Award, ArrowRight } from "lucide-react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const typeLabels: Record<string, { label: string; icon: any; color: string }> = {
  JOB: { label: "Métier", icon: Target, color: "text-blue-600" },
  TRAINING: { label: "Formation", icon: BookOpen, color: "text-green-600" },
  SKILL: { label: "Compétence", icon: TrendingUp, color: "text-purple-600" },
  CERTIFICATION: { label: "Certification", icon: Award, color: "text-orange-600" },
};

const priorityLabels: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  3: { label: "Haute", variant: "default" },
  2: { label: "Moyenne", variant: "secondary" },
  1: { label: "Basse", variant: "secondary" },
};

export default function Recommendations() {
  const { user } = useAuth();
  const [, params] = useRoute("/bilans/:id/recommendations");
  const bilanId = params?.id ? parseInt(params.id) : 0;

  const { data: recommendations, isLoading } = trpc.recommendations.listByBilan.useQuery(
    { bilanId },
    { enabled: bilanId > 0 }
  );

  const { data: bilan } = trpc.bilans.getById.useQuery({ id: bilanId }, { enabled: bilanId > 0 });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateCareerMutation = trpc.recommendations.generateCareer.useMutation({
    onSuccess: () => {
      toast.success("Recommandations générées avec succès");
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsGenerating(false);
    },
  });

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    await generateCareerMutation.mutateAsync({
      bilanId,
      skills: ["Communication", "Gestion de projet", "Leadership"],
      interests: ["Management", "Innovation", "Formation"],
      experience: "10 ans d'expérience en gestion d'équipe",
      goals: "Évoluer vers un poste de direction",
    });
  };

  if (!user) return null;

  const canGenerate = user.role === "CONSULTANT" || user.role === "ORG_ADMIN" || user.role === "ADMIN";

  const groupedRecommendations = recommendations?.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = [];
    acc[rec.type].push(rec);
    return acc;
  }, {} as Record<string, typeof recommendations>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recommandations IA</h1>
            <p className="text-gray-600 mt-2">
              {bilan ? `Bilan #${bilan.id}` : "Suggestions personnalisées basées sur l'analyse"}
            </p>
          </div>
          {canGenerate && (
            <Button onClick={handleGenerateRecommendations} disabled={isGenerating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Génération..." : "Générer des recommandations"}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {Object.entries(typeLabels).map(([type, { label, icon: Icon, color }]) => {
            const count = groupedRecommendations?.[type]?.length || 0;
            return (
              <Card key={type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}s</CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">recommandation(s)</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recommendations by Type */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedRecommendations || {}).map(([type, recs]) => {
              const { label, icon: Icon, color } = typeLabels[type] || typeLabels.JOB;
              return (
                <Card key={type}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${color}`} />
                      <CardTitle>{label}s recommandés</CardTitle>
                    </div>
                    <CardDescription>{recs.length} suggestion(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recs
                        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                        .map((rec) => (
                          <div
                            key={rec.id}
                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg">{rec.title}</h4>
                                {rec.priority && (
                                  <Badge variant={priorityLabels[rec.priority]?.variant || "secondary"}>
                                    {priorityLabels[rec.priority]?.label || "Normal"}
                                  </Badge>
                                )}
                                {rec.matchScore && (
                                  <Badge variant="outline" className="font-mono">
                                    {Math.round(rec.matchScore)}% match
                                  </Badge>
                                )}
                              </div>
                              {rec.description && (
                                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                              )}
                              {rec.romeCode && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                    {rec.romeCode}
                                  </span>
                                </div>
                              )}
                              {(() => {
                                const metadata = rec.metadata as any;
                                if (!metadata || typeof metadata !== "object") return null;
                                return (
                                  <div className="mt-3 text-sm">
                                    {metadata.requiredSkills && Array.isArray(metadata.requiredSkills) && (
                                      <div className="mb-2">
                                        <span className="font-medium">Compétences requises : </span>
                                        <span className="text-gray-600">
                                          {metadata.requiredSkills.join(", ")}
                                        </span>
                                      </div>
                                    )}
                                    {metadata.trainingNeeded && Array.isArray(metadata.trainingNeeded) && (
                                      <div>
                                        <span className="font-medium">Formations recommandées : </span>
                                        <span className="text-gray-600">
                                          {metadata.trainingNeeded.join(", ")}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            <Button size="sm" variant="ghost">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune recommandation</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                {canGenerate
                  ? "Générez des recommandations personnalisées basées sur l'analyse du bilan."
                  : "Les recommandations seront générées par votre consultant."}
              </p>
              {canGenerate && (
                <Button onClick={handleGenerateRecommendations} disabled={isGenerating}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? "Génération..." : "Générer des recommandations"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
