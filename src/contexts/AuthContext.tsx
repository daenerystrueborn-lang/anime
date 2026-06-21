import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiFetch } from "../lib/api";

export interface User {
  id: number;
  username: string;
  email: string;
  pfp?: string;
}

export interface LibraryEntry {
  mediaId: string;
  mediaType: string;
  status: "Watching" | "Reading" | "Completed" | "Dropped";
  title: string;
  coverImage?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  library: LibraryEntry[];
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  updateLibrary: (mediaId: string, mediaType: string, status: string, title: string, coverImage?: string) => Promise<void>;
  removeFromLibrary: (mediaId: string, mediaType: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<User>("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  const refreshLibrary = useCallback(async () => {
    try {
      const data = await apiFetch<LibraryEntry[]>("/api/auth/library");
      setLibrary(data);
    } catch {
      setLibrary([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      refreshLibrary();
    } else {
      setLibrary([]);
    }
  }, [user, refreshLibrary]);

  const login = async (email: string, password: string) => {
    await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await refreshUser();
  };

  const register = async (username: string, email: string, password: string) => {
    await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    await refreshUser();
  };

  const logout = () => {
    setUser(null);
    setLibrary([]);
  };

  const updateLibrary = async (
    mediaId: string,
    mediaType: string,
    status: string,
    title: string,
    coverImage?: string
  ) => {
    await apiFetch(`/api/auth/library/${mediaType}/${mediaId}`, {
      method: "POST",
      body: JSON.stringify({ status, title, coverImage }),
    });
    await refreshLibrary();
  };

  const removeFromLibrary = async (mediaId: string, mediaType: string) => {
    await apiFetch(`/api/auth/library/${mediaType}/${mediaId}`, {
      method: "DELETE",
    });
    await refreshLibrary();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        library,
        login,
        register,
        logout,
        refreshUser,
        refreshLibrary,
        updateLibrary,
        removeFromLibrary,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
