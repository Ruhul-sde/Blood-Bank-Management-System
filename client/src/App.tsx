import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./context/AuthContext";

// Layout
import Layout from "@/components/layout/Layout";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Donors from "@/pages/donors";
import Recipients from "@/pages/recipients";
import Inventory from "@/pages/inventory";
import Requests from "@/pages/requests";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page
    window.location.href = "/login";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Layout>
          <ProtectedRoute component={Dashboard} />
        </Layout>
      </Route>
      <Route path="/donors">
        <Layout>
          <ProtectedRoute component={Donors} />
        </Layout>
      </Route>
      <Route path="/recipients">
        <Layout>
          <ProtectedRoute component={Recipients} />
        </Layout>
      </Route>
      <Route path="/inventory">
        <Layout>
          <ProtectedRoute component={Inventory} />
        </Layout>
      </Route>
      <Route path="/requests">
        <Layout>
          <ProtectedRoute component={Requests} />
        </Layout>
      </Route>
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
