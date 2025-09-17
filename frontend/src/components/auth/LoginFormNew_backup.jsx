// Login form backup
import { useState } from "react";
import { useAuth } from "../../hooks/useAuthNew.jsx";

const LoginForm = ({ onForgotPassword, onNeedVerification }) => {
  const { login, isLoading } = useAuth();

  return (
    <div>
      <p>Test component</p>
    </div>
  );
};

export default LoginForm;
