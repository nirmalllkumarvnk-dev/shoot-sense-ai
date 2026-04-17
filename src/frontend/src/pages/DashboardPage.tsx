import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatHistory,
  useGetCallerUserProfile,
  usePoses,
  useShootPlans,
} from "@/hooks/useBackend";
import type { PoseIdea, ShootPlan } from "@/types";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  CalendarClock,
  Camera,
  ChevronRight,
  Layers,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";

// ── Static photo tips ─────────────────────────────────────────────────────────
const PHOTO_TIPS = [
  "Use the golden hour — 30 min after sunrise or before sunset — for warm, dramatic natural light that elevates every portrait.",
  "Apply the rule of thirds: position your subject off-center to create dynamic tension and guide the viewer's eye naturally.",
  "Control depth of field — wide apertures (f/1.8–f/2.8) isolate subjects with creamy bokeh for professional-quality portraits.",
];

// ── Difficulty badge styles ───────────────────────────────────────────────────
const diffStyle: Record<string, string> = {
  Easy: "text-[oklch(0.7_0.15_145)] border-[oklch(0.7_0.15_145/0.4)] bg-[oklch(0.7_0.15_145/0.1)]",
  Medium:
    "text-[oklch(0.75_0.18_60)] border-[oklch(0.75_0.18_60/0.4)] bg-[oklch(0.75_0.18_60/0.1)]",
  Hard: "text-[oklch(0.65_0.25_15)] border-[oklch(0.65_0.25_15/0.4)] bg-[oklch(0.65_0.25_15/0.1)]",
};

// ── Resolve Motoko Difficulty variant name ───────────────────────────────────
function difficultyLabel(diff: unknown): string {
  if (typeof diff === "object" && diff !== null) {
    return Object.keys(diff)[0] ?? "Medium";
  }
  return String(diff);
}

// ── Animated HUD counter ──────────────────────────────────────────────────────
function HudStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numRef.current) return;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: value,
      duration: 1.8,
      ease: "power2.out",
      onUpdate() {
        if (numRef.current)
          numRef.current.textContent = String(Math.round(obj.v));
      },
    });
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-card/30 border border-border/20">
      <Icon className={`w-5 h-5 ${color}`} />
      <span
        ref={numRef}
        className={`font-mono text-2xl font-bold tabular-nums ${color}`}
      >
        0
      </span>
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ── Countdown to a future date ────────────────────────────────────────────────
function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins: Math.floor((diff % 3_600_000) / 60_000),
  };
}

