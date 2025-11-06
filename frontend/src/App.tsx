import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProtectedRoute from "./pages/ProtectedRoute";
import { AdminLayout, CustomerLayout, EmployeeLayout } from "./components/layouts";
import Login from "./components/auth/LoginForm";
import Register from "./components/auth/RegisterForm";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import AppointmentsManagement from "./pages/Admin/AppointmentsManagement";
import VehiclesManagement from "./pages/Admin/VehiclesManagement";
import ServicesManagement from "./pages/Admin/ServicesManagement";
import Reports from "./pages/Admin/Reports";
import Settings from "./pages/Admin/Settings";
import ProjectsManagement from "./pages/Admin/ProjectsManagement";

// Customer Pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import MyAppointments from "./pages/Customer/MyAppointments";
import MyVehicles from "./pages/Customer/MyVehicles";
import MyProjects from "./pages/Customer/MyProjects";
import ServiceHistory from "./pages/Customer/ServiceHistory";
import ChatSupport from "./pages/Customer/ChatSupport";
import Profile from "./pages/Customer/Profile";

// Employee Pages
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import MyAssignments from "./pages/Employee/MyAssignments";
import ActiveProjects from "./pages/Employee/ActiveProjects";
import TimeLogs from "./pages/Employee/TimeLogs";
import Tasks from "./pages/Employee/Tasks";
import Services from "./pages/Employee/Services";
import EmployeeProfile from "./pages/Employee/EmployeeProfile";

// Component to conditionally render Navbar
const ConditionalNavbar: React.FC = () => {
  const location = useLocation();
  
  // Hide navbar on dashboard routes
  const hiddenRoutes = [
    '/admin-dashboard',
    '/employee-dashboard',
    '/customer-dashboard',
  ];
  
  const shouldHideNavbar = hiddenRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  return shouldHideNavbar ? null : <Navbar />;
};

const App: React.FC = () => {
  return (
    
    <AuthProvider>
      <Router>
        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* public login route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Admin Routes with Layout */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="appointments" element={<AppointmentsManagement />} />
            <Route path="vehicles" element={<VehiclesManagement />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="/admin-dashboard/projects" element={<ProjectsManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Employee Routes with Layout */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="assignments" element={<MyAssignments />} />
            <Route path="projects" element={<ActiveProjects />} />
            <Route path="timelogs" element={<TimeLogs />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="services" element={<Services />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>

          {/* Customer Routes with Layout */}
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="vehicles" element={<MyVehicles />} />
            <Route path="projects" element={<MyProjects />} />
            <Route path="history" element={<ServiceHistory />} />
            <Route path="chat" element={<ChatSupport />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Optional fallback route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;