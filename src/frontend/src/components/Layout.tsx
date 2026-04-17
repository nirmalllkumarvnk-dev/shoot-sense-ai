import { useAuth } from "@/hooks/useAuth";
import { useGetCallerUserProfile } from "@/hooks/useBackend";
import { useAppStore } from "@/store";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bot,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cpu,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Wand2,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "AI Chat", path: "/chat", icon: Bot },
  { label: "Pose Creator", path: "/poses", icon: Wand2 },
  { label: "Shoot Planner", path: "/shoot-planner", icon: Calendar },
  { label: "Profile", path: "/profile", icon: User },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { isAuthenticated, logout, isInitializing } = useAuth();
  const { data: profile } = useGetCallerUserProfile();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col shrink-0 h-full transition-smooth z-30
          bg-card border-r border-border/40
          ${sidebarOpen ? "w-64" : "w-16"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border/30">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 neon-glow shrink-0">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-display font-bold text-sm leading-tight hero-glow text-primary truncate">
                SHOOT SENSE
              </p>
              <p className="font-display text-xs text-secondary truncate">
                VITHE TREXA AI
              </p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}.link`}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth group
                  ${
                    isActive
                      ? "bg-primary/20 text-primary neon-glow"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                />
                {sidebarOpen && (
                  <span className="font-body text-sm truncate">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User + Toggle */}
        <div className="px-2 py-3 border-t border-border/30 space-y-2">
          {isAuthenticated && !isInitializing && sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-display text-foreground truncate">
                  {profile?.displayName ?? "Anonymous"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Photographer
                </p>
              </div>
              <button
                type="button"
                data-ocid="nav.logout.button"
                onClick={logout}
                aria-label="Logout"
                className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-smooth"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            type="button"
            data-ocid="nav.sidebar_toggle.button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted/50 transition-smooth text-muted-foreground"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 h-14 bg-card border-b border-border/40">
        <button
          type="button"
          data-ocid="nav.mobile_menu.button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-lg hover:bg-muted/50 transition-smooth"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Cpu className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm text-primary hero-glow">
            SHOOT SENSE AI
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background pt-14 lg:pt-0">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
