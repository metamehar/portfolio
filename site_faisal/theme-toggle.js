/* ==========================================================================
   FAISAL — Theme Toggle (Dark/Light)
   - Dark is default
   - Persists choice in localStorage
   - Applies theme BEFORE first render to prevent flash of wrong theme
   - Toggle button (sun/moon) injected into the header on every page
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_THEME_LOADED__) return
  window.__FAISAL_THEME_LOADED__ = true

  const STORAGE_KEY = 'faisal_theme'
  const DARK = 'dark'
  const LIGHT = 'light'

  // Get saved theme (default: dark)
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DARK
    } catch (_) {
      return DARK
    }
  }

  // Apply theme to <html> element
  function applyTheme(theme) {
    if (theme === LIGHT) {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // Get current theme
  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? LIGHT : DARK
  }

  // Toggle and save
  function toggleTheme() {
    const current = getCurrentTheme()
    const next = current === DARK ? LIGHT : DARK
    applyTheme(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch (_) {}
    updateToggleIcon(next)
  }

  // Update the toggle button icon (sun for dark mode, moon for light mode)
  function updateToggleIcon(theme) {
    const btn = document.getElementById('fa-theme-toggle-btn')
    if (!btn) return
    // The CSS handles showing/hiding the sun/moon icons based on data-theme,
    // so we just need to update the aria-label
    btn.setAttribute('aria-label', theme === DARK ? 'Switch to light theme' : 'Switch to dark theme')
    btn.setAttribute('title', theme === DARK ? 'Light mode' : 'Dark mode')
  }

  // Sun icon SVG (shown in dark mode — click to go light)
  const SUN_SVG = `<svg class="fa-sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>`

  // Moon icon SVG (shown in light mode — click to go dark)
  const MOON_SVG = `<svg class="fa-moon-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`

  // Build the toggle button
  function buildToggle() {
    const btn = document.createElement('button')
    btn.className = 'fa-theme-toggle'
    btn.id = 'fa-theme-toggle-btn'
    btn.type = 'button'
    btn.innerHTML = SUN_SVG + MOON_SVG
    btn.addEventListener('click', toggleTheme)
    updateToggleIcon(getCurrentTheme())
    return btn
  }

  // Inject the toggle into the header-actions on every page
  function injectToggle() {
    // Check if already injected
    if (document.getElementById('fa-theme-toggle-btn')) return

    const headerActions = document.querySelector('.header-actions')
    if (headerActions) {
      // Insert as the FIRST item in header-actions (before Login/Get a Quote buttons)
      headerActions.insertBefore(buildToggle(), headerActions.firstChild)
    } else {
      // Fallback: if no header-actions, inject as a floating button top-right
      const floating = buildToggle()
      floating.style.position = 'fixed'
      floating.style.top = '20px'
      floating.style.right = '20px'
      floating.style.zIndex = '9998'
      document.body.appendChild(floating)
    }
  }

  // Init
  function init() {
    // Apply saved theme immediately (also done in the inline script above
    // to prevent flash, but this is a safety net)
    applyTheme(getSavedTheme())
    injectToggle()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
