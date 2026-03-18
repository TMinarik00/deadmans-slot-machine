// Vue Router configuration with auth route guards.
//
// Route guards enforce:
//   - Unauthenticated users are redirected to /login
//   - Authenticated users on auth pages are redirected to /app
//   - On first load, we try to restore the session via /me

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

import AuthLayout from "../layouts/AuthLayout.vue";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";
import ResetPasswordView from "../views/ResetPasswordView.vue";
import GameView from "../views/GameView.vue";
import WalletView from "../views/WalletView.vue";
import ProfileView from "../views/ProfileView.vue";
import LeaderboardView from "../views/LeaderboardView.vue";
import AchievementsView from "../views/AchievementsView.vue";

const routes = [
  // Auth routes (no navbar)
  {
    path: "/",
    component: AuthLayout,
    meta: { guest: true },
    children: [
      { path: "", redirect: "/login" },
      { path: "login", name: "login", component: LoginView },
      { path: "register", name: "register", component: RegisterView },
      { path: "forgot-password", name: "forgot-password", component: ForgotPasswordView },
      { path: "reset-password", name: "reset-password", component: ResetPasswordView },
    ],
  },
  // App routes (with navbar, requires auth)
  {
    path: "/app",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "game", component: GameView },
      { path: "wallet", name: "wallet", component: WalletView },
      { path: "profile", name: "profile", component: ProfileView },
      { path: "achievements", name: "achievements", component: AchievementsView },
      { path: "leaderboard", name: "leaderboard", component: LeaderboardView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Track if we've tried to restore the session on first load
let sessionChecked = false;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // On first navigation, try to restore session from stored token
  if (!sessionChecked) {
    sessionChecked = true;
    await authStore.fetchMe();
  }

  const isAuthenticated = authStore.isAuthenticated;

  // If route requires auth and user isn't logged in -> redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: "login" };
  }

  // If route is for guests only and user is logged in -> redirect to app
  if (to.meta.guest && isAuthenticated) {
    return { name: "game" };
  }
});

export default router;
