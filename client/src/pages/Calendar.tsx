import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar as BigCalendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: 'Toute la journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucune session dans cette période',
  showMore: (total: number) => `+ ${total} session(s)`,
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    status: string;
    type: string;
    bilanId: number;
    beneficiaryName?: string;
  };
}

export default function Calendar() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Récupérer toutes les sessions selon le rôle
  const { data: sessions, isLoading } = trpc.sessions.listByBilan.useQuery(
    { bilanId: 0 }, // 0 = toutes les sessions
    { enabled: !!user }
  );

  // Transformer les sessions en événements calendrier
  const events: CalendarEvent[] = useMemo(() => {
    if (!sessions) return [];

    return sessions.map((session) => {
      const startDate = new Date(session.scheduledDate);
      const endDate = new Date(startDate.getTime() + (session.duration || 60) * 60000);

      return {
        id: session.id,
        title: `${session.type} - ${session.beneficiaryName || 'Bénéficiaire'}`,
        start: startDate,
        end: endDate,
        resource: {
          status: session.status,
          type: session.type,
          bilanId: session.bilanId,
          beneficiaryName: session.beneficiaryName,
        },
      };
    });
  }, [sessions]);

  // Style des événements selon le statut
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6'; // blue-500 par défaut

    switch (event.resource.status) {
      case 'COMPLETED':
        backgroundColor = '#22c55e'; // green-500
        break;
      case 'CANCELLED':
        backgroundColor = '#ef4444'; // red-500
        break;
      case 'SCHEDULED':
        backgroundColor = '#3b82f6'; // blue-500
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Sélection d'un événement
  const handleSelectEvent = (event: CalendarEvent) => {
    toast.info(`Session: ${event.title}`, {
      description: `Statut: ${event.resource.status}`,
    });
  };

  // Sélection d'un créneau (création de session)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (user?.role === 'CONSULTANT' || user?.role === 'ORG_ADMIN' || user?.role === 'ADMIN') {
      toast.info('Créer une nouvelle session', {
        description: `${format(slotInfo.start, 'PPpp', { locale: fr })}`,
      });
      // TODO: Ouvrir un modal de création de session
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Chargement du calendrier...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Calendrier des Sessions</h1>
              <p className="text-muted-foreground">
                Planification et suivi des séances d'accompagnement
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Planifiées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {events.filter((e) => e.resource.status === 'SCHEDULED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Complétées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {events.filter((e) => e.resource.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Annulées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {events.filter((e) => e.resource.status === 'CANCELLED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendrier */}
        <Card>
          <CardContent className="p-6">
            <div style={{ height: '700px' }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                culture="fr"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable={user?.role !== 'BENEFICIARY'}
                popup
                style={{ height: '100%' }}
                components={{
                  toolbar: (props) => (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => props.onNavigate('PREV')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => props.onNavigate('TODAY')}
                        >
                          Aujourd'hui
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => props.onNavigate('NEXT')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <h2 className="text-xl font-semibold">
                        {format(props.date, 'MMMM yyyy', { locale: fr })}
                      </h2>

                      <div className="flex gap-2">
                        <Button
                          variant={view === 'month' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => props.onView('month')}
                        >
                          Mois
                        </Button>
                        <Button
                          variant={view === 'week' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => props.onView('week')}
                        >
                          Semaine
                        </Button>
                        <Button
                          variant={view === 'day' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => props.onView('day')}
                        >
                          Jour
                        </Button>
                        <Button
                          variant={view === 'agenda' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => props.onView('agenda')}
                        >
                          Agenda
                        </Button>
                      </div>
                    </div>
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Légende */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm">Planifiée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm">Complétée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm">Annulée</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
