// Pinia profile store - manages player profile, achievements, leaderboard, and daily bonus.
// Components read from here; they never call the API directly for profile operations.

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../lib/api.js";

export const useProfileStore = defineStore("profile", () => {
  // State
  const profile = ref(null);
  const achievements = ref([]);
  const leaderboard = ref([]);
  const leaderboardType = ref("totalWon");
  const leaderboardPeriod = ref("allTime");
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const level = computed(() => profile.value?.level ?? 1);
  const xpProgress = computed(() => profile.value?.xpProgress ?? 0);
  const xpNeeded = computed(() => profile.value?.xpNeeded ?? 50);
  const xpPercent = computed(() =>
    xpNeeded.value > 0
      ? Math.min(100, (xpProgress.value / xpNeeded.value) * 100)
      : 0
  );
  const stats = computed(() => profile.value?.stats ?? {});
  const dailyBonus = computed(() => profile.value?.dailyBonus ?? {});
  const canClaimDaily = computed(() => dailyBonus.value?.available ?? false);

  // Actions
  async function fetchProfile() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get("/profile");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load profile");
      profile.value = data.profile;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAchievements() {
    error.value = null;
    try {
      const res = await api.get("/achievements");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load achievements");
      achievements.value = data.achievements;
    } catch (e) {
      error.value = e.message;
    }
  }

  async function fetchLeaderboard(type = "totalWon", period = "allTime") {
    leaderboardType.value = type;
    leaderboardPeriod.value = period;
    error.value = null;
    try {
      const res = await api.get(`/leaderboard?type=${type}&period=${period}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load leaderboard");
      leaderboard.value = data.leaderboard;
    } catch (e) {
      error.value = e.message;
    }
  }

  async function editProfile(payload) {
    error.value = null;
    try {
      const res = await api.post("/profile/edit", payload);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      await fetchProfile();
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteProfile(password) {
    error.value = null;
    try {
      const res = await api.post("/profile/delete", { password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function claimDailyBonus() {
    error.value = null;
    try {
      const res = await api.post("/profile/daily-bonus");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim daily bonus");
      await fetchProfile();
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function claimAchievement(id) {
    error.value = null;
    try {
      const res = await api.post(`/achievements/${id}/claim`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim achievement");
      await Promise.all([fetchAchievements(), fetchProfile()]);
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  // KYC
  const kycStatus = computed(() => profile.value?.kycStatus ?? "NONE");

  async function submitKyc() {
    error.value = null;
    try {
      const res = await api.post("/profile/kyc");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "KYC submission failed");
      // Update local status immediately
      if (profile.value) profile.value.kycStatus = data.kycStatus;
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  return {
    profile,
    achievements,
    leaderboard,
    leaderboardType,
    leaderboardPeriod,
    loading,
    error,
    level,
    xpProgress,
    xpNeeded,
    xpPercent,
    stats,
    dailyBonus,
    canClaimDaily,
    kycStatus,
    fetchProfile,
    fetchAchievements,
    fetchLeaderboard,
    claimDailyBonus,
    claimAchievement,
    editProfile,
    deleteProfile,
    submitKyc,
  };
});
