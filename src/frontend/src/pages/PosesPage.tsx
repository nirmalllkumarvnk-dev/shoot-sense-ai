import { Difficulty } from "@/backend";
import { GlassCard } from "@/components/GlassCard";
import {
  useCreatePose,
  useDeletePose,
  useFavoritePose,
  useGeneratePoseIdeas,
  usePoses,
} from "@/hooks/useBackend";
import gsap from "gsap";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  Heart,
  Loader2,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AIPoseCard {
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "advanced";
  tags: string[];
}

type FilterDifficulty = "all" | "easy" | "medium" | "advanced";
type SortMode = "newest" | "oldest" | "favorites";

// ── Constants ────────────────────────────────────────────────────────────────

const COUNTS = [6, 9, 12] as const;

const DIFF_OKLCH: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  easy: {
    bg: "oklch(0.35 0.15 162 / 0.15)",
    color: "oklch(0.75 0.2 162)",
    border: "oklch(0.55 0.18 162 / 0.35)",
  },
  medium: {
    bg: "oklch(0.75 0.18 85 / 0.12)",
    color: "oklch(0.82 0.18 85)",
    border: "oklch(0.7 0.16 85 / 0.35)",
  },
  advanced: {
    bg: "oklch(0.55 0.25 305 / 0.15)",
    color: "oklch(0.75 0.25 305)",
    border: "oklch(0.55 0.25 305 / 0.35)",
  },
};

