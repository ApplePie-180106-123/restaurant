// src/components/PrivateRoute.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * <PrivateRoute roles={['admin']}> <AddMenuItem/> </PrivateRoute>
 *
 * - If not logged in -> redirect to /login with state { from: location.pathname }
 * - If logged in but doesn't have required role -> show unauthorized or redirect
 */
const PrivateRoute = ({ children, roles = [] }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        // not authenticated
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        // authenticated but not authorized
        // you can redirect to home or render a custom Unauthorized component
        return <Navigate to="/" replace />;
        // OR:
        // return <div className="p-6 text-center">Unauthorized — you do not have permission to view this.</div>;
    }

    return children;
};

export default PrivateRoute;
