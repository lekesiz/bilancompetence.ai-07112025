import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, FileText, Download, ExternalLink, PlayCircle, Search } from "lucide-react";
import { useState } from "react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "guide" | "formation" | "reglementaire" | "video" | "modele";
  tags: string[];
  url?: string;
  downloadable?: boolean;
}

const RESOURCES: Resource[] = [
  {
    id: "1",
    title: "Guide complet du bilan de compétences",
    description: "Document de référence expliquant les 3 phases, les obligations légales et les bonnes pratiques",
    category: "guide",
    tags: ["Débutant", "Complet", "PDF"],
    downloadable: true,
  },
  {
    id: "2",
    title: "Code du travail - Articles L6313-1 et suivants",
    description: "Textes de loi encadrant le bilan de compétences en France",
    category: "reglementaire",
    tags: ["Légal", "Référence"],
    url: "https://www.legifrance.gouv.fr",
  },
  {
    id: "3",
    title: "Référentiel National Qualité (Qualiopi)",
    description: "Les 7 critères et 32 indicateurs Qualiopi expliqués",
    category: "reglementaire",
    tags: ["Qualiopi", "Certification", "PDF"],
    downloadable: true,
  },
  {
    id: "4",
    title: "Modèle de contrat d'engagement",
    description: "Template Word personnalisable pour le contrat tripartite",
    category: "modele",
    tags: ["Contrat", "Word", "Personnalisable"],
    downloadable: true,
  },
  {
    id: "5",
    title: "Grille d'entretien - Phase préliminaire",
    description: "Questions types pour la première phase du bilan",
    category: "modele",
    tags: ["Entretien", "Phase 1", "PDF"],
    downloadable: true,
  },
  {
    id: "6",
    title: "Tutoriel : Utiliser l'IA pour les recommandations",
    description: "Vidéo de 15 minutes expliquant comment tirer le meilleur parti de Gemini AI",
    category: "video",
    tags: ["IA", "Tutoriel", "15 min"],
    url: "https://www.youtube.com/watch?v=example",
  },
  {
    id: "7",
    title: "Formation : Techniques d'entretien motivationnel",
    description: "Module e-learning de 2h sur les techniques d'entretien",
    category: "formation",
    tags: ["E-learning", "2h", "Certifiant"],
    url: "https://formation.example.com",
  },
  {
    id: "8",
    title: "Modèle de synthèse de bilan",
    description: "Template Word pour rédiger la synthèse finale",
    category: "modele",
    tags: ["Synthèse", "Word", "Phase 3"],
    downloadable: true,
  },
  {
    id: "9",
    title: "Guide : Intégrer France Travail dans vos bilans",
    description: "Comment utiliser l'API France Travail pour enrichir vos recommandations",
    category: "guide",
    tags: ["API", "France Travail", "ROME"],
    downloadable: true,
  },
  {
    id: "10",
    title: "Réglementation RGPD pour les bilans de compétences",
    description: "Obligations légales en matière de protection des données personnelles",
    category: "reglementaire",
    tags: ["RGPD", "Données personnelles", "Conformité"],
    downloadable: true,
  },
];

const categoryIcons = {
  guide: BookOpen,
  formation: GraduationCap,
  reglementaire: FileText,
  video: PlayCircle,
  modele: FileText,
};

const categoryLabels = {
  guide: "Guides",
  formation: "Formations",
  reglementaire: "Réglementation",
  video: "Vidéos",
  modele: "Modèles",
};

export default function ResourceLibrary() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!user) return null;

  const filteredResources = RESOURCES.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const resourcesByCategory = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bibliothèque de ressources</h1>
          <p className="text-gray-600 mt-2">
            Guides, modèles, formations et documentation pour réussir vos bilans de compétences
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une ressource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="guide">Guides</TabsTrigger>
            <TabsTrigger value="modele">Modèles</TabsTrigger>
            <TabsTrigger value="formation">Formations</TabsTrigger>
            <TabsTrigger value="video">Vidéos</TabsTrigger>
            <TabsTrigger value="reglementaire">Réglementation</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-6 mt-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredResources.length}</div>
                  <p className="text-xs text-gray-500 mt-1">ressources disponibles</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Téléchargeables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredResources.filter((r) => r.downloadable).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">documents PDF/Word</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Formations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredResources.filter((r) => r.category === "formation").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">modules e-learning</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Vidéos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredResources.filter((r) => r.category === "video").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">tutoriels vidéo</p>
                </CardContent>
              </Card>
            </div>

            {/* Resources Grid */}
            {Object.entries(resourcesByCategory).map(([category, resources]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h2>
                    <Badge variant="secondary">{resources.length}</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                      <Card key={resource.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{resource.title}</CardTitle>
                            {resource.downloadable && <Download className="h-4 w-4 text-gray-400" />}
                            {resource.url && <ExternalLink className="h-4 w-4 text-gray-400" />}
                          </div>
                          <CardDescription className="text-sm">{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="outline" className="w-full" size="sm">
                            {resource.downloadable && (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger
                              </>
                            )}
                            {resource.url && (
                              <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Accéder
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ressource trouvée</h3>
                <p className="text-gray-500">Essayez de modifier votre recherche ou vos filtres</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
