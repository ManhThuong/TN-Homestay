import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin_info");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    localStorage.setItem("admin_token", res.data.token);
    localStorage.setItem("admin_info", JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data.admin;
  }

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");
    setAdmin(null);
  }

  const isAuthenticated = !!admin && !!localStorage.getItem("admin_token");

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
