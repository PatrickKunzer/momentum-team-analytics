<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/overview');
  });
</script>

<div class="redirect">
  <p>Weiterleitung zum Dashboard...</p>
</div>

<style>
  .redirect {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: 'Open Sans', sans-serif;
    color: #718095;
  }
</style>
