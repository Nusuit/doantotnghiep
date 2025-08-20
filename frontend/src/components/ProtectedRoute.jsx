import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

// Component bảo vệ route, chỉ render element nếu đã đăng nhập
const ProtectedRoute = ({ element }) => {
    const { isAuthenticated } = useContext(AuthContext);
    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển hướng về /login
        return <Navigate to="/login" replace />;
    }
    return element;
};

export default ProtectedRoute; 