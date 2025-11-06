import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ProtectedRoute from "./pages/ProtectedRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Employee Dashboard ..*/}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Dashboard */}
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Optional fallback route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;