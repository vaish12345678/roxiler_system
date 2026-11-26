
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminStores from "./pages/AdminStores";

import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import UserDashboard from "./pages/UserDashboard";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/stores" element={<AdminStores />} />
        </Route>

        {/* Normal User Routes */}
        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route path="/user" element={<UserDashboard />} />
        </Route>

        {/* Store Owner Routes */}
        <Route element={<ProtectedRoute allowedRoles={["STORE_OWNER"]} />}>
          <Route path="/store-owner" element={<StoreOwnerDashboard />} />
        </Route>

        {/* Change Password - User and Store Owner */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["USER", "STORE_OWNER"]} />
          }
        >
          <Route
            path="/change-password"
            element={<ChangePassword />}
          />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
