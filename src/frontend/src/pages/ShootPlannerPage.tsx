import type { PlanId, PoseId } from "@/backend";
import { GlassCard } from "@/components/GlassCard";
import {
  useCreateShootPlan,
  useDeleteShootPlan,
  useDuplicateShootPlan,
  useGenerateShootPlan,
  usePoses,
  useShootPlans,
  useUpdateShootPlan,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import {
  Calendar,
  CheckSquare,
  Copy,
  Edit3,
  MapPin,
  Plus,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PlanFormData {
  name: string;
  location: string;
  scheduledDate: string;
  notes: string;
  poseIds: bigint[];
  shotList: string[];
}

const defaultForm: PlanFormData = {
  name: "",
  location: "",
  scheduledDate: "",
  notes: "",
  poseIds: [],
  shotList: [],
};

export default function ShootPlannerPage() {
  const { data: plans = [], isLoading } = useShootPlans();
  const { data: poses = [] } = usePoses();
  const createPlan = useCreateShootPlan();
  const updatePlan = useUpdateShootPlan();
  const deletePlan = useDeleteShootPlan();
  const duplicatePlan = useDuplicateShootPlan();
  const generatePlan = useGenerateShootPlan();

  const [editingId, setEditingId] = useState<PlanId | null>(null);
  const [form, setForm] = useState<PlanFormData>(defaultForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<PlanId | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShotIdx, setEditingShotIdx] = useState<number | null>(null);
  const [checkedShots, setCheckedShots] = useState<Set<number>>(new Set());

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // GSAP: entrance animation
  useEffect(() => {
    if (leftPanelRef.current) {
      gsap.fromTo(
        leftPanelRef.current,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" },
      );
    }
    if (rightPanelRef.current) {
      gsap.fromTo(
        rightPanelRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.7, delay: 0.1, ease: "power3.out" },
      );
    }
  }, []);

  // GSAP: dialog entrance
  useEffect(() => {
    if (confirmDeleteId !== null && dialogRef.current) {
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" },
      );
    }
  }, [confirmDeleteId]);

  // GSAP: form slide when opened
  useEffect(() => {
    if (isFormOpen && rightPanelRef.current) {
      gsap.fromTo(
        rightPanelRef.current,
        { opacity: 0.7, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    }
  }, [isFormOpen]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setCheckedShots(new Set());
    setIsFormOpen(true);
  };

  const openEdit = (plan: (typeof plans)[0]) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      location: plan.location,
      scheduledDate: plan.scheduledDate ?? "",
      notes: plan.notes,
      poseIds: [...plan.poseIds],
      shotList: [...plan.shotList],
    });
    setCheckedShots(new Set());
    setIsFormOpen(true);
  };

  const openDuplicate = async (plan: (typeof plans)[0]) => {
    const newName = `${plan.name} (Copy)`;
    await duplicatePlan.mutateAsync({ id: plan.id, newName });
    toast.success(`Duplicated as "${newName}"`);
    // Open new plan for editing — find it after list refreshes
    setForm({
      name: newName,
      location: plan.location,
      scheduledDate: plan.scheduledDate ?? "",
      notes: plan.notes,
      poseIds: [...plan.poseIds],
      shotList: [...plan.shotList],
    });
    setEditingId(null);
    setCheckedShots(new Set());
    setIsFormOpen(true);
  };

  const togglePose = (poseId: PoseId) => {
    setForm((prev) => {
      const has = prev.poseIds.some((p) => p.toString() === poseId.toString());
      return {
        ...prev,
        poseIds: has
          ? prev.poseIds.filter((p) => p.toString() !== poseId.toString())
          : [...prev.poseIds, poseId],
      };
    });
  };

  const handleGenerate = async () => {
    const poseNames = form.poseIds
      .map((pid) => poses.find((p) => p.id === pid)?.name)
      .filter((n): n is string => Boolean(n));
    try {
      const result = await generatePlan.mutateAsync({
        planName: form.name || "Shoot",
        location: form.location || "Location",
        poseNames,
      });
      // Parse result into shot list items
      const items = result
        .split("\n")
        .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
        .filter(Boolean);
      setForm((prev) => ({ ...prev, shotList: items }));
      setCheckedShots(new Set());
      // Success flash
      if (successRef.current) {
        gsap.fromTo(
          successRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" },
        );
      }
      toast.success("AI shot list generated!");
    } catch {
      toast.error("Failed to generate shot list");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sd = form.scheduledDate || null;
    try {
      if (editingId !== null) {
        await updatePlan.mutateAsync({
          id: editingId,
          name: form.name,
          location: form.location,
          scheduledDate: sd,
          poseIds: form.poseIds,
          shotList: form.shotList,
          notes: form.notes,
        });
        toast.success("Plan updated!");
      } else {
        await createPlan.mutateAsync({
          name: form.name,
          location: form.location,
          scheduledDate: sd,
          poseIds: form.poseIds,
          notes: form.notes,
        });
        toast.success("Plan created!");
      }
      setIsFormOpen(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch {
      toast.error("Failed to save plan");
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      await deletePlan.mutateAsync(confirmDeleteId);
      toast.success("Plan deleted");
      if (editingId === confirmDeleteId) {
        setIsFormOpen(false);
        setEditingId(null);
        setForm(defaultForm);
      }
    } catch {
      toast.error("Failed to delete plan");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const updateShotItem = (idx: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.shotList];
      updated[idx] = value;
      return { ...prev, shotList: updated };
    });
  };

  const toggleShot = (idx: number) => {
    setCheckedShots((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const removeShotItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      shotList: prev.shotList.filter((_, i) => i !== idx),
    }));
    setCheckedShots((prev) => {
      const next = new Set<number>();
      for (const k of prev) {
        if (k < idx) next.add(k);
        else if (k > idx) next.add(k - 1);
      }
      return next;
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto" data-ocid="planner.page">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Shoot Planner
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Plan, save, and reuse complete photography sessions.
          </p>
        </div>
        <button
          type="button"
          data-ocid="planner.create.button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/30 text-primary border border-primary/60 hover:bg-primary/40 neon-glow transition-smooth font-display text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Plan
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── LEFT: Plans List ── */}
        <div
          ref={leftPanelRef}
          className="w-full lg:w-[340px] shrink-0 space-y-3"
        >
          <p className="font-display text-xs text-muted-foreground uppercase tracking-widest mb-1 px-1">
            Your Plans
          </p>

          {isLoading ? (
            <div className="space-y-3" data-ocid="planner.list.loading_state">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-muted/30 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <GlassCard
              className="p-10 text-center"
              neon="none"
              data-ocid="planner.empty_state"
            >
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-display text-sm text-muted-foreground mb-1">
                No shoot plans yet.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="font-display text-xs text-primary hover:underline mt-1"
              >
                Create your first plan →
              </button>
            </GlassCard>
          ) : (
            <div className="space-y-3" data-ocid="planner.list">
              {plans.map((plan, i) => {
                const isActive = editingId === plan.id && isFormOpen;
                return (
                  <GlassCard
                    key={plan.id.toString()}
                    neon={isActive ? "purple" : "cyan"}
                    data-ocid={`planner.plan.item.${i + 1}`}
                    className={cn(
                      "p-4 transition-smooth",
                      isActive && "ring-1 ring-secondary/50",
                    )}
                  >
                    {/* Row 1: name + actions */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display font-semibold text-sm text-foreground truncate min-w-0">
                        {plan.name}
                      </p>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          data-ocid={`planner.edit.button.${i + 1}`}
                          onClick={() => openEdit(plan)}
                          aria-label="Edit plan"
                          className="p-1.5 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary transition-smooth"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`planner.duplicate.button.${i + 1}`}
                          onClick={() => openDuplicate(plan)}
                          aria-label="Duplicate plan"
                          className="p-1.5 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary transition-smooth"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`planner.delete.button.${i + 1}`}
                          onClick={() => setConfirmDeleteId(plan.id)}
                          aria-label="Delete plan"
                          className="p-1.5 rounded-lg hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-smooth"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: meta */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <p className="font-body text-xs text-muted-foreground truncate">
                        {plan.location || "No location"}
                      </p>
                    </div>
                    {plan.scheduledDate && (
                      <p className="font-mono text-xs text-secondary mt-1">
                        {plan.scheduledDate}
                      </p>
                    )}

                    {/* Row 3: stats */}
                    <div className="flex gap-3 mt-2 pt-2 border-t border-border/20">
                      <span className="text-xs text-muted-foreground">
                        <span className="text-primary font-mono">
                          {plan.poseIds.length}
                        </span>{" "}
                        poses
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <span className="text-secondary font-mono">
                          {plan.shotList.length}
                        </span>{" "}
                        shots
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Plan Form ── */}
        <div ref={rightPanelRef} className="flex-1 min-w-0">
          {!isFormOpen ? (
            <GlassCard
              neon="none"
              className="p-12 flex flex-col items-center justify-center text-center min-h-[320px]"
              data-ocid="planner.form.idle_state"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <p className="font-display font-semibold text-base text-foreground mb-1">
                Select or create a plan
              </p>
              <p className="font-body text-sm text-muted-foreground mb-4 max-w-xs">
                Click Edit on any plan to modify it, or create a new one to get
                started.
              </p>
              <button
                type="button"
                onClick={openCreate}
                data-ocid="planner.form.idle.create_button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 neon-glow transition-smooth font-display text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                New Plan
              </button>
            </GlassCard>
          ) : (
            <GlassCard
              neon="purple"
              className="p-5 md:p-6"
              data-ocid="planner.form.panel"
            >
              {/* Form Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-base text-foreground">
                  {editingId !== null ? "Edit Plan" : "New Shoot Plan"}
                </h2>
                <button
                  type="button"
                  data-ocid="planner.form.close_button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                    setForm(defaultForm);
                  }}
                  aria-label="Close form"
                  className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-smooth"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plan Name */}
                <div>
                  <label
                    htmlFor="plan-name"
                    className="block font-display text-xs text-muted-foreground mb-1.5 uppercase tracking-wider"
                  >
                    Plan Name
                  </label>
                  <input
                    id="plan-name"
                    type="text"
                    data-ocid="planner.form.name.input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Rooftop Night Session"
                    className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-primary/30 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-smooth"
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="plan-location"
                    className="block font-display text-xs text-muted-foreground mb-1.5 uppercase tracking-wider"
                  >
                    Location
                  </label>
                  <input
                    id="plan-location"
                    type="text"
                    data-ocid="planner.form.location.input"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="e.g. Downtown, Studio 4"
                    className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-primary/30 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-smooth"
                  />
                </div>

                {/* Scheduled Date */}
                <div>
                  <label
                    htmlFor="plan-date"
                    className="block font-display text-xs text-muted-foreground mb-1.5 uppercase tracking-wider"
                  >
                    Scheduled Date{" "}
                    <span className="normal-case text-muted-foreground/50">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="plan-date"
                    type="date"
                    data-ocid="planner.form.date.input"
                    value={form.scheduledDate}
                    onChange={(e) =>
                      setForm({ ...form, scheduledDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-primary/30 text-foreground font-body text-sm focus:outline-none focus:border-primary/60 transition-smooth"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="plan-notes"
                    className="block font-display text-xs text-muted-foreground mb-1.5 uppercase tracking-wider"
                  >
                    Notes
                  </label>
                  <textarea
                    id="plan-notes"
                    data-ocid="planner.form.notes.textarea"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Equipment, mood, special requirements…"
                    className="w-full px-4 py-2.5 rounded-lg bg-background/50 border border-primary/30 text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-smooth resize-none"
                  />
                </div>

                {/* Poses Multi-select */}
                {poses.length > 0 && (
                  <div>
                    <p className="font-display text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      Poses{" "}
                      <span className="normal-case text-primary font-mono">
                        ({form.poseIds.length} selected)
                      </span>
                    </p>
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1"
                      data-ocid="planner.form.poses.list"
                    >
                      {poses.map((pose, pi) => {
                        const selected = form.poseIds.some(
                          (p) => p.toString() === pose.id.toString(),
                        );
                        return (
                          <button
                            key={pose.id.toString()}
                            type="button"
                            data-ocid={`planner.form.pose.toggle.${pi + 1}`}
                            onClick={() => togglePose(pose.id)}
                            className={cn(
                              "px-2.5 py-2 rounded-lg text-left font-body text-xs transition-smooth border",
                              selected
                                ? "bg-primary/20 border-primary/60 text-primary"
                                : "bg-background/30 border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                            )}
                          >
                            <span className="line-clamp-2">{pose.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shot List */}
                {form.shotList.length > 0 && (
                  <div
                    ref={successRef}
                    data-ocid="planner.form.shotlist.section"
                  >
                    <p className="font-display text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      Shot List{" "}
                      <span className="normal-case text-secondary font-mono">
                        (
                        {
                          form.shotList.filter((_, i) => checkedShots.has(i))
                            .length
                        }
                        /{form.shotList.length} done)
                      </span>
                    </p>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {form.shotList.map((shot, si) => (
                        <div
                          key={`shot-${shot.slice(0, 20)}-${si}`}
                          className="flex items-start gap-2 group"
                          data-ocid={`planner.form.shot.item.${si + 1}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleShot(si)}
                            aria-label={
                              checkedShots.has(si)
                                ? "Uncheck shot"
                                : "Check shot"
                            }
                            className="mt-1 shrink-0 text-primary hover:text-secondary transition-smooth"
                          >
                            {checkedShots.has(si) ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          {editingShotIdx === si ? (
                            <input
                              type="text"
                              value={shot}
                              onChange={(e) =>
                                updateShotItem(si, e.target.value)
                              }
                              onBlur={() => setEditingShotIdx(null)}
                              className="flex-1 min-w-0 px-2 py-0.5 rounded bg-background/50 border border-primary/30 text-foreground font-body text-xs focus:outline-none focus:border-primary/60"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingShotIdx(si)}
                              className={cn(
                                "flex-1 min-w-0 font-body text-xs cursor-text break-words text-left",
                                checkedShots.has(si)
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground",
                              )}
                            >
                              {shot}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeShotItem(si)}
                            aria-label="Remove shot"
                            className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-smooth"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {/* AI Generate */}
                  <button
                    type="button"
                    data-ocid="planner.form.generate.button"
                    onClick={handleGenerate}
                    disabled={generatePlan.isPending || !form.name.trim()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary/30 transition-smooth font-display text-sm font-semibold disabled:opacity-40"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generatePlan.isPending
                      ? "Generating…"
                      : "Generate Shot List"}
                  </button>

                  <div className="flex gap-3 flex-1">
                    <button
                      type="button"
                      data-ocid="planner.form.cancel_button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingId(null);
                        setForm(defaultForm);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-muted/30 text-muted-foreground font-display text-sm hover:bg-muted/50 transition-smooth"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      data-ocid="planner.form.submit_button"
                      disabled={
                        !form.name.trim() ||
                        createPlan.isPending ||
                        updatePlan.isPending
                      }
                      className="flex-1 py-2.5 rounded-xl bg-primary/30 text-primary border border-primary/60 font-display text-sm font-semibold hover:bg-primary/40 neon-glow transition-smooth disabled:opacity-40"
                    >
                      {createPlan.isPending || updatePlan.isPending
                        ? "Saving…"
                        : editingId !== null
                          ? "Update"
                          : "Create"}
                    </button>
                  </div>
                </div>
              </form>
            </GlassCard>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          data-ocid="planner.delete.dialog"
        >
          <div
            ref={dialogRef}
            className="glassmorphism rounded-2xl border border-destructive/40 shadow-[0_0_40px_oklch(0.55_0.25_15/0.3)] w-full max-w-sm p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground">
                  Delete Plan?
                </h3>
                <p className="font-body text-xs text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-5">
              Are you sure you want to delete{" "}
              <span className="text-foreground font-semibold">
                {plans.find((p) => p.id === confirmDeleteId)?.name ??
                  "this plan"}
              </span>
              ? All shot list data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="planner.delete.cancel_button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-muted/30 text-muted-foreground font-display text-sm hover:bg-muted/50 transition-smooth"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="planner.delete.confirm_button"
                onClick={handleDelete}
                disabled={deletePlan.isPending}
                className="flex-1 py-2.5 rounded-xl bg-destructive/20 text-destructive border border-destructive/50 font-display text-sm font-semibold hover:bg-destructive/30 transition-smooth disabled:opacity-40"
              >
                {deletePlan.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
