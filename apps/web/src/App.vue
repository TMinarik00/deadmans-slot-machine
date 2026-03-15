<!--
  Root component. Just renders whatever route is active.
  Layouts (AuthLayout, DefaultLayout) will be added in Cycle 1.
-->
<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from "vue-router";
</script>
