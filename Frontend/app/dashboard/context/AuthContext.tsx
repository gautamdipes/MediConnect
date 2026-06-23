"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { setAuthToken } from "@/lib/proxy";
import { clearAuthCookies } from "@/lib/cookies";

// Define user type
export type User = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  dob?: string;
};

// Context shape
export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialise auth state from localStorage only
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedToken) {
      setAuthToken(storedToken);
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
    setAuthToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    clearAuthCookies();
    setAuthToken(null);
  };

  const setUserHelper = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("authUser", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser: setUserHelper }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthContextProvider");
  }
  return context;
};