const NEON_FOR_DIFF: Record<string, "cyan" | "purple" | "none"> = {
  easy: "cyan",
  medium: "none",
  advanced: "purple",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const oklch = DIFF_OKLCH[difficulty] ?? DIFF_OKLCH.easy;
  const labels: Record<string, string> = {
    easy: "Easy",
    medium: "Medium",
    advanced: "Advanced",
  };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-semibold uppercase tracking-widest border"
      style={{
        background: oklch.bg,
        color: oklch.color,
        borderColor: oklch.border,
      }}
    >
      {labels[difficulty] ?? difficulty}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-body">
      {tag}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PosesPage() {
  // Backend hooks
  const { data: poses = [], isLoading: posesLoading } = usePoses();
  const createPose = useCreatePose();
  const deletePose = useDeletePose();
  const favoritePose = useFavoritePose();
  const generateIdeas = useGeneratePoseIdeas();

  // AI Generator state
  const [genTheme, setGenTheme] = useState("");
  const [genCount, setGenCount] = useState<6 | 9 | 12>(6);
  const [aiCards, setAiCards] = useState<AIPoseCard[]>([]);
  const [parseError, setParseError] = useState(false);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  // Library filters
  const [filterDiff, setFilterDiff] = useState<FilterDifficulty>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  // Refs for GSAP
  const aiGridRef = useRef<HTMLDivElement>(null);
  const libGridRef = useRef<HTMLDivElement>(null);

  // ── Library mount animation ──────────────────────────────────────────────
  useEffect(() => {
    if (!posesLoading && poses.length > 0 && libGridRef.current) {
      const cards =
        libGridRef.current.querySelectorAll<HTMLElement>(".lib-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    }
  }, [posesLoading, poses.length]);

  // ── AI Generate ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!genTheme.trim()) return;
    setAiCards([]);
    setParseError(false);
    setSavedIndices(new Set());

    try {
      const raw = await generateIdeas.mutateAsync({
        theme: genTheme,
        count: BigInt(genCount),
      });

      // Parse JSON — accept array or object with poses/ideas key
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Try to extract JSON array from text
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("No JSON array found");
        }
      }

      const arr: AIPoseCard[] = Array.isArray(parsed)
        ? (parsed as AIPoseCard[])
        : Array.isArray((parsed as Record<string, unknown>).poses)
          ? ((parsed as Record<string, unknown>).poses as AIPoseCard[])
          : Array.isArray((parsed as Record<string, unknown>).ideas)
            ? ((parsed as Record<string, unknown>).ideas as AIPoseCard[])
            : [];

      setAiCards(arr);

      // GSAP cascade stagger after state update
      requestAnimationFrame(() => {
        if (aiGridRef.current) {
          const cards =
            aiGridRef.current.querySelectorAll<HTMLElement>(".ai-card");
          gsap.fromTo(
            cards,
            { opacity: 0, scale: 0.85, y: 24 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.07,
              ease: "back.out(1.4)",
              clearProps: "transform,opacity",
            },
          );
        }
      });
    } catch {
      setParseError(true);
    }
  };

  const handleSavePose = async (card: AIPoseCard, idx: number) => {
    const diff =
      card.difficulty === "easy"
        ? Difficulty.easy
        : card.difficulty === "medium"
          ? Difficulty.medium
          : Difficulty.advanced;

    await createPose.mutateAsync({
      name: card.name,
      description: card.description,
      difficulty: diff,
      tags: card.tags ?? [],
    });

    setSavedIndices((prev) => new Set([...prev, idx]));
  };

  // ── Library filtering/sorting ────────────────────────────────────────────
  const filteredPoses = poses
    .filter((p) => filterDiff === "all" || p.difficulty === filterDiff)
    .sort((a, b) => {
      if (sortMode === "favorites") {
        return Number(b.isFavorite) - Number(a.isFavorite);
      }
      const aTime = Number(a.savedAt ?? 0n);
      const bTime = Number(b.savedAt ?? 0n);
      return sortMode === "newest" ? bTime - aTime : aTime - bTime;
    });

  const FILTER_TABS: { key: FilterDifficulty; label: string }[] = [
    { key: "all", label: `All (${poses.length})` },
    {
      key: "easy",
      label: `Easy (${poses.filter((p) => p.difficulty === "easy").length})`,
    },
    {
      key: "medium",
      label: `Medium (${poses.filter((p) => p.difficulty === "medium").length})`,
    },
    {
      key: "advanced",
      label: `Advanced (${poses.filter((p) => p.difficulty === "advanced").length})`,
    },
  ];

  const SORT_OPTIONS: { key: SortMode; label: string }[] = [
    { key: "newest", label: "Newest First" },
    { key: "oldest", label: "Oldest First" },
    { key: "favorites", label: "Favorites First" },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10" data-ocid="poses.page">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-3 hero-glow">
          <Wand2 className="w-7 h-7 text-primary" />
          Pose Creator
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1.5">
          AI-generate photography poses and build your personal pose library.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Section 1 — AI Generator
          ══════════════════════════════════════════════════════════════════ */}
      <section data-ocid="poses.ai_generator.section">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h2 className="font-display font-semibold text-lg text-foreground">
            AI Pose Generator
          </h2>
        </div>

        {/* Controls card */}
        <GlassCard neon="purple" className="p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Theme input */}
            <input
              type="text"
              data-ocid="poses.ai_theme.input"
              value={genTheme}
              onChange={(e) => setGenTheme(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Pose theme — e.g. 'moody portrait', 'urban street fashion'…"
              className="
                flex-1 px-4 py-2.5 rounded-lg bg-background/50 border border-secondary/30
                text-foreground font-body text-sm placeholder:text-muted-foreground
                focus:outline-none focus:border-secondary/60 transition-smooth
              "
            />

            {/* Count selector */}
            <div
              className="flex items-center gap-1 bg-background/40 border border-secondary/20 rounded-lg px-1 py-1 shrink-0"
              aria-label="Pose count"
            >
              {COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  data-ocid={`poses.ai_count_${c}.button`}
                  onClick={() => setGenCount(c)}
                  className={`
                    px-3 py-1.5 rounded-md font-display text-xs font-semibold transition-smooth
                    ${
                      genCount === c
                        ? "bg-secondary/30 text-secondary border border-secondary/50"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Generate button */}
            <button
              type="button"
              data-ocid="poses.ai_generate.button"
              onClick={handleGenerate}
              disabled={generateIdeas.isPending || !genTheme.trim()}
              className="
                flex items-center gap-2 px-6 py-2.5 rounded-lg shrink-0
                bg-secondary/25 text-secondary border border-secondary/50
                hover:bg-secondary/35 transition-smooth font-display text-sm font-semibold
                neon-glow disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {generateIdeas.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Poses
                </>
              )}
            </button>
          </div>
        </GlassCard>

        {/* Parse error fallback */}
        {parseError && (
          <div
            data-ocid="poses.ai_result.error_state"
            className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 mb-6"
          >
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="font-body text-sm text-foreground">
              Couldn't parse AI response as pose cards. Try a different theme or
              regenerate.
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {generateIdeas.isPending && (
          <div
            data-ocid="poses.ai_result.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              "s1",
              "s2",
              "s3",
              "s4",
              "s5",
              "s6",
              "s7",
              "s8",
              "s9",
              "s10",
              "s11",
              "s12",
            ]
              .slice(0, genCount)
              .map((k) => (
                <div
                  key={k}
                  className="h-44 rounded-xl bg-muted/20 border border-border/20 animate-pulse"
                />
              ))}
          </div>
        )}

        {/* Generated results */}
        {!generateIdeas.isPending && aiCards.length > 0 && (
          <>
            <p className="font-body text-xs text-muted-foreground mb-3">
              {aiCards.length} poses generated for &ldquo;{genTheme}&rdquo;
            </p>
            <div
              ref={aiGridRef}
              data-ocid="poses.ai_results.list"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {aiCards.map((card, i) => {
                const diff = card.difficulty ?? "easy";
                const neon = NEON_FOR_DIFF[diff] ?? "cyan";
                const saved = savedIndices.has(i);
                return (
                  <div
                    key={`${card.name}-${i}`}
                    data-ocid={`poses.ai_card.item.${i + 1}`}
                    className="ai-card"
                  >
                    <GlassCard
                      neon={neon}
                      className="p-4 flex flex-col gap-3 h-full"
                    >
                      {/* Name + badge */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display font-semibold text-sm text-foreground leading-snug min-w-0 break-words">
                          {card.name}
                        </p>
                        <DifficultyBadge difficulty={diff} />
                      </div>

                      {/* Description */}
                      <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {card.description}
                      </p>

                      {/* Tags */}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {card.tags.slice(0, 4).map((tag) => (
                            <TagPill key={tag} tag={tag} />
                          ))}
                          {card.tags.length > 4 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{card.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Save button */}
                      <button
                        type="button"
                        data-ocid={`poses.ai_save.button.${i + 1}`}
                        onClick={() => handleSavePose(card, i)}
                        disabled={saved || createPose.isPending}
                        className={`
                          w-full py-2 rounded-lg font-display text-xs font-semibold transition-smooth
                          ${
                            saved
                              ? "border cursor-default"
                              : "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 neon-glow-primary"
                          }
                        `}
                        style={
                          saved
                            ? {
                                background: "oklch(0.35 0.15 162 / 0.1)",
                                color: "oklch(0.75 0.2 162)",
                                borderColor: "oklch(0.55 0.18 162 / 0.3)",
                              }
                            : undefined
                        }
                      >
                        {saved ? "✓ Saved to Library" : "Save to Library"}
                      </button>
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Section 2 — Personal Library
          ══════════════════════════════════════════════════════════════════ */}
      <section data-ocid="poses.library.section">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg text-foreground">
            My Pose Library
          </h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-display font-semibold">
            {poses.length}
          </span>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              data-ocid={`poses.filter_${key}.tab`}
              onClick={() => setFilterDiff(key)}
              className={`
                px-3.5 py-1.5 rounded-lg font-display text-xs transition-smooth
                ${
                  filterDiff === key
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40"
                }
              `}
            >
              {label}
            </button>
          ))}

          {/* Sort dropdown */}
          <div className="relative ml-auto">
            <button
              type="button"
              data-ocid="poses.sort.toggle"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground font-display text-xs transition-smooth"
            >
              Sort: {SORT_OPTIONS.find((o) => o.key === sortMode)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {sortOpen && (
              <div
                data-ocid="poses.sort.dropdown_menu"
                className="absolute right-0 top-full mt-1 z-20 glassmorphism rounded-xl border border-border/40 py-1 min-w-[160px] shadow-lg"
              >
                {SORT_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    data-ocid={`poses.sort_${key}.button`}
                    onClick={() => {
                      setSortMode(key);
                      setSortOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-2 font-display text-xs transition-smooth
                      ${sortMode === key ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading skeletons */}
        {posesLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["l1", "l2", "l3", "l4", "l5", "l6"].map((k) => (
              <div
                key={k}
                className="h-44 rounded-xl bg-muted/20 border border-border/20 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!posesLoading && filteredPoses.length === 0 && (
          <GlassCard
            neon="none"
            className="p-12 text-center"
            data-ocid="poses.library.empty_state"
          >
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-display text-base text-muted-foreground mb-1">
              {filterDiff !== "all"
                ? `No ${filterDiff} poses in your library.`
                : "Your pose library is empty — generate some AI poses above"}
            </p>
            {filterDiff !== "all" && (
              <button
                type="button"
                onClick={() => setFilterDiff("all")}
                className="mt-2 font-display text-xs text-primary hover:underline"
              >
                Show all poses
              </button>
            )}
          </GlassCard>
        )}

        {/* Library grid */}
        {!posesLoading && filteredPoses.length > 0 && (
          <div
            ref={libGridRef}
            data-ocid="poses.library.list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredPoses.map((pose, i) => {
              const diff = pose.difficulty ?? "easy";
              const neon: "cyan" | "purple" | "none" = pose.isFavorite
                ? "purple"
                : (NEON_FOR_DIFF[diff] ?? "cyan");
              return (
                <div
                  key={pose.id.toString()}
                  data-ocid={`poses.item.${i + 1}`}
                  className="lib-card"
                >
                  <GlassCard
                    neon={neon}
                    className="p-4 flex flex-col gap-3 h-full"
                  >
                    {/* Header row */}
                    <div className="flex items-start gap-2">
                      <p className="font-display font-semibold text-sm text-foreground leading-snug flex-1 min-w-0 break-words">
                        {pose.name}
                      </p>
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          data-ocid={`poses.favorite.button.${i + 1}`}
                          onClick={() => favoritePose.mutate(pose.id)}
                          aria-label={
                            pose.isFavorite ? "Unfavorite" : "Favorite"
                          }
                          className="p-1.5 rounded-lg hover:bg-secondary/20 transition-smooth"
                        >
                          <Heart
                            className={`w-4 h-4 transition-smooth ${
                              pose.isFavorite
                                ? "text-secondary fill-secondary"
                                : "text-muted-foreground hover:text-secondary"
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          data-ocid={`poses.delete.button.${i + 1}`}
                          onClick={() => deletePose.mutate(pose.id)}
                          aria-label="Delete pose"
                          className="p-1.5 rounded-lg hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-smooth"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {pose.description}
                    </p>

                    {/* Footer: badge + tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <DifficultyBadge difficulty={diff} />
                      {pose.tags.slice(0, 2).map((tag) => (
                        <TagPill key={tag} tag={tag} />
                      ))}
                      {pose.tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{pose.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
