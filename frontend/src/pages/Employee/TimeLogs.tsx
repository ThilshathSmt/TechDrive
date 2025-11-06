import React, { useState, useEffect } from "react";
import { Clock, Plus, Edit, Trash2, X, Calendar, Timer } from "lucide-react";
import axios from "axios";

interface TimeLog {
  id: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  workDescription: string;
  notes: string;
  projectId: number | null;
  projectName: string | null;
  appointmentId: number | null;
  appointmentDescription: string | null;
  createdAt: string;
}

interface TimeLogFormData {
  workDate: string;
  startTime: string;
  endTime: string;
  projectId: string;
  appointmentId: string;
  workDescription: string;
  notes: string;
}

const TimeLogs: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [formData, setFormData] = useState<TimeLogFormData>({
    workDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    projectId: "",
    appointmentId: "",
    workDescription: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TimeLogFormData, string>>>({});

  useEffect(() => {
    fetchTimeLogs();
    fetchProjects();
    fetchAppointments();
  }, []);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/employee/timelogs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTimeLogs(response.data);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      alert("Failed to fetch time logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/employee/projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/employee/appointments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Calculate stats
  const totalHours = timeLogs.reduce((sum, log) => sum + log.durationMinutes / 60, 0);
  
  const thisWeekHours = timeLogs
    .filter((log) => {
      const logDate = new Date(log.startTime);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      return logDate >= weekStart;
    })
    .reduce((sum, log) => sum + log.durationMinutes / 60, 0);

  const todayHours = timeLogs
    .filter((log) => {
      const logDate = new Date(log.startTime).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
    })
    .reduce((sum, log) => sum + log.durationMinutes / 60, 0);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TimeLogFormData, string>> = {};

    if (!formData.workDate) {
      newErrors.workDate = "Work date is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    
    // Validate that end time is after start time
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.workDate}T${formData.startTime}`);
      const end = new Date(`${formData.workDate}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    
    if (!formData.projectId && !formData.appointmentId) {
      newErrors.projectId = "Either Project or Appointment must be selected";
    }
    if (formData.projectId && formData.appointmentId) {
      newErrors.appointmentId = "Cannot select both Project and Appointment";
    }
    if (!formData.workDescription.trim()) {
      newErrors.workDescription = "Work description is required";
    }
    if (formData.workDescription.trim().length < 10) {
      newErrors.workDescription = "Work description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (log?: TimeLog) => {
    if (log) {
      setEditMode(true);
      setSelectedLog(log);
      const startDate = new Date(log.startTime);
      const endDate = new Date(log.endTime);
      setFormData({
        workDate: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        projectId: log.projectId?.toString() || "",
        appointmentId: log.appointmentId?.toString() || "",
        workDescription: log.workDescription,
        notes: log.notes || "",
      });
    } else {
      setEditMode(false);
      setSelectedLog(null);
      setFormData({
        workDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "17:00",
        projectId: "",
        appointmentId: "",
        workDescription: "",
        notes: "",
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedLog(null);
    setFormData({
      workDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      projectId: "",
      appointmentId: "",
      workDescription: "",
      notes: "",
    });
    setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Clear the other option when one is selected
    if (name === "projectId" && value) {
      setFormData((prev) => ({ ...prev, [name]: value, appointmentId: "" }));
    } else if (name === "appointmentId" && value) {
      setFormData((prev) => ({ ...prev, [name]: value, projectId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name as keyof TimeLogFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Create ISO datetime strings
      const startDateTime = new Date(`${formData.workDate}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${formData.workDate}T${formData.endTime}:00`).toISOString();

      const payload: any = {
        startTime: startDateTime,
        endTime: endDateTime,
        workDescription: formData.workDescription,
        notes: formData.notes || null,
      };

      // Add either projectId or appointmentId
      if (formData.projectId) {
        payload.projectId = parseInt(formData.projectId);
      } else if (formData.appointmentId) {
        payload.appointmentId = parseInt(formData.appointmentId);
      }

      if (editMode && selectedLog) {
        // Update
        await axios.put(
          `http://localhost:8080/api/employee/timelogs/${selectedLog.id}`,
          payload,
          { headers }
        );
        alert("Time log updated successfully!");
      } else {
        // Create
        await axios.post(
          "http://localhost:8080/api/employee/timelogs",
          payload,
          { headers }
        );
        alert("Time log added successfully!");
      }
      handleCloseModal();
      fetchTimeLogs();
    } catch (error: any) {
      console.error("Error saving time log:", error);
      alert(error.response?.data || "Failed to save time log");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this time log?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/employee/timelogs/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Time log deleted successfully!");
      fetchTimeLogs();
    } catch (error) {
      console.error("Error deleting time log:", error);
      alert("Failed to delete time log");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Logs</h1>
          <p className="text-gray-600 mt-1">Track your work hours</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Log Time
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalHours.toFixed(1)}h
              </p>
            </div>
            <Clock className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {thisWeekHours.toFixed(1)}h
              </p>
            </div>
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayHours.toFixed(1)}h
              </p>
            </div>
            <Clock className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Time Logs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading time logs...</p>
          </div>
        ) : timeLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No time logs yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Log your first work hours
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project/Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div>{new Date(log.startTime).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(log.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.projectName || log.appointmentDescription || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.workDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-purple-600">
                          {(log.durationMinutes / 60).toFixed(1)}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {log.notes || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(log)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? "Edit Time Log" : "Add Time Log"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Work Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="workDate"
                  value={formData.workDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.workDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.workDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.workDate}</p>
                )}
              </div>

              {/* Start Time & End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.startTime ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.endTime ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project (Active Projects)
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.projectId ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={!!formData.appointmentId}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName || `Project #${project.id}`}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-red-500 text-xs mt-1">{errors.projectId}</p>
                )}
              </div>

              {/* Appointment Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment (My Assignments)
                </label>
                <select
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.appointmentId ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={!!formData.projectId}
                >
                  <option value="">-- Select Appointment --</option>
                  {appointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.vehicle?.registrationNumber 
                        ? `${appointment.vehicle.registrationNumber} - ${appointment.appointmentDate}`
                        : `Appointment #${appointment.id}`}
                    </option>
                  ))}
                </select>
                {errors.appointmentId && (
                  <p className="text-red-500 text-xs mt-1">{errors.appointmentId}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  * Either Project or Appointment must be selected (not both)
                </p>
              </div>

              {/* Work Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="workDescription"
                  value={formData.workDescription}
                  onChange={handleChange}
                  placeholder="Describe what you worked on (min 10 characters)..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.workDescription ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.workDescription && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.workDescription}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editMode ? "Update" : "Add"} Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeLogs;