// ── Panel skeleton placeholder ────────────────────────────────────────────────
function PanelSkeleton() {
  return (
    <div className="space-y-3 py-2">
      <Skeleton className="h-4 w-40 bg-card/60" />
      <Skeleton className="h-4 w-full bg-card/40" />
      <Skeleton className="h-4 w-3/4 bg-card/40" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: profileRaw, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: plansRaw, isLoading: plansLoading } = useShootPlans();
  const { data: posesRaw, isLoading: posesLoading } = usePoses();
  const { data: chatRaw, isLoading: chatLoading } = useChatHistory();

  // Normalise Motoko optional [] wrapper
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
  const plans = (plansRaw ?? []) as ShootPlan[];
  const poses = (posesRaw ?? []) as PoseIdea[];
  const chatCount = (chatRaw ?? []).length;

  const displayName = profile?.displayName ?? "Photographer";
  const recentPlans = [...plans]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 3);
  const recentPoses = [...poses]
    .sort((a, b) => Number(b.savedAt - a.savedAt))
    .slice(0, 4);

  // Next future scheduled plan
  const scheduledPlan = plans
    .filter((p) => p.scheduledDate && new Date(p.scheduledDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.scheduledDate!).getTime() -
        new Date(b.scheduledDate!).getTime(),
    )[0];
  const countdown = scheduledPlan?.scheduledDate
    ? getCountdown(scheduledPlan.scheduledDate)
    : null;

  const anyLoading =
    profileLoading || plansLoading || posesLoading || chatLoading;

  // GSAP stagger entrance
  useEffect(() => {
    const panels = containerRef.current?.querySelectorAll(".dash-panel");
    if (!panels?.length) return;
    gsap.fromTo(
      panels,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.11,
        clearProps: "transform",
      },
    );
  }, []);

  return (
    <div
      ref={containerRef}
      data-ocid="dashboard.page"
      className="min-h-screen p-4 md:p-6 space-y-5 max-w-6xl mx-auto"
    >
      {/* ── Panel 1: AI System Status (full width) ─────────────────────── */}
      <GlassCard
        className="dash-panel p-5 md:p-7 opacity-0"
        neon="cyan"
        data-ocid="dashboard.status_panel"
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.55_0.26_264)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.55_0.26_264)]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              System Online
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-[oklch(0.55_0.26_264)]" />
            <span className="uppercase tracking-widest">
              SenseAI v2.5.8 — 2258
            </span>
          </div>
        </div>

        {/* Greeting */}
        <h1 className="font-display text-2xl md:text-4xl font-bold hero-glow mb-1 tracking-tight">
          {profileLoading ? (
            <Skeleton className="h-9 w-64 bg-card/60 inline-block" />
          ) : (
            <>
              Welcome back,{" "}
              <span className="text-[oklch(0.55_0.26_264)]">{displayName}</span>
            </>
          )}
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-5">
          Mission Control — Photography Intelligence Hub
        </p>

        {/* HUD stats */}
        {anyLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 bg-card/60 rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-3 gap-3"
            data-ocid="dashboard.stats_grid"
          >
            <HudStat
              label="Poses"
              value={poses.length}
              icon={Layers}
              color="text-[oklch(0.55_0.26_264)]"
            />
            <HudStat
              label="Plans"
              value={plans.length}
              icon={Target}
              color="text-[oklch(0.6_0.25_305)]"
            />
            <HudStat
              label="Messages"
              value={chatCount}
              icon={MessageSquare}
              color="text-[oklch(0.55_0.26_264)]"
            />
          </div>
        )}
      </GlassCard>

      {/* ── 2-col grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Panel 2: Shoot Plans ───────────────────────────────────────── */}
        <GlassCard
          className="dash-panel p-5 opacity-0 flex flex-col"
          neon="purple"
          data-ocid="dashboard.plans_panel"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4.5 h-4.5 text-[oklch(0.6_0.25_305)]" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                Your Shoot Plans
              </h2>
            </div>
            <Link
              to="/shoot-planner"
              data-ocid="dashboard.plans_view_all_link"
              className="font-mono text-[10px] text-[oklch(0.6_0.25_305)] uppercase tracking-widest hover:text-[oklch(0.72_0.25_305)] transition-smooth flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {plansLoading ? (
            <PanelSkeleton />
          ) : recentPlans.length === 0 ? (
            <div
              className="flex-1 flex flex-col items-center justify-center py-8 gap-3"
              data-ocid="dashboard.plans_empty_state"
            >
              <Camera className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                No shoot plans yet.
                <br />
                Start planning your perfect session.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 flex-1" data-ocid="dashboard.plans_list">
              {recentPlans.map((plan, i) => (
                <li
                  key={plan.id.toString()}
                  data-ocid={`dashboard.plans_item.${i + 1}`}
                  className="flex items-center justify-between rounded-lg p-3 bg-card/20 border border-border/10 hover:bg-card/40 transition-smooth group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate text-foreground">
                      {plan.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-muted-foreground">
                      {plan.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          {plan.location}
                        </span>
                      )}
                      <span className="shrink-0">
                        {plan.poseIds.length} poses
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-[oklch(0.6_0.25_305)] transition-smooth shrink-0 ml-2" />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <Link to="/shoot-planner" data-ocid="dashboard.new_plan_button">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-[oklch(0.6_0.25_305/0.4)] text-[oklch(0.65_0.25_305)] bg-[oklch(0.6_0.25_305/0.08)] hover:bg-[oklch(0.6_0.25_305/0.2)] transition-smooth"
              >
                <Plus className="w-4 h-4" />
                New Plan
              </Button>
            </Link>
          </div>
        </GlassCard>

        {/* ── Panel 3: Recent Poses ──────────────────────────────────────── */}
        <GlassCard
          className="dash-panel p-5 opacity-0 flex flex-col"
          neon="cyan"
          data-ocid="dashboard.poses_panel"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-[oklch(0.55_0.26_264)]" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                Recent Poses
              </h2>
            </div>
            <Link
              to="/poses"
              data-ocid="dashboard.poses_explore_link"
              className="font-mono text-[10px] text-[oklch(0.55_0.26_264)] uppercase tracking-widest hover:text-[oklch(0.68_0.26_264)] transition-smooth flex items-center gap-0.5"
            >
              Explore <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {posesLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 bg-card/60 rounded-lg" />
              ))}
            </div>
          ) : recentPoses.length === 0 ? (
            <div
              className="flex-1 flex flex-col items-center justify-center py-8 gap-3"
              data-ocid="dashboard.poses_empty_state"
            >
              <Layers className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                No poses saved yet.
                <br />
                Generate your first pose idea.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-2 flex-1"
              data-ocid="dashboard.poses_grid"
            >
              {recentPoses.map((pose, i) => {
                const diff = difficultyLabel(pose.difficulty);
                const colorCls = diffStyle[diff] ?? diffStyle.Medium;
                return (
                  <div
                    key={pose.id.toString()}
                    data-ocid={`dashboard.poses_item.${i + 1}`}
                    className="flex flex-col gap-2 rounded-lg p-3 bg-card/20 border border-border/10 hover:bg-card/40 transition-smooth"
                  >
                    <p className="font-medium text-xs leading-snug line-clamp-2 text-foreground">
                      {pose.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono uppercase tracking-wide px-1.5 py-0 self-start ${colorCls}`}
                    >
                      {diff}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* ── Panel 4: AI Photo Tips ─────────────────────────────────────── */}
        <GlassCard
          className="dash-panel p-5 opacity-0"
          neon="purple"
          data-ocid="dashboard.tips_panel"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4.5 h-4.5 text-[oklch(0.6_0.25_305)]" />
            <h2 className="font-display font-semibold text-sm text-foreground">
              AI Photo Tips
            </h2>
          </div>
          <ul className="space-y-4" data-ocid="dashboard.tips_list">
            {PHOTO_TIPS.map((tip, i) => (
              <li
                key={tip.slice(0, 20)}
                data-ocid={`dashboard.tips_item.${i + 1}`}
                className="flex gap-3"
              >
                {/* Neon bullet */}
                <span className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full border border-[oklch(0.6_0.25_305/0.5)] bg-[oklch(0.6_0.25_305/0.1)]">
                  <Zap className="w-2.5 h-2.5 text-[oklch(0.6_0.25_305)]" />
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip}
                </p>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* ── Panel 5: Next Shoot ───────────────────────────────────────── */}
        <GlassCard
          className="dash-panel p-5 opacity-0 flex flex-col"
          neon="cyan"
          data-ocid="dashboard.next_shoot_panel"
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4.5 h-4.5 text-[oklch(0.55_0.26_264)]" />
            <h2 className="font-display font-semibold text-sm text-foreground">
              Next Shoot
            </h2>
          </div>

          {plansLoading ? (
            <PanelSkeleton />
          ) : scheduledPlan && countdown ? (
            <div
              className="flex-1 space-y-3"
              data-ocid="dashboard.next_shoot_info"
            >
              <p className="font-display font-bold text-base text-foreground truncate">
                {scheduledPlan.name}
              </p>
              {scheduledPlan.location && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[oklch(0.55_0.26_264)]" />
                  <span className="truncate">{scheduledPlan.location}</span>
                </div>
              )}

              {/* Countdown */}
              <div
                className="grid grid-cols-3 gap-2"
                data-ocid="dashboard.next_shoot_countdown"
              >
                {[
                  { val: countdown.days, unit: "Days" },
                  { val: countdown.hours, unit: "Hrs" },
                  { val: countdown.mins, unit: "Min" },
                ].map(({ val, unit }) => (
                  <div
                    key={unit}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-card/30 border border-[oklch(0.55_0.26_264/0.2)]"
                  >
                    <span className="font-mono text-xl font-bold tabular-nums text-[oklch(0.55_0.26_264)]">
                      {String(val).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {unit}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] font-mono text-muted-foreground">
                {scheduledPlan.poseIds.length} poses ·{" "}
                {new Date(scheduledPlan.scheduledDate!).toLocaleDateString(
                  undefined,
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </p>
            </div>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center py-8 gap-4"
              data-ocid="dashboard.next_shoot_empty_state"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[oklch(0.55_0.26_264/0.1)] border border-[oklch(0.55_0.26_264/0.3)]">
                <Bot className="w-6 h-6 text-[oklch(0.55_0.26_264)]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No upcoming shoots
                </p>
                <p className="text-xs text-muted-foreground">
                  Schedule a date to see your countdown.
                </p>
              </div>
              <Link
                to="/shoot-planner"
                data-ocid="dashboard.plan_next_shoot_button"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-[oklch(0.55_0.26_264/0.4)] text-[oklch(0.55_0.26_264)] bg-[oklch(0.55_0.26_264/0.05)] hover:bg-[oklch(0.55_0.26_264/0.15)] transition-smooth text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Plan Your Next Shoot
                </Button>
              </Link>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-border/20 text-center">
        <p className="font-mono text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-[oklch(0.55_0.26_264)] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
