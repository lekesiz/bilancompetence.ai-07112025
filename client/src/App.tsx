import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Bilans from "./pages/Bilans";
import BilanDetail from "./pages/BilanDetail";
import Consultants from "./pages/Consultants";
import Beneficiaries from "./pages/Beneficiaries";
import Sessions from "./pages/Sessions";
import Recommendations from "./pages/Recommendations";
import SkillsAssessment from "./pages/SkillsAssessment";
import FranceTravail from "./pages/FranceTravail";
import Qualiopi from "@/pages/Qualiopi";
import ResourceLibrary from "./pages/ResourceLibrary";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Documents from "./pages/Documents";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/bilans"} component={Bilans} />
      <Route path={"/bilans/:id"} component={BilanDetail} />
      <Route path={"/bilans/:id/recommendations"} component={Recommendations} />
      <Route path={"/bilans/:id/skills"} component={SkillsAssessment} />
      <Route path={"/bilans/:id/france-travail"} component={FranceTravail} />
      <Route path={"/consultants"} component={Consultants} />
      <Route path={"/beneficiaries"} component={Beneficiaries} />
      <Route path={"/sessions"} component={Sessions} />
       <Route path="/qualiopi" component={Qualiopi} />      <Route path={"/resources"} component={ResourceLibrary} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/profile"} component={Profile} />      <Route path={"/bilans/:id/messages"} component={Messages} />
      <Route path={"/bilans/:id/documents"} component={Documents} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
