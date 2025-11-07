import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { TrendingUp, Users, FileText, Calendar, BarChart3, PieChart } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const { user } = useAuth();

  // Données simulées pour les graphiques
  const bilansEvolutionData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Bilans créés',
        data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Bilans terminés',
        data: [8, 12, 10, 18, 15, 22, 20, 28, 25, 32, 30, 38],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const bilansStatusData = {
    labels: ['Phase préliminaire', 'Phase investigation', 'Phase conclusion', 'Terminés', 'Archivés'],
    datasets: [
      {
        data: [15, 25, 18, 38, 12],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
          'rgb(168, 85, 247)',
          'rgb(34, 197, 94)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const sessionsParMoisData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Sessions planifiées',
        data: [45, 52, 48, 65, 58, 72, 68, 85, 78, 95, 88, 102],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Sessions complétées',
        data: [42, 48, 45, 60, 55, 68, 65, 80, 75, 90, 85, 98],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Sessions annulées',
        data: [3, 4, 3, 5, 3, 4, 3, 5, 3, 5, 3, 4],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const consultantsPerformanceData = {
    labels: ['Sophie Martin', 'Jean Dupont', 'Marie Dubois', 'Pierre Leroy', 'Claire Bernard'],
    datasets: [
      {
        label: 'Bilans gérés',
        data: [28, 35, 22, 30, 25],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Taux de satisfaction',
        data: [4.8, 4.9, 4.7, 4.6, 4.8],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        yAxisID: 'y1',
      },
    ],
  };

  const satisfactionEvolutionData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Note moyenne',
        data: [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.7, 4.8, 4.8, 4.9, 4.9, 4.9],
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const recommendationsTypeData = {
    labels: ['Formation', 'Reconversion', 'Évolution interne', 'Création entreprise', 'Autre'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const dualAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        max: 5,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tableaux de Bord Analytiques</h1>
          <p className="text-muted-foreground mt-2">
            Visualisez les tendances et performances de votre activité
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bilans actifs</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">58</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions ce mois</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">102</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.9/5</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.2</span> vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultants actifs</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> ce trimestre
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="bilans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bilans">
              <BarChart3 className="mr-2 h-4 w-4" />
              Bilans
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Calendar className="mr-2 h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="consultants">
              <Users className="mr-2 h-4 w-4" />
              Consultants
            </TabsTrigger>
            <TabsTrigger value="satisfaction">
              <TrendingUp className="mr-2 h-4 w-4" />
              Satisfaction
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <PieChart className="mr-2 h-4 w-4" />
              Recommandations
            </TabsTrigger>
          </TabsList>

          {/* Bilans Tab */}
          <TabsContent value="bilans" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des bilans</CardTitle>
                  <CardDescription>Nombre de bilans créés et terminés par mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line data={bilansEvolutionData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition par statut</CardTitle>
                  <CardDescription>Distribution des bilans selon leur phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Doughnut data={bilansStatusData} options={{ ...chartOptions, scales: undefined }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sessions par mois</CardTitle>
                <CardDescription>Évolution des sessions planifiées, complétées et annulées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Bar data={sessionsParMoisData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultants Tab */}
          <TabsContent value="consultants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance des consultants</CardTitle>
                <CardDescription>Nombre de bilans gérés et taux de satisfaction par consultant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Bar data={consultantsPerformanceData} options={dualAxisOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Satisfaction Tab */}
          <TabsContent value="satisfaction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Évolution de la satisfaction</CardTitle>
                <CardDescription>Note moyenne des bénéficiaires au fil du temps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Line data={satisfactionEvolutionData} options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 0,
                        max: 5,
                      },
                    },
                  }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Types de recommandations</CardTitle>
                <CardDescription>Répartition des recommandations par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Pie data={recommendationsTypeData} options={{ ...chartOptions, scales: undefined }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
