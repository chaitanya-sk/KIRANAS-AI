import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("kiranas_token") || "");
  const [loading, setLoading] = useState(true);

  // Check current session
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("kiranas_token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        setToken(savedToken);
      } catch (err) {
        console.warn("Session expired or invalid token:", err.message);
        localStorage.removeItem("kiranas_token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem("kiranas_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post("/auth/register", userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem("kiranas_token", receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const setSession = (newToken, newUser) => {
    localStorage.setItem("kiranas_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout endpoint notice:", err.message);
    } finally {
      localStorage.removeItem("kiranas_token");
      setToken("");
      setUser(null);
    }
  };

  // Quick 1-click Demo Login
  const demoLogin = async () => {
    try {
      return await login("shopkeeper@kiranas.in", "kirana123");
    } catch {
      return await login("demo@kiranas.in", "demo123");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, setSession, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
