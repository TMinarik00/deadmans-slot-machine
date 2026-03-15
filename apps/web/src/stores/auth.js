// Pinia auth store - manages user state, login/register/logout actions.
// This is the single source of truth for "is the user logged in?"
// Components read from here; they never call the API directly for auth.

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api, setTokens, clearTokens, getAccessToken } from "../lib/api.js";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);

  // Actions
  async function register(email, username, password) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/auth/register", { email, username, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setTokens(data.accessToken, null);
      user.value = data.user;
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function login(email, password) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setTokens(data.accessToken, data.refreshToken);
      user.value = data.user;
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // Even if the API call fails, clear local state
    }
    clearTokens();
    user.value = null;
  }

  async function fetchMe() {
    if (!getAccessToken()) return;
    try {
      const res = await api.get("/me");
      if (res.ok) {
        const data = await res.json();
        user.value = data.user;
      } else {
        clearTokens();
        user.value = null;
      }
    } catch {
      user.value = null;
    }
  }

  async function forgotPassword(email) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.json();
  }

  async function resetPassword(token, password) {
    const res = await api.post("/auth/reset-password", { token, password });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reset failed");
    return data;
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    fetchMe,
    forgotPassword,
    resetPassword,
  };
});
