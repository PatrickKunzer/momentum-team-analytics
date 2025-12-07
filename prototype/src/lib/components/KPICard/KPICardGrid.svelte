<script lang="ts">
  export let columns: 2 | 3 | 4 | 6 = 3;
</script>

<div class="kpi-grid" style="--columns: {columns}">
  <slot />
</div>

<style>
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 16px;
    width: 100%;
  }

  @media (max-width: 1200px) {
    .kpi-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .kpi-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
