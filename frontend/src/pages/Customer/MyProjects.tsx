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

type ProjectForm = {
  vehicleId?: number;
  projectName: string;
  description: string;
  additionalNotes: string;
};

const MyProjects: React.FC = () => {
  // Coerce possibly-null data to arrays
  const {
    data: projectsRaw,
    loading,
    error,
    refetch,
  } = useApi<ProjectDTO[]>(() => listMyProjects(), []);
  const projects = projectsRaw ?? [];

  const { data: myVehiclesRaw } = useApi(() => listMyVehicles(), []);
  const myVehicles = myVehiclesRaw ?? [];

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
      // additionalNotes are appended into description by BE if present; keep empty unless adding more.
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
        // Partial update (only send fields that may change)
        await updateMyProject(editProject.id, {
          projectName: form.projectName.trim(),
          description: form.description.trim(),
          additionalNotes: form.additionalNotes.trim() || undefined,
        });
      } else {
        // Create
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">Track your service projects</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <FolderKanban className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">Error loading projects</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No projects yet</p>
            <button
              onClick={openCreate}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {projects.map((p) => (
                <li key={p.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{p.projectName}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                        {p.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
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
                        className="text-blue-600 hover:underline text-sm text-left"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:underline text-sm text-left"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-3">
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
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editProject ? "Edit Project" : "New Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle (only on create; vehicle doesn't change on edit in this UI) */}
              {!editProject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                  <select
                    value={form.vehicleId ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        vehicleId: Number(e.target.value) || undefined,
                      }))
                    }
                    required
                    className="mt-1 block w-full border rounded-md px-2 py-1"
                  >
                    <option value="">Select vehicle</option>
                    {myVehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
                  required
                  className="mt-1 block w-full border rounded-md px-2 py-1"
                  placeholder="e.g. Brake Overhaul"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  className="mt-1 block w-full border rounded-md px-2 py-1 min-h-28"
                  placeholder="Describe the issue or work to be done"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={form.additionalNotes}
                  onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                  className="mt-1 block w-full border rounded-md px-2 py-1 min-h-20"
                  placeholder="Any extra details"
                />
              </div>

              {formError && <div className="text-red-600 text-sm">{formError}</div>}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-60"
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