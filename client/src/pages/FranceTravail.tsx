import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Briefcase, GraduationCap, MapPin, Clock, TrendingUp, Search, ExternalLink } from "lucide-react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function FranceTravail() {
  const { user } = useAuth();
  const [, params] = useRoute("/bilans/:id/france-travail");
  const bilanId = params?.id ? parseInt(params.id) : 0;

  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedRomeCode, setSelectedRomeCode] = useState<string | undefined>();

  // Recherche de codes ROME basée sur des compétences exemple
  const { data: romeCodes } = trpc.franceTravail.searchRome.useQuery({
    skills: ["Gestion de projet", "Communication", "Leadership", "Management"],
  });

  // Recherche d'offres d'emploi
  const { data: jobOffers, isLoading: isLoadingJobs } = trpc.franceTravail.searchJobs.useQuery({
    romeCode: selectedRomeCode,
    keywords: searchKeywords || undefined,
    location: searchLocation || undefined,
  });

  // Recherche de formations
  const { data: trainings, isLoading: isLoadingTrainings } = trpc.franceTravail.searchTrainings.useQuery({
    romeCode: selectedRomeCode,
    keywords: searchKeywords || undefined,
  });

  const handleSearch = () => {
    toast.success("Recherche lancée");
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">France Travail</h1>
          <p className="text-gray-600 mt-2">Offres d'emploi et formations recommandées</p>
        </div>

        {/* Search Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche</CardTitle>
            <CardDescription>Filtrez les résultats selon vos critères</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="keywords">Mots-clés</Label>
                <Input
                  id="keywords"
                  placeholder="Ex: développeur, chef de projet..."
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  placeholder="Ex: Paris, Lyon..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rome">Code ROME</Label>
                <select
                  id="rome"
                  className="w-full h-10 px-3 border rounded-md"
                  value={selectedRomeCode || ""}
                  onChange={(e) => setSelectedRomeCode(e.target.value || undefined)}
                >
                  <option value="">Tous les métiers</option>
                  {romeCodes?.map((rome) => (
                    <option key={rome.code} value={rome.code}>
                      {rome.code} - {rome.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
          </CardContent>
        </Card>

        {/* ROME Codes */}
        {romeCodes && romeCodes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Codes ROME correspondants</CardTitle>
              <CardDescription>Métiers recommandés selon votre profil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {romeCodes.map((rome) => (
                  <Badge
                    key={rome.code}
                    variant={selectedRomeCode === rome.code ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedRomeCode(rome.code === selectedRomeCode ? undefined : rome.code)}
                  >
                    {rome.code} - {rome.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs: Jobs & Trainings */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">
              <Briefcase className="mr-2 h-4 w-4" />
              Offres d'emploi ({jobOffers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="trainings">
              <GraduationCap className="mr-2 h-4 w-4" />
              Formations ({trainings?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Job Offers */}
          <TabsContent value="jobs" className="space-y-4">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : jobOffers && jobOffers.length > 0 ? (
              jobOffers.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {job.company} • {job.location}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{job.contractType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {job.salary}
                          </div>
                        )}
                        {job.romeCode && (
                          <Badge variant="outline" className="font-mono">
                            {job.romeCode}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir l'offre
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Essayez de modifier vos critères de recherche
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trainings */}
          <TabsContent value="trainings" className="space-y-4">
            {isLoadingTrainings ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : trainings && trainings.length > 0 ? (
              trainings.map((training) => (
                <Card key={training.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{training.title}</CardTitle>
                        <CardDescription className="mt-1">{training.provider}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {training.certifying && <Badge variant="default">Certifiante</Badge>}
                        {training.cpfEligible && <Badge variant="secondary">CPF</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{training.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {training.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {training.location}
                      </div>
                      {training.romeCode && (
                        <Badge variant="outline" className="font-mono">
                          {training.romeCode}
                        </Badge>
                      )}
                    </div>

                    {training.targetJobs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Métiers visés :</p>
                        <div className="flex flex-wrap gap-2">
                          {training.targetJobs.map((job, index) => (
                            <Badge key={index} variant="outline">
                              {job}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-4 border-t">
                      <Button size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir la formation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune formation trouvée</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Essayez de modifier vos critères de recherche
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
