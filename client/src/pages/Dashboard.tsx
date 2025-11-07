import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: bilans, isLoading: bilansLoading } = trpc.bilans.list.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.users.list.useQuery(
    {},
    { enabled: user?.role === "ORG_ADMIN" || user?.role === "ADMIN" }
  );

  if (!user) return null;

  const renderBeneficiaryDashboard = () => {
    const myBilans = bilans || [];
    const activeBilan = myBilans.find(
      (b) => b.status !== "COMPLETED" && b.status !== "ARCHIVED"
    );
    const completedBilans = myBilans.filter((b) => b.status === "COMPLETED");

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user.name}</h1>
          <p className="text-gray-600 mt-2">Suivez l'avancement de votre bilan de compétences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilan en cours</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBilan ? 1 : 0}</div>
              <p className="text-xs text-muted-foreground">
                {activeBilan ? `Phase: ${activeBilan.status}` : "Aucun bilan actif"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilans complétés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBilans.length}</div>
              <p className="text-xs text-muted-foreground">Total terminés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prochaine session</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">À planifier</p>
            </CardContent>
          </Card>
        </div>

        {activeBilan && (
          <Card>
            <CardHeader>
              <CardTitle>Mon bilan en cours</CardTitle>
              <CardDescription>
                Démarré le {new Date(activeBilan.startDate).toLocaleDateString("fr-FR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Phase actuelle</span>
                    <span className="text-sm text-muted-foreground">{activeBilan.status}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width:
                          activeBilan.status === "PRELIMINARY"
                            ? "33%"
                            : activeBilan.status === "INVESTIGATION"
                            ? "66%"
                            : "100%",
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/bilans">
                    <Button>Voir mon bilan</Button>
                  </Link>
                  <Link href="/sessions">
                    <Button variant="outline">Mes sessions</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderConsultantDashboard = () => {
    const myBilans = bilans || [];
    const activeBilans = myBilans.filter(
      (b) => b.status !== "COMPLETED" && b.status !== "ARCHIVED"
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Consultant</h1>
          <p className="text-gray-600 mt-2">Gérez vos bilans et accompagnements</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilans actifs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBilans.length}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total bilans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myBilans.length}</div>
              <p className="text-xs text-muted-foreground">Assignés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions cette semaine</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">À venir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéficiaires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myBilans.length}</div>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes bilans en cours</CardTitle>
            <CardDescription>Bilans nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            {activeBilans.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun bilan actif pour le moment</p>
            ) : (
              <div className="space-y-4">
                {activeBilans.slice(0, 5).map((bilan) => (
                  <div
                    key={bilan.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Bilan #{bilan.id}</p>
                      <p className="text-sm text-muted-foreground">Phase: {bilan.status}</p>
                    </div>
                    <Link href={`/bilans/${bilan.id}`}>
                      <Button size="sm">Voir</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOrgAdminDashboard = () => {
    const allBilans = bilans || [];
    const allUsers = users || [];
    const consultants = allUsers.filter((u) => u.role === "CONSULTANT");
    const beneficiaries = allUsers.filter((u) => u.role === "BENEFICIARY");
    const activeBilans = allBilans.filter(
      (b) => b.status !== "COMPLETED" && b.status !== "ARCHIVED"
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Organisation</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de votre organisation</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilans actifs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBilans.length}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total bilans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allBilans.length}</div>
              <p className="text-xs text-muted-foreground">Tous statuts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultants</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consultants.length}</div>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéficiaires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{beneficiaries.length}</div>
              <p className="text-xs text-muted-foreground">Inscrits</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bilans récents</CardTitle>
              <CardDescription>Derniers bilans créés</CardDescription>
            </CardHeader>
            <CardContent>
              {allBilans.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun bilan pour le moment</p>
              ) : (
                <div className="space-y-4">
                  {allBilans.slice(0, 5).map((bilan) => (
                    <div
                      key={bilan.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Bilan #{bilan.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {bilan.status} • {new Date(bilan.startDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Link href={`/bilans/${bilan.id}`}>
                        <Button size="sm" variant="outline">
                          Voir
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Raccourcis vers les fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/bilans/new">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Créer un nouveau bilan
                  </Button>
                </Link>
                <Link href="/consultants">
                  <Button className="w-full justify-start" variant="outline">
                    <UserCog className="mr-2 h-4 w-4" />
                    Gérer les consultants
                  </Button>
                </Link>
                <Link href="/beneficiaries">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Gérer les bénéficiaires
                  </Button>
                </Link>
                <Link href="/statistics">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Voir les statistiques
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
          <p className="text-gray-600 mt-2">Vue globale de la plateforme</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organisations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Actives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bilans?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Système</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">OK</div>
              <p className="text-xs text-muted-foreground">Opérationnel</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions administrateur</CardTitle>
            <CardDescription>Gestion de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <Link href="/organizations">
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Gérer les organisations
                </Button>
              </Link>
              <Link href="/users">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les utilisateurs
                </Button>
              </Link>
              <Link href="/bilans">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Voir tous les bilans
                </Button>
              </Link>
              <Link href="/statistics">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Statistiques globales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {bilansLoading || usersLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {user.role === "BENEFICIARY" && renderBeneficiaryDashboard()}
          {user.role === "CONSULTANT" && renderConsultantDashboard()}
          {user.role === "ORG_ADMIN" && renderOrgAdminDashboard()}
          {user.role === "ADMIN" && renderAdminDashboard()}
        </>
      )}
    </DashboardLayout>
  );
}

import { UserCog, Building2 } from "lucide-react";
