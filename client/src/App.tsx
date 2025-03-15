import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "@/components/protected-route";
import { NavHeader } from "@/components/nav-header";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Subject from "@/pages/subject";
import Quiz from "@/pages/quiz";
import Auth from "@/pages/auth";
import Admin from "@/pages/admin";
import TeacherDashboard from "@/pages/teacher-dashboard";

function Router() {
  return (
    <>
      <NavHeader />
      <main>
        <Switch>
          <Route path="/auth" component={Auth} />
          <ProtectedRoute path="/" component={Home} />
          <ProtectedRoute path="/admin" component={Admin} />
          <ProtectedRoute path="/teacher/dashboard" component={TeacherDashboard} />
          <ProtectedRoute path="/subjects/:id" component={Subject} />
          <ProtectedRoute path="/topics/:id/quiz" component={Quiz} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;