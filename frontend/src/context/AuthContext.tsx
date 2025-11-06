import React, { createContext, useState, ReactNode, useEffect } from "react";
import { UserDto, logout as apiLogout } from "../api/auth";

interface AuthContextType {
  token: string | null;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN" | null;
  user: UserDto | null;
  isFirstLogin: boolean | null;
  login: (
    token: string,
    role: "CUSTOMER" | "EMPLOYEE" | "ADMIN",
    isFirstLogin?: boolean
  ) => void;
  logout: () => void;
  setUser: (user: UserDto | null) => void;
  setIsFirstLogin: (isFirstLogin: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<AuthContextType["role"]>(
    localStorage.getItem("role") as AuthContextType["role"]
  );
  const [user, setUser] = useState<UserDto | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(
    localStorage.getItem("isFirstLogin") === "true"
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }

    if (isFirstLogin !== null) {
      localStorage.setItem("isFirstLogin", String(isFirstLogin));
    } else {
      localStorage.removeItem("isFirstLogin");
    }
  }, [token, role, isFirstLogin]);

  const login = (
    jwt: string,
    userRole: AuthContextType["role"],
    firstLogin?: boolean
  ) => {
    setToken(jwt);
    setRole(userRole);
    if (firstLogin !== undefined) {
      setIsFirstLogin(firstLogin);
    }
  };

  const logout = async () => {
    try {
      // Call logout API (optional - server may not need to do anything)
      await apiLogout();
    } catch (error) {
      // Ignore errors - still clear local state
      console.error("Logout API error:", error);
    } finally {
      // Always clear local state
      setToken(null);
      setRole(null);
      setUser(null);
      setIsFirstLogin(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("isFirstLogin");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        isFirstLogin,
        login,
        logout,
        setUser,
        setIsFirstLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};