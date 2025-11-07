import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  MessageSquare,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { useState } from "react";

interface QualiopiIndicator {
  id: string;
  number: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  category: "information" | "prestation" | "moyens" | "personnel" | "environnement" | "amelioration";
  priority: "high" | "medium" | "low";
}

const QUALIOPI_INDICATORS: QualiopiIndicator[] = [
  {
    id: "1",
    number: "Ind. 1",
    title: "Information du public",
    description:
      "Les conditions d'information du public sur les prestations proposées, les délais pour y accéder et les résultats obtenus",
    status: "DONE",
    category: "information",
    priority: "high",
  },
  {
    id: "2",
    number: "Ind. 2",
    title: "Indicateurs de résultats",
    description: "Les indicateurs de résultats adaptés aux caractéristiques de chaque prestation",
    status: "DONE",
    category: "information",
    priority: "high",
  },
  {
    id: "3",
    number: "Ind. 3",
    title: "Obtention des certifications",
    description:
      "L'identification précise des objectifs des prestations et l'adaptation de ces prestations aux publics bénéficiaires",
    status: "IN_PROGRESS",
    category: "prestation",
    priority: "high",
  },
  {
    id: "4",
    number: "Ind. 10",
    title: "Adaptation de la prestation",
    description:
      "L'adaptation des prestations, des modalités d'accueil, d'accompagnement, de suivi et d'évaluation aux publics bénéficiaires",
    status: "IN_PROGRESS",
    category: "prestation",
    priority: "high",
  },
  {
    id: "5",
    number: "Ind. 11",
    title: "Évaluation des acquis",
    description:
      "La mise en œuvre d'une démarche d'évaluation des acquis de la formation et de la satisfaction des bénéficiaires",
    status: "TODO",
    category: "prestation",
    priority: "high",
  },
  {
    id: "6",
    number: "Ind. 12",
    title: "Moyens pédagogiques",
    description: "Les moyens humains et techniques adaptés à l'offre de formation",
    status: "DONE",
    category: "moyens",
    priority: "medium",
  },
  {
    id: "7",
    number: "Ind. 13",
    title: "Coordination des intervenants",
    description: "La coordination des différents intervenants internes et externes",
    status: "IN_PROGRESS",
    category: "moyens",
    priority: "medium",
  },
  {
    id: "8",
    number: "Ind. 22",
    title: "Traçabilité des actions",
    description: "La mise en place d'une démarche de traçabilité des actions réalisées",
    status: "TODO",
    category: "amelioration",
    priority: "high",
  },
  {
    id: "9",
    number: "Ind. 30",
    title: "Recueil des appréciations",
    description: "Le recueil et la prise en compte des appréciations et des réclamations",
    status: "TODO",
    category: "amelioration",
    priority: "high",
  },
  {
    id: "10",
    number: "Ind. 31",
    title: "Amélioration continue",
    description: "La mise en œuvre d'une démarche d'amélioration continue",
    status: "IN_PROGRESS",
    category: "amelioration",
    priority: "medium",
  },
];

const STATUS_CONFIG = {
  DONE: {
    label: "Terminé",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    variant: "default" as const,
  },
  IN_PROGRESS: {
    label: "En cours",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    variant: "secondary" as const,
  },
  TODO: {
    label: "À faire",
    icon: Circle,
    color: "text-gray-400",
    bgColor: "bg-gray-50",
    variant: "outline" as const,
  },
};

const CATEGORY_LABELS = {
  information: "Information",
  prestation: "Prestation",
  moyens: "Moyens",
  personnel: "Personnel",
  environnement: "Environnement",
  amelioration: "Amélioration",
};

