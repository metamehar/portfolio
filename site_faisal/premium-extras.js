/* ==========================================================================
   FAISAL — Bonus Premium Enhancements (client logic) — v2
   - Reading progress bar (scroll-driven gradient bar at top of viewport)
   - REAL visitor social-proof badge (polls /api/visitors for actual count;
     only shows when 2+ people are genuinely viewing the site)
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_EXTRAS_LOADED__) return
  window.__FAISAL_EXTRAS_LOADED__ = true

  // ----- Reading progress bar -----
  function initProgressBar() {
    const bar = document.createElement('div')
    bar.className = 'fa-progress-bar'
    bar.id = 'fa-progress-bar'
    document.body.appendChild(bar)

    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight =
        (document.documentElement.scrollHeight - window.innerHeight) || 1
      const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100))
      bar.style.width = pct + '%'
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
  }

  // ----- REAL visitor social-proof badge -----
  // Gets or creates a per-session visitor ID (stored in sessionStorage so
  // the same browser counts as one visitor across page navigations, but
  // doesn't persist long-term like a cookie).
  function getVisitorId() {
    try {
      let id = sessionStorage.getItem('faisal_visitor_id')
      if (!id) {
        id = 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10)
        sessionStorage.setItem('faisal_visitor_id', id)
      }
      return id
    } catch (_) {
      return 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10)
    }
  }

  // Send a heartbeat to the server so this visitor is counted
  async function sendHeartbeat() {
    try {
      await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: getVisitorId() }),
      })
    } catch (_) {}
  }

  // Poll the real visitor count and show the badge ONLY when 2+ people
  // are genuinely viewing the site.
  function initSocialProof() {
    // Skip on mobile (would clash with bottom nav + assistant launcher)
    if (window.matchMedia('(max-width: 768px)').matches) return

    const badge = document.createElement('div')
    badge.className = 'fa-social-proof'
    badge.id = 'fa-social-proof'
    badge.innerHTML = `
      <div class="fa-social-proof-dot"></div>
      <div class="fa-social-proof-text" id="fa-proof-text"></div>
      <button class="fa-social-proof-close" aria-label="Dismiss notification">×</button>
    `
    badge.style.display = 'none' // hidden until we have real data
    document.body.appendChild(badge)

    const textEl = badge.querySelector('#fa-proof-text')
    const closeBtn = badge.querySelector('.fa-social-proof-close')
    let dismissed = false
    let lastCount = 0
    let shownAt = 0

    // Build an honest message based on the REAL other-visitor count
    // (otherCount = total visitors MINUS the current visitor)
    function buildMessage(otherCount) {
      if (otherCount <= 0) {
        // No other visitors — don't show the badge at all
        return null
      }
      if (otherCount === 1) {
        return '<strong>1 other person</strong> is browsing FAISAL\'s portfolio right now'
      }
      if (otherCount <= 4) {
        return '<strong>' + otherCount + ' other people</strong> are browsing FAISAL\'s portfolio right now'
      }
      return '<strong>' + otherCount + ' people</strong> are viewing FAISAL\'s portfolio right now'
    }

    function showBadge(msg) {
      if (dismissed || !msg) return
      textEl.innerHTML = msg
      badge.style.display = 'flex'
      // Force reflow then add the visible class for transition
      void badge.offsetWidth
      badge.classList.add('is-visible')
      badge.classList.remove('is-hidden')
      shownAt = Date.now()
    }

    function hideBadge() {
      badge.classList.remove('is-visible')
      badge.classList.add('is-hidden')
    }

    // Poll every 15 seconds — pass our visitorId so the server can EXCLUDE us
    // from the count and return only OTHER visitors (honest "who else is here")
    async function poll() {
      if (dismissed) return
      try {
        const myId = getVisitorId()
        const res = await fetch('/api/visitors?exclude=' + encodeURIComponent(myId), { method: 'GET' })
        const data = await res.json()
        if (!data || !data.success) return

        // Use otherCount (visitors excluding us) for the honest message
        const otherCount = data.otherCount !== undefined ? data.otherCount : Math.max(0, (data.count || 0) - 1)
        const msg = buildMessage(otherCount)

        if (msg) {
          // If badge is currently hidden or showing a different count, update it
          const currentlyVisible = badge.classList.contains('is-visible')
          if (!currentlyVisible) {
            // Show after a short delay so it feels natural
            setTimeout(function () { showBadge(msg) }, 1500)
          } else if (textEl.innerHTML.indexOf(msg) === -1) {
            // Update the text in place
            textEl.innerHTML = msg
          }
          // Auto-hide after 6 seconds, then wait 10 seconds before re-showing
          if (shownAt && Date.now() - shownAt > 6000) {
            hideBadge()
            shownAt = 0
          }
        } else {
          // Not enough visitors — hide the badge
          hideBadge()
        }
      } catch (_) {}
    }

    // Send heartbeat immediately, then every 30 seconds
    sendHeartbeat()
    setInterval(sendHeartbeat, 30000)

    // Poll after 3 seconds (give time for heartbeat to register), then every 15s
    setTimeout(poll, 3000)
    setInterval(poll, 15000)

    // Click badge → go to contact
    badge.addEventListener('click', function (e) {
      if (e.target === closeBtn) return
      window.location.href = '/contact.html'
    })

    // Dismiss button
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation()
      dismissed = true
      hideBadge()
      setTimeout(function () {
        badge.style.display = 'none'
      }, 500)
    })
  }

  function init() {
    initProgressBar()
    initSocialProof()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
