<script lang="ts">
  import { page } from '$app/stores';

  const navItems = [
    { href: '/overview', label: 'Executive Overview', icon: 'dashboard' },
    { href: '/chat', label: 'Chat & AI Metrics', icon: 'chat' },
    { href: '/knowledge', label: 'Knowledge Hub', icon: 'knowledge' },
    { href: '/integrations', label: 'Integrationen', icon: 'integrations' },
    { href: '/performance', label: 'Performance & Errors', icon: 'performance' },
    { href: '/users', label: 'User Journey', icon: 'users' },
  ];

  const iconPaths: Record<string, string> = {
    dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    chat: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',
    knowledge: 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
    integrations: 'M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z',
    performance: 'M19.88 18.47c.44-.7.7-1.51.7-2.39 0-2.49-2.01-4.5-4.5-4.5s-4.5 2.01-4.5 4.5 2.01 4.5 4.5 4.5c.88 0 1.69-.26 2.39-.7L21.58 23 23 21.58l-3.12-3.11zm-3.8.11c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm-.36-8.5c-.74.02-1.45.18-2.1.45l-.55-.83-3.8 6.18-3.01-3.52-3.63 5.81L1 17l5-8 3 3.5L13 6l2.72 4.08zm2.59.5c-.64-.28-1.33-.45-2.05-.49L21.38 2 23 3.18l-4.69 7.4z',
    users: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  };

  $: currentPath = $page.url.pathname;
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <a href="/overview" class="logo-link">
      <img src="/MomentumTeam-hor.png" alt="Momentum Team" class="logo" />
    </a>
    <h1 class="sidebar-title">Analytics Dashboard</h1>
  </div>

  <nav class="sidebar-nav">
    <span class="nav-section-title">Dashboards</span>
    {#each navItems as item}
      <a
        href={item.href}
        class="nav-item"
        class:active={currentPath === item.href}
      >
        <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d={iconPaths[item.icon]} />
        </svg>
        <span class="nav-label">{item.label}</span>
      </a>
    {/each}
  </nav>

  <div class="sidebar-footer">
    <div class="data-info">
      <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
      <span>Demo-Daten</span>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 260px;
    min-width: 260px;
    height: 100vh;
    position: sticky;
    top: 0;
    background: linear-gradient(180deg, #FDFBFF 0%, #F8F5FC 50%, #F4F7FA 100%);
    border-right: 1px solid rgba(86, 14, 138, 0.08);
    padding: 24px 16px;
    overflow-y: auto;
  }

  .sidebar-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 24px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(86, 14, 138, 0.08);
  }

  .logo-link {
    text-decoration: none;
  }

  .logo {
    width: 100%;
    max-width: 180px;
    height: auto;
  }

  .sidebar-title {
    font-family: 'Overpass', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #001B41);
    margin: 0;
    letter-spacing: 0.3px;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .nav-section-title {
    font-family: 'Open Sans', sans-serif;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-muted, #97A3B4);
    padding: 16px 12px 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .nav-item:hover {
    background: rgba(86, 14, 138, 0.06);
  }

  .nav-item.active {
    background: var(--white, #FFFFFF);
    box-shadow: 0 2px 12px rgba(0, 27, 65, 0.08);
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    color: var(--text-secondary, #718095);
    flex-shrink: 0;
  }

  .nav-item.active .nav-icon {
    color: var(--primary-purple, #560E8A);
  }

  .nav-label {
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary, #001B41);
  }

  .nav-item.active .nav-label {
    font-weight: 600;
    color: var(--primary-purple, #560E8A);
  }

  .sidebar-footer {
    padding-top: 16px;
    border-top: 1px solid rgba(86, 14, 138, 0.08);
    margin-top: auto;
  }

  .data-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    color: var(--text-muted, #97A3B4);
    padding: 8px 12px;
  }

  .info-icon {
    width: 14px;
    height: 14px;
  }
</style>
