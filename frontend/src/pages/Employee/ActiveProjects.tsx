// src/pages/Employee/ActiveProjects.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, FolderKanban, Car, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { listAssignedProjects, AssignedProjectDTO, ProjectStatus } from "../../api/employee";

const badgeFor = (status: ProjectStatus) => {
  const map: Record<ProjectStatus, { bg: string; text: string; Icon: React.FC<any> }> = {
    PENDING:    { bg: "bg-yellow-100", text: "text-yellow-800", Icon: AlertCircle },
    APPROVED:   { bg: "bg-blue-100",   text: "text-blue-800",   Icon: FolderKanban },
    IN_PROGRESS:{ bg: "bg-purple-100", text: "text-purple-800", Icon: Clock },
    ON_HOLD:    { bg: "bg-gray-100",   text: "text-gray-800",   Icon: Clock },
    COMPLETED:  { bg: "bg-green-100",  text: "text-green-800",  Icon: CheckCircle },
    CANCELLED:  { bg: "bg-red-100",    text: "text-red-800",    Icon: XCircle },
    REJECTED:   { bg: "bg-rose-100",   text: "text-rose-800",   Icon: XCircle },
  };
  return map[status] ?? map.PENDING;
};

const ActiveProjects: React.FC = () => {
  const [projects, setProjects] = useState<AssignedProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listAssignedProjects();
        setProjects(data);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const summary = [
        p.projectName,
        p.description,
        p.customerName,
        p.customerEmail,
        p.vehicleMake,
        p.vehicleModel,
        p.vehicleRegistrationNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !q || summary.includes(q);
    });
  }, [projects, search]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => ["APPROVED", "IN_PROGRESS", "ON_HOLD"].includes(p.status)).length;
    const completedToday = 0; // implement if you track completionDate === today
    return { total, active, completedToday };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Active Projects</h1>
        <p className="text-gray-600 mt-1">Manage your assigned projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FolderKanban className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          placeholder="Search by name, customer, email or vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : err ? (
          <div className="p-12 text-center text-red-600">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No active projects</p>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {filtered.map((p) => {
                const Badge = badgeFor(p.status);
                return (
                  <li key={p.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">
                            #{p.id} • {p.projectName}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${Badge.bg} ${Badge.text} inline-flex items-center gap-1`}>
                            <Badge.Icon className="w-3 h-3" />
                            {p.status}
                          </span>
                          {typeof p.progressPercentage === "number" && (
                            <span className="text-xs text-gray-500">
                              • {p.progressPercentage}% done
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-700 mt-1 flex flex-wrap gap-3">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {p.customerName || p.customerEmail || "Customer"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            {p.vehicleMake} {p.vehicleModel}
                            {p.vehicleYear ? ` (${p.vehicleYear})` : ""}{" "}
                            {p.vehicleRegistrationNumber ? `• ${p.vehicleRegistrationNumber}` : ""}
                          </span>
                        </div>

                        {p.description && (
                          <div className="text-sm text-gray-600 mt-2 whitespace-pre-line line-clamp-3">
                            {p.description}
                          </div>
                        )}
                      </div>

                      {/* Action buttons placeholder (start, hold, complete) */}
                      <div className="flex flex-col gap-2 shrink-0 text-sm">
                        {/* Example: implement with updateProjectStatus(id, { status: "IN_PROGRESS", notes: "..." }) */}
                        <span className="text-gray-400 italic">Actions coming soon</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjects;