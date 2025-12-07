<script lang="ts">
  import '../app.css';
  import { Sidebar } from '$lib/components/Layout';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Overpass:wght@300;400;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="app-layout">
  <Sidebar />
  <main class="main-content">
    <slot />
  </main>
</div>

<style>
  .app-layout {
    display: flex;
    min-height: 100vh;
    background: var(--bg-light, #FAFAFA);
  }

  .main-content {
    flex: 1;
    min-width: 0;
    overflow-x: hidden;
  }
</style>
