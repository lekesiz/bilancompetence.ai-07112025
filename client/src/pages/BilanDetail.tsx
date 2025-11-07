import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, User, FileText, Clock, CheckCircle2, AlertCircle, Target, Lightbulb, MessageSquare, Download, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PRELIMINARY: { label: "Préliminaire", variant: "secondary" },
  INVESTIGATION: { label: "Investigation", variant: "default" },
  CONCLUSION: { label: "Conclusion", variant: "default" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  ARCHIVED: { label: "Archivé", variant: "destructive" },
};

export default function BilanDetail() {
  const { user } = useAuth();
  const [, params] = useRoute("/bilans/:id");
  const bilanId = params?.id ? parseInt(params.id) : 0;

  const { data: bilan, isLoading } = trpc.bilans.getById.useQuery(
    { id: bilanId },
    { enabled: bilanId > 0 }
  );

  // Mutations pour générer les PDFs
  const generateSynthesisMutation = trpc.pdf.generateSynthesis.useMutation({
    onSuccess: (data) => {
      toast.success("Synthèse générée avec succès");
      window.open(data.url, "_blank");
    },
    onError: () => {
      toast.error("Erreur lors de la génération de la synthèse");
    },
  });

  const generateAttestationMutation = trpc.pdf.generateAttestation.useMutation({
    onSuccess: (data) => {
      toast.success("Attestation générée avec succès");
      window.open(data.url, "_blank");
    },
    onError: () => {
      toast.error("Erreur lors de la génération de l'attestation");
    },
  });

  const { data: sessions } = trpc.sessions.listByBilan.useQuery(
    { bilanId },
    { enabled: bilanId > 0 }
  );

  const updateStatusMutation = trpc.bilans.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut du bilan mis à jour");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bilan) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Bilan introuvable</h3>
          <p className="mt-1 text-sm text-gray-500">Ce bilan n'existe pas ou vous n'y avez pas accès.</p>
          <div className="mt-6">
            <Link href="/bilans">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux bilans
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canEditStatus = user.role === "CONSULTANT" || user.role === "ORG_ADMIN" || user.role === "ADMIN";

  const getNextStatus = (currentStatus: string) => {
    const transitions: Record<string, string> = {
      PRELIMINARY: "INVESTIGATION",
      INVESTIGATION: "CONCLUSION",
      CONCLUSION: "COMPLETED",
    };
    return transitions[currentStatus];
  };

  const handleStatusChange = async () => {
    const nextStatus = getNextStatus(bilan.status);
    if (nextStatus) {
      await updateStatusMutation.mutateAsync({
        id: bilan.id,
        status: nextStatus as any,
      });
    }
  };

  const nextStatus = getNextStatus(bilan.status);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/bilans">
            <span className="hover:text-gray-900 cursor-pointer">Bilans</span>
          </Link>
          <span>/</span>
          <span className="text-gray-900">Bilan #{bilanId}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/bilans">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bilan #{bilan.id}</h1>
              <p className="text-gray-600 mt-1">
                Démarré le {new Date(bilan.startDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
          <Badge variant={statusLabels[bilan.status]?.variant || "default"} className="text-sm px-4 py-2">
            {statusLabels[bilan.status]?.label || bilan.status}
          </Badge>
        </div>

        {/* PDF Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Documents PDF</CardTitle>
            <CardDescription>Générer les documents officiels du bilan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => generateSynthesisMutation.mutate({ bilanId })}
              disabled={generateSynthesisMutation.isPending}
            >
              {generateSynthesisMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Générer la synthèse
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => generateAttestationMutation.mutate({ bilanId })}
              disabled={generateAttestationMutation.isPending || bilan?.status !== "COMPLETED"}
            >
              {generateAttestationMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Générer l'attestation
            </Button>
            {bilan?.status !== "COMPLETED" && (
              <p className="text-xs text-gray-500 mt-2">
                L'attestation sera disponible une fois le bilan terminé
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link href={`/bilans/${bilanId}/skills`}>
            <Button variant="outline" className="w-full">
              <Target className="mr-2 h-4 w-4" />
              Évaluation
            </Button>
          </Link>
          <Link href={`/bilans/${bilanId}/recommendations`}>
            <Button variant="outline" className="w-full">
              <Lightbulb className="mr-2 h-4 w-4" />
              Recommandations
            </Button>
          </Link>
          <Link href={`/bilans/${bilanId}/messages`}>
            <Button variant="outline" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </Link>
          <Link href={`/bilans/${bilanId}/documents`}>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
          </Link>
        </div>

        {/* Main Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Bénéficiaire</p>
                  <p className="text-sm text-gray-900">Bénéficiaire #{bilan.beneficiaryId}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Consultant</p>
                  <p className="text-sm text-gray-900">
                    {bilan.consultantId ? `Consultant #${bilan.consultantId}` : "Non assigné"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de fin prévue</p>
                  <p className="text-sm text-gray-900">
                    {bilan.expectedEndDate
                      ? new Date(bilan.expectedEndDate).toLocaleDateString("fr-FR")
                      : "Non définie"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Durée prévue</p>
                  <p className="text-sm text-gray-900">
                    {bilan.durationHours ? `${bilan.durationHours} heures` : "Non définie"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Phase actuelle</span>
                  <span className="text-sm text-muted-foreground">
                    {statusLabels[bilan.status]?.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width:
                        bilan.status === "PRELIMINARY"
                          ? "25%"
                          : bilan.status === "INVESTIGATION"
                          ? "50%"
                          : bilan.status === "CONCLUSION"
                          ? "75%"
                          : "100%",
                    }}
                  />
                </div>
              </div>

              {canEditStatus && nextStatus && (
                <Button
                  onClick={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                  className="w-full"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Passer à la phase {statusLabels[nextStatus]?.label}
                </Button>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-500 mb-2">Sessions</p>
                <p className="text-2xl font-bold">{sessions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">sessions planifiées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Objectives */}
        {bilan.objectives && (
          <Card>
            <CardHeader>
              <CardTitle>Objectifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{bilan.objectives}</p>
            </CardContent>
          </Card>
        )}

        {/* Context */}
        {bilan.context && (
          <Card>
            <CardHeader>
              <CardTitle>Contexte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{bilan.context}</p>
            </CardContent>
          </Card>
        )}

        {/* Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sessions</CardTitle>
              {canEditStatus && (
                <Link href={`/bilans/${bilan.id}/sessions/new`}>
                  <Button size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Planifier une session
                  </Button>
                </Link>
              )}
            </div>
            <CardDescription>
              {sessions?.length || 0} session(s) planifiée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.scheduledAt).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(session.scheduledAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {session.durationMinutes} min
                      </p>
                    </div>
                    <Badge variant={session.status === "COMPLETED" ? "outline" : "default"}>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune session planifiée pour le moment
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
