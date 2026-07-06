/* ==========================================================================
   FAISAL — Premium Mobile Bottom Navigation (v3)
   5-item floating glass nav bar with premium 3D-style gradient icons.
   All 5 pages reachable: Home, Work, About, Blog, Talk.
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_BOTTOM_NAV_LOADED__) return
  window.__FAISAL_BOTTOM_NAV_LOADED__ = true

  // Premium 3D-style filled SVG icons (gradient fills for a polished look)
  const ICONS = {
    home: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fa-ic-home" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f85d80"/><stop offset="100%" stop-color="#b06ab3"/>
      </linearGradient></defs>
      <path fill="url(#fa-ic-home)" d="M12 3l-9 8h2.5v9h5v-6h3v6h5v-9H21z"/>
    </svg>`,
    portfolio: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fa-ic-port" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f85d80"/><stop offset="100%" stop-color="#b06ab3"/>
      </linearGradient></defs>
      <path fill="url(#fa-ic-port)" d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/>
    </svg>`,
    about: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fa-ic-about" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f85d80"/><stop offset="100%" stop-color="#b06ab3"/>
      </linearGradient></defs>
      <circle cx="12" cy="8" r="4" fill="url(#fa-ic-about)"/>
      <path fill="url(#fa-ic-about)" d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6v1H4z"/>
    </svg>`,
    blog: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fa-ic-blog" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f85d80"/><stop offset="100%" stop-color="#b06ab3"/>
      </linearGradient></defs>
      <path fill="url(#fa-ic-blog)" d="M4 4h16v16H4z" opacity="0.3"/>
      <path fill="url(#fa-ic-blog)" d="M6 7h12v1.5H6zm0 4h12v1.5H6zm0 4h8v1.5H6z"/>
    </svg>`,
    contact: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fa-ic-contact" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f85d80"/><stop offset="100%" stop-color="#b06ab3"/>
      </linearGradient></defs>
      <path fill="url(#fa-ic-contact)" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5z"/>
    </svg>`,
  }

  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html'
    if (path === '' || path === 'index.html') return 'home'
    if (path === 'portfolio.html') return 'portfolio'
    if (path === 'blog.html') return 'blog'
    if (path === 'contact.html') return 'contact'
    if (path === 'about.html') return 'about'
    return 'home'
  }

  function buildNav() {
    const current = getCurrentPage()

    const items = [
      { id: 'home', label: 'Home', href: '/index.html', icon: ICONS.home },
      { id: 'portfolio', label: 'Work', href: '/portfolio.html', icon: ICONS.portfolio },
      { id: 'about', label: 'About', href: '/about.html', icon: ICONS.about },
      { id: 'blog', label: 'Blog', href: '/blog.html', icon: ICONS.blog },
      { id: 'contact', label: 'Talk', href: '/contact.html', icon: ICONS.contact },
    ]

    const nav = document.createElement('nav')
    nav.className = 'fa-bottom-nav'
    nav.setAttribute('aria-label', 'Mobile bottom navigation')

    items.forEach(function (item) {
      const a = document.createElement('a')
      a.className = 'fa-bottom-nav-item' + (item.id === current ? ' is-active' : '')
      a.href = item.href
      a.setAttribute('aria-label', item.label)
      a.setAttribute('aria-current', item.id === current ? 'page' : 'false')
      a.innerHTML = item.icon + '<span>' + item.label + '</span>'
      nav.appendChild(a)
    })

    return nav
  }

  function init() {
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.appendChild(buildNav())
    }

    let lastMobile = window.matchMedia('(max-width: 768px)').matches
    window.addEventListener('resize', function () {
      const nowMobile = window.matchMedia('(max-width: 768px)').matches
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile
        const existing = document.querySelector('.fa-bottom-nav')
        if (nowMobile && !existing) {
          document.body.appendChild(buildNav())
        } else if (!nowMobile && existing) {
          existing.remove()
        }
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
