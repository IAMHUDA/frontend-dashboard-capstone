// src/app/contexts/auth/context.jsx
import { useContext } from "react";
import AuthContext from "./authContext";

// Hook custom untuk mengakses AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext harus digunakan dalam AuthProvider");
  }
  return context;
};
