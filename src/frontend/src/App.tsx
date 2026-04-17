import { AuthGuard } from "@/components/AuthGuard";
import { Layout } from "@/components/Layout";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import PosesPage from "./pages/PosesPage";
import ProfilePage from "./pages/ProfilePage";
import ShootPlannerPage from "./pages/ShootPlannerPage";

const rootRoute = createRootRoute();

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGuard>
      <Layout>
        <DashboardPage />
      </Layout>
    </AuthGuard>
  ),
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => (
    <AuthGuard>
      <Layout>
        <ChatPage />
      </Layout>
    </AuthGuard>
  ),
});

const posesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/poses",
  component: () => (
    <AuthGuard>
      <Layout>
        <PosesPage />
      </Layout>
    </AuthGuard>
  ),
});

const shootPlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shoot-planner",
  component: () => (
    <AuthGuard>
      <Layout>
        <ShootPlannerPage />
      </Layout>
    </AuthGuard>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AuthGuard>
      <Layout>
        <ProfilePage />
      </Layout>
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  authRoute,
  dashboardRoute,
  chatRoute,
  posesRoute,
  shootPlannerRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
