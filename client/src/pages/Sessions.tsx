import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, MapPin, Plus, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  SCHEDULED: { label: "Planifiée", variant: "default" },
  COMPLETED: { label: "Terminée", variant: "outline" },
  CANCELLED: { label: "Annulée", variant: "destructive" },
  RESCHEDULED: { label: "Reportée", variant: "secondary" },
};

export default function Sessions() {
  const { user } = useAuth();
  const { data: bilans } = trpc.bilans.list.useQuery();
  const [selectedBilanId, setSelectedBilanId] = useState<number | null>(null);

  // Get all sessions from all bilans
  const allSessions = bilans?.flatMap((bilan) => {
    // For now, we'll need to fetch sessions per bilan
    // This is a placeholder - in production, you'd want a dedicated endpoint
    return [];
  }) || [];

  if (!user) return null;

  const upcomingSessions = allSessions.filter((s: any) => s.status === "SCHEDULED");
  const completedSessions = allSessions.filter((s: any) => s.status === "COMPLETED");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === "BENEFICIARY" ? "Mes sessions" : "Sessions"}
            </h1>
            <p className="text-gray-600 mt-2">
              {user.role === "BENEFICIARY"
                ? "Consultez vos sessions d'accompagnement"
                : "Gérez les sessions d'accompagnement"}
            </p>
          </div>
          {(user.role === "CONSULTANT" || user.role === "ORG_ADMIN") && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Planifier une session
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions à venir</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSessions.length}</div>
              <p className="text-xs text-muted-foreground">Planifiées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSessions.length}</div>
              <p className="text-xs text-muted-foreground">Complétées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSessions.length}</div>
              <p className="text-xs text-muted-foreground">Toutes statuts</p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Prochaines sessions</CardTitle>
            <CardDescription>
              Sessions planifiées à venir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bilans && bilans.length > 0 ? (
              <div className="space-y-6">
                {bilans.map((bilan) => (
                  <SessionsByBilan key={bilan.id} bilanId={bilan.id} bilanNumber={bilan.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune session</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user.role === "BENEFICIARY"
                    ? "Aucune session n'est planifiée pour le moment."
                    : "Commencez par planifier une session d'accompagnement."}
                </p>
                {(user.role === "CONSULTANT" || user.role === "ORG_ADMIN") && (
                  <div className="mt-6">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Planifier une session
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function SessionsByBilan({ bilanId, bilanNumber }: { bilanId: number; bilanNumber: number }) {
  const { data: sessions, isLoading } = trpc.sessions.listByBilan.useQuery({ bilanId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Bilan #{bilanNumber}</h3>
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-medium">{session.title}</h4>
              <Badge variant={statusLabels[session.status]?.variant || "default"}>
                {statusLabels[session.status]?.label || session.status}
              </Badge>
            </div>
            {session.description && (
              <p className="text-sm text-gray-600 mb-3">{session.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(session.scheduledAt).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(session.scheduledAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({session.durationMinutes} min)
                </span>
              </div>
              {session.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location}</span>
                </div>
              )}
            </div>
          </div>
          <Button size="sm" variant="ghost">
            Détails
          </Button>
        </div>
      ))}
    </div>
  );
}