export default function Qualiopi() {
  const { user } = useAuth();
  const [indicators] = useState<QualiopiIndicator[]>(QUALIOPI_INDICATORS);

  const stats = {
    total: indicators.length,
    done: indicators.filter((i) => i.status === "DONE").length,
    inProgress: indicators.filter((i) => i.status === "IN_PROGRESS").length,
    todo: indicators.filter((i) => i.status === "TODO").length,
  };

  const completionRate = Math.round((stats.done / stats.total) * 100);

  const groupedByCategory = indicators.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, QualiopiIndicator[]>);

  // Fonction d'export Excel
  const exportToExcel = () => {
    const data = indicators.map(ind => ({
      'Numéro': ind.number,
      'Titre': ind.title,
      'Description': ind.description,
      'Catégorie': CATEGORY_LABELS[ind.category],
      'Statut': STATUS_CONFIG[ind.status].label,
      'Priorité': ind.priority === 'high' ? 'Haute' : ind.priority === 'medium' ? 'Moyenne' : 'Basse'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Indicateurs Qualiopi');
    
    const fileName = `qualiopi-indicateurs-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success('Export Excel généré avec succès');
  };

  // Fonction d'export CSV
  const exportToCSV = () => {
    const data = indicators.map(ind => ({
      'Numéro': ind.number,
      'Titre': ind.title,
      'Description': ind.description,
      'Catégorie': CATEGORY_LABELS[ind.category],
      'Statut': STATUS_CONFIG[ind.status].label,
      'Priorité': ind.priority === 'high' ? 'Haute' : ind.priority === 'medium' ? 'Moyenne' : 'Basse'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `qualiopi-indicateurs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV généré avec succès');
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Qualiopi</h1>
            <p className="text-gray-600 mt-2">Suivi de la conformité et des indicateurs qualité</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exporter Excel
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de conformité</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminés</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.done}</div>
              <p className="text-xs text-muted-foreground">sur {stats.total} indicateurs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">indicateurs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À faire</CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.todo}</div>
              <p className="text-xs text-muted-foreground">indicateurs</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="indicators" className="space-y-4">
          <TabsList>
            <TabsTrigger value="indicators">
              <FileCheck className="mr-2 h-4 w-4" />
              Indicateurs
            </TabsTrigger>
            <TabsTrigger value="surveys">
              <MessageSquare className="mr-2 h-4 w-4" />
              Enquêtes de satisfaction
            </TabsTrigger>
          </TabsList>

          {/* Indicators Tab */}
          <TabsContent value="indicators" className="space-y-4">
            {Object.entries(groupedByCategory).map(([category, categoryIndicators]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</CardTitle>
                  <CardDescription>
                    {categoryIndicators.filter((i) => i.status === "DONE").length} /{" "}
                    {categoryIndicators.length} terminés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryIndicators.map((indicator) => {
                    const config = STATUS_CONFIG[indicator.status];
                    const Icon = config.icon;
                    return (
                      <div
                        key={indicator.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${config.bgColor} hover:shadow-sm transition-shadow`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {indicator.number}
                                </Badge>
                                <h4 className="font-semibold">{indicator.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{indicator.description}</p>
                            </div>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enquêtes de satisfaction</CardTitle>
                <CardDescription>Collecte et analyse des retours bénéficiaires</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Satisfaction Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Star className="h-8 w-8 text-green-600 fill-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">4.8/5</div>
                      <p className="text-sm text-gray-600">Note moyenne</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">87%</div>
                      <p className="text-sm text-gray-600">Taux de réponse</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">+12%</div>
                      <p className="text-sm text-gray-600">vs année précédente</p>
                    </div>
                  </div>
                </div>

                {/* Recent Surveys */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Enquêtes récentes</h3>
                  <div className="space-y-2">
                    {[
                      { id: 1, name: "Alice Martin", date: "Il y a 2 jours", rating: 5, comment: "Excellent accompagnement" },
                      { id: 2, name: "Carla Petit", date: "Il y a 5 jours", rating: 5, comment: "Très satisfaite du bilan" },
                      { id: 3, name: "David Lefebvre", date: "Il y a 1 semaine", rating: 4, comment: "Bon suivi, quelques améliorations possibles" },
                    ].map((survey) => (
                      <div key={survey.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{survey.name}</span>
                            <span className="text-sm text-gray-500">• {survey.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < survey.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">{survey.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
