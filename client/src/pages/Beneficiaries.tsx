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
import { Users, Mail, Phone, FileText, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Beneficiaries() {
  const { user } = useAuth();
  const { data: users, isLoading: usersLoading } = trpc.users.list.useQuery(
    { role: "BENEFICIARY" },
    { enabled: user?.role === "CONSULTANT" || user?.role === "ORG_ADMIN" || user?.role === "ADMIN" }
  );

  const { data: bilans } = trpc.bilans.list.useQuery();

  if (!user) return null;

  const beneficiaries = users || [];

  // Count bilans per beneficiary
  const bilanCountByBeneficiary = (bilans || []).reduce((acc, bilan) => {
    acc[bilan.beneficiaryId] = (acc[bilan.beneficiaryId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bénéficiaires</h1>
            <p className="text-gray-600 mt-2">
              {user.role === "CONSULTANT"
                ? "Vos bénéficiaires en accompagnement"
                : "Gérez les bénéficiaires de votre organisation"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total bénéficiaires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{beneficiaries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilans actifs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(bilans || []).filter((b) => b.status !== "COMPLETED" && b.status !== "ARCHIVED").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilans terminés</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(bilans || []).filter((b) => b.status === "COMPLETED").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Beneficiaries List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des bénéficiaires</CardTitle>
            <CardDescription>
              {beneficiaries.length} bénéficiaire(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : beneficiaries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Bilans</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id}>
                      <TableCell className="font-medium">
                        {beneficiary.name || "Sans nom"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {beneficiary.email || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {beneficiary.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {bilanCountByBeneficiary[beneficiary.id] || 0} bilan(s)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(beneficiary.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun bénéficiaire</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user.role === "CONSULTANT"
                    ? "Aucun bénéficiaire ne vous est assigné pour le moment."
                    : "Commencez par créer un bilan pour un bénéficiaire."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
