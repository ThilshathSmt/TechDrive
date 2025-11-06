// src/pages/Employee/MyAssignments.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Car, User } from "lucide-react";
import { listAssignedAppointments, } from "../../api/employee";

const MyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listAssignedAppointments();
        setAssignments(data);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = assignments.length;
    const inProgress = assignments.filter(a => a.status === "IN_PROGRESS").length;
    const completedToday = 0; // implement if you track dates
    return { total, inProgress, completedToday };
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600 mt-1">View your assigned appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        ) : err ? (
          <div className="p-12 text-center text-red-600">{err}</div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No assignments yet</p>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {assignments.map((a) => (
                <li key={a.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">
                          #{a.id} • {new Date(a.scheduledDateTime).toLocaleString()}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {a.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {a.customerName || a.customerEmail || "Customer"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {a.vehicleMake} {a.vehicleModel}
                          {a.vehicleYear ? ` (${a.vehicleYear})` : ""}{" "}
                          {a.vehicleRegistrationNumber ? `• ${a.vehicleRegistrationNumber}` : ""}
                        </span>
                      </div>
                      {a.services && a.services.length > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          Services: {a.services.map((s) => s.serviceName).join(", ")}
                        </div>
                      )}
                    </div>
                    {/* Actions (start/complete/etc.) can go here later */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssignments;