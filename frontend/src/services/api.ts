import axios from "axios";
import { User, UserInput } from "../types/user";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mejorar el interceptor para evitar redirecciones innecesarias al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir al login cuando es un error de autenticación específico del API principal
    // y la URL no es una solicitud al servicio ML
    if (
      error.response?.status === 401 &&
      error.config?.baseURL === import.meta.env.VITE_API_URL &&
      !error.config?.url?.includes("/ml/")
    ) {
      console.log("Error de autenticación, redirigiendo al login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const userService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    console.log("response", response);
    const { token } = response.data.authorization;
    localStorage.setItem("token", token);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get("/users");
      // Manejar tanto el caso en que la API devuelve {users: [...]} como cuando devuelve directamente un array
      return response.data.users || response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  getUser: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      // Manejar tanto el caso en que la API devuelve {user: {...}} como cuando devuelve directamente un objeto
      return response.data.user || response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  createUser: async (user: UserInput): Promise<User> => {
    try {
      const response = await api.post("/users", user);
      return response.data.user || response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (id: number, user: Partial<UserInput>): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, user);
      return response.data.user || response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },
};
