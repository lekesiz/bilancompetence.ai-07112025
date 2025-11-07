import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Eye } from "lucide-react";
import { Link } from "wouter";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PRELIMINARY: { label: "Préliminaire", variant: "secondary" },
  INVESTIGATION: { label: "Investigation", variant: "default" },
  CONCLUSION: { label: "Conclusion", variant: "default" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  ARCHIVED: { label: "Archivé", variant: "destructive" },
};

export default function Bilans() {
  const { user } = useAuth();
  const { data: bilans, isLoading } = trpc.bilans.list.useQuery();

  if (!user) return null;

  const canCreateBilan = user.role === "ORG_ADMIN" || user.role === "ADMIN";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === "BENEFICIARY" ? "Mes bilans" : "Bilans de compétences"}
            </h1>
            <p className="text-gray-600 mt-2">
              {user.role === "BENEFICIARY"
                ? "Suivez l'avancement de vos bilans"
                : "Gérez les bilans de compétences"}
            </p>
          </div>
          {canCreateBilan && (
            <Link href="/bilans/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau bilan
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des bilans</CardTitle>
            <CardDescription>
              {bilans?.length || 0} bilan(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : bilans && bilans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    {(user.role === "CONSULTANT" || user.role === "ORG_ADMIN" || user.role === "ADMIN") && (
                      <TableHead>Bénéficiaire</TableHead>
                    )}
                    {(user.role === "BENEFICIARY" || user.role === "ORG_ADMIN" || user.role === "ADMIN") && (
                      <TableHead>Consultant</TableHead>
                    )}
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de début</TableHead>
                    <TableHead>Date de fin prévue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bilans.map((bilan) => (
                    <TableRow key={bilan.id}>
                      <TableCell className="font-medium">#{bilan.id}</TableCell>
                      {(user.role === "CONSULTANT" || user.role === "ORG_ADMIN" || user.role === "ADMIN") && (
                        <TableCell>Bénéficiaire #{bilan.beneficiaryId}</TableCell>
                      )}
                      {(user.role === "BENEFICIARY" || user.role === "ORG_ADMIN" || user.role === "ADMIN") && (
                        <TableCell>
                          {bilan.consultantId ? `Consultant #${bilan.consultantId}` : "Non assigné"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={statusLabels[bilan.status]?.variant || "default"}>
                          {statusLabels[bilan.status]?.label || bilan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(bilan.startDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        {bilan.expectedEndDate
                          ? new Date(bilan.expectedEndDate).toLocaleDateString("fr-FR")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/bilans/${bilan.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun bilan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {canCreateBilan
                    ? "Commencez par créer un nouveau bilan de compétences."
                    : "Aucun bilan n'a encore été créé pour vous."}
                </p>
                {canCreateBilan && (
                  <div className="mt-6">
                    <Link href="/bilans/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer un bilan
                      </Button>
                    </Link>
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
