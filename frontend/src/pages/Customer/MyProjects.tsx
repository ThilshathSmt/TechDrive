// src/pages/Customer/MyProjects.tsx
import React, { useState, useEffect } from "react";
import { FolderKanban, Plus } from "lucide-react";
import {
  listMyProjects,
  createProject,
  deleteMyProject,
  getMyProject,
  updateMyProject,
  ProjectDTO,
} from "../../api/projects";
import { listMyVehicles } from "../../api/vehicles";
import useApi from "../../hooks/useApi";

/* ---- Theme tokens (match Admin/UserManagement) ---- */
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN_BASE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-0 ring-1 ring-white/10";
const INPUT =
  "mt-1 w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";

// Local form type
type ProjectForm = {
  vehicleId?: number;
  projectName: string;
  description: string;
  additionalNotes: string;
};

const MyProjects: React.FC = () => {
  // Data
  const {
    data: projectsRaw,
    loading,
    error,
    refetch,
  } = useApi<ProjectDTO[]>(() => listMyProjects(), []);
  const projects = projectsRaw ?? [];

  const { data: myVehiclesRaw } = useApi(() => listMyVehicles(), []);
  const myVehicles = myVehiclesRaw ?? [];

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editProject, setEditProject] = useState<ProjectDTO | null>(null);

  const [form, setForm] = useState<ProjectForm>({
    vehicleId: undefined,
    projectName: "",
    description: "",
    additionalNotes: "",
  });

  useEffect(() => {
    // default vehicle (if exists) when opening create modal
    if (!showModal && myVehicles.length > 0 && !editProject) {
      setForm((f) => ({ ...f, vehicleId: myVehicles[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myVehicles]);

  const openCreate = () => {
    setEditProject(null);
    setForm({
      vehicleId: myVehicles.length ? myVehicles[0].id : undefined,
      projectName: "",
      description: "",
      additionalNotes: "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = async (p: ProjectDTO) => {
    setEditProject(p);
    try {
      const full = await getMyProject(p.id);
      setForm({
        vehicleId:
          full.vehicleId ??
          myVehicles.find((v: any) => v.registrationNumber === full.vehicleRegistrationNumber)?.id,
        projectName: full.projectName,
        description: full.description ?? "",
        additionalNotes: "",
      });
    } catch {
      setForm({
        vehicleId: undefined,
        projectName: p.projectName,
        description: p.description ?? "",
        additionalNotes: "",
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProject(null);
    setForm({
      vehicleId: myVehicles.length ? myVehicles[0].id : undefined,
      projectName: "",
      description: "",
      additionalNotes: "",
    });
    setFormError(null);
  };

  const validate = (f: ProjectForm): string | null => {
    if (!f.vehicleId && !editProject) return "Please select a vehicle.";
    if (!f.projectName?.trim()) return "Project name is required.";
    if (!f.description?.trim()) return "Description is required.";
    if (f.projectName.trim().length < 3) return "Project name must be at least 3 characters.";
    if (f.description.trim().length < 10) return "Description must be at least 10 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const msg = validate(form);
    if (msg) {
      setFormError(msg);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editProject) {
        await updateMyProject(editProject.id, {
          projectName: form.projectName.trim(),
          description: form.description.trim(),
          additionalNotes: form.additionalNotes.trim() || undefined,
        });
      } else {
        await createProject({
          vehicleId: form.vehicleId!,
          projectName: form.projectName.trim(),
          description: form.description.trim(),
          additionalNotes: form.additionalNotes.trim() || undefined,
        });
      }
      await refetch();
      closeModal();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to save project";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this project?")) return;
    setIsSubmitting(true);
    try {
      await deleteMyProject(id);
      await refetch();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to delete project";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative text-white">
      {/* Backdrop (dark neon) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/80" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>
        <button
          onClick={openCreate}
          className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>
      <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">My Projects</h1>
      <p className="text-slate-300/90 text-sm">Track your service projects</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300/90 text-sm">Total Projects</p>
              <p className="text-3xl font-extrabold tracking-tight text-cyan-300">{projects.length}</p>
            </div>
            <div className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 ring-1 ring-emerald-300 text-emerald-300">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className={`${CARD} mt-6 overflow-hidden`}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-300/90">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-300">Error loading projects</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-16 h-16 ${ACCENT_GRADIENT} text-slate-950 mx-auto mb-4 rounded-xl grid place-items-center ring-1 ring-white/10`}>
              <FolderKanban className="w-7 h-7" />
            </div>
            <p className="text-slate-300/90">No projects yet</p>
            <button
              onClick={openCreate}
              className={`${BTN_BASE} mt-4 ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {projects.map((p) => (
                <li key={p.id} className="rounded-xl ring-1 ring-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white truncate">{p.projectName}</p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 ring-1 ring-white/10">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300/90 mt-1 whitespace-pre-line">
                        {p.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {p.vehicleMake && p.vehicleModel ? (
                          <>
                            Vehicle: {p.vehicleMake} {p.vehicleModel}
                            {p.vehicleYear ? ` (${p.vehicleYear})` : ""}{" "}
                            {p.vehicleRegistrationNumber ? `• ${p.vehicleRegistrationNumber}` : ""}
                          </>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(p)}
                        className={`${BTN_BASE} bg-white/5 hover:bg-white/10 text-sm`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className={`${BTN_BASE} bg-white/5 hover:bg-white/10 text-sm`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-3">
                    {typeof p.estimatedCost !== "undefined" && (
                      <span>
                        Est. Cost:{" "}
                        {p.estimatedCost === null
                          ? "—"
                          : Number(p.estimatedCost).toLocaleString()}
                      </span>
                    )}
                    {typeof p.actualCost !== "undefined" && (
                      <span>
                        Actual:{" "}
                        {p.actualCost === null
                          ? "—"
                          : Number(p.actualCost).toLocaleString()}
                      </span>
                    )}
                    {typeof p.progressPercentage !== "undefined" && (
                      <span>Progress: {p.progressPercentage ?? 0}%</span>
                    )}
                    {p.expectedCompletionDate && (
                      <span>ETA: {new Date(p.expectedCompletionDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className={`${CARD} relative w-full max-w-lg mx-4 p-6`}>
            <h2 className="text-xl font-semibold">
              {editProject ? "Edit Project" : "New Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Vehicle (only on create; vehicle doesn't change on edit in this UI) */}
              {!editProject && (
                <div>
                  <label className="block text-sm font-medium text-slate-200">Vehicle</label>
                  <select
                    value={form.vehicleId ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        vehicleId: Number(e.target.value) || undefined,
                      }))
                    }
                    required
                    className={`${INPUT} appearance-none`}
                  >
                    <option className="bg-slate-900" value="">Select vehicle</option>
                    {myVehicles.map((v: any) => (
                      <option className="bg-slate-900" key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-slate-200">Project Name</label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
                  required
                  className={INPUT}
                  placeholder="e.g. Brake Overhaul"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-2 00">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  className={`${INPUT} min-h-28`}
                  placeholder="Describe the issue or work to be done"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={form.additionalNotes}
                  onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                  className={`${INPUT} min-h-20`}
                  placeholder="Any extra details"
                />
              </div>

              {formError && (
                <div className="text-sm text-rose-300 bg-rose-500/10 ring-1 ring-rose-500/20 px-3 py-2 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 disabled:opacity-60`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editProject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;