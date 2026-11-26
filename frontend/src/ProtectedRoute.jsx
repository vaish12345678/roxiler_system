
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "./services/api";

const ProtectedRoute = ({ allowedRoles }) => {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await api.get("/auth/me");

        if (!active) return;

        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setStatus("authenticated");
      } catch (error) {
        if (!active) return;

        localStorage.removeItem("user");
        setStatus("unauthenticated");
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking session...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
