import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Car, Calendar } from "lucide-react";
import {
  getCustomerWithVehicles,
  AdminCustomerWithVehiclesDTO,
} from "../../api/admin";

const AdminCustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AdminCustomerWithVehiclesDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await getCustomerWithVehicles(Number(id));
        setData(res);
      } catch (e: any) {
        setErr(e?.response?.data || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const fullName = useMemo(() => {
    if (!data) return "";
    return data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim();
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin-dashboard/customers"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-gray-600 mt-1">Profile & registered vehicles</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          {loading ? (
            <div>Loading…</div>
          ) : err ? (
            <div className="text-red-600">{err}</div>
          ) : !data ? (
            <div className="text-gray-600">No data</div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white grid place-items-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{fullName || "Unnamed"}</div>
                  <div className="text-sm mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        data.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {data.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                {data.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {data.email}
                  </div>
                )}
                {data.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {data.phoneNumber}
                  </div>
                )}
                {data.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created: {new Date(data.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Vehicles */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Vehicles</h2>
            </div>
          </div>

          {loading ? (
            <div>Loading vehicles…</div>
          ) : err ? (
            <div className="text-red-600">{err}</div>
          ) : !data ? (
            <div className="text-gray-600">No customer</div>
          ) : (data.vehicles?.length || 0) === 0 ? (
            <div className="text-gray-600">No vehicles</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Registration</th>
                    <th className="px-4 py-2 text-left">Make / Model</th>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-left">Color</th>
                    <th className="px-4 py-2 text-left">VIN</th>
                    <th className="px-4 py-2 text-left">Mileage</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.vehicles?.map((v, i) => (
                    <tr key={v.id ?? i} className="bg-white">
                      <td className="px-4 py-2">{v.registrationNumber || "-"}</td>
                      <td className="px-4 py-2">{(v.make || "-") + " " + (v.model || "")}</td>
                      <td className="px-4 py-2">{v.year ?? "-"}</td>
                      <td className="px-4 py-2">{v.color || "-"}</td>
                      <td className="px-4 py-2">{v.vinNumber || "-"}</td>
                      <td className="px-4 py-2">{typeof v.mileage === "number" ? v.mileage : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDetails;