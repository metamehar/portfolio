/* ==========================================================================
   FAISAL — Service Choice Modal + Footer Link Handler
   - Footer service links open a choice modal on desktop
   - On mobile, skip the choice and go directly to contact.html?service=...
   - "Explore with AI Agent" → opens service.html?s=... (full-page AI chat)
   - "Go to Contact" → opens contact.html?service=... (pre-fills Subject)
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_CHOICE_LOADED__) return
  window.__FAISAL_CHOICE_LOADED__ = true

  // Service metadata (icon, description, color)
  const SERVICES = {
    'seo': {
      name: 'SEO & Digital Marketing',
      short: 'SEO',
      icon: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9s2.01-5 4.5-5 4.5 2.01 4.5 5-2.01 5-4.5 5z"/></svg>',
      desc: 'Technical SEO, keyword strategy, link-building — rank higher on Google',
    },
    'wordpress': {
      name: 'WordPress Web Design',
      short: 'WordPress',
      icon: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>',
      desc: 'Fast, secure, conversion-focused WordPress sites built with clean code',
    },
    'canva': {
      name: 'Canva Graphic Design',
      short: 'Canva Design',
      icon: '<svg viewBox="0 0 24 24"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/></svg>',
      desc: 'Social media posts, ad creatives, presentations, marketing collateral',
    },
    'brand': {
      name: 'Brand Identity Systems',
      short: 'Brand Identity',
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5 9.5 9.75 12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>',
      desc: 'Logos, color palettes, typography, visual guidelines — memorable brands',
    },
  }

  // Detect service from a text label (handles the footer link text)
  function detectService(text) {
    const t = text.toLowerCase()
    if (t.indexOf('seo') !== -1) return 'seo'
    if (t.indexOf('wordpress') !== -1) return 'wordpress'
    if (t.indexOf('canva') !== -1) return 'canva'
    if (t.indexOf('brand') !== -1) return 'brand'
    return null
  }

  // Check if we're on mobile
  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches
  }

  // SVG icons for the choice cards
  const AI_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2L9.91 8.91 3 11l6.91 2.09L12 20l2.09-6.91L21 11l-6.91-2.09z"/></svg>'
  const CONTACT_ICON = '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5z"/></svg>'
  const ARROW_ICON = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>'
  const CLOSE_ICON = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'

  // Build the choice modal
  function buildModal() {
    const overlay = document.createElement('div')
    overlay.className = 'fa-choice-overlay'
    overlay.id = 'fa-choice-overlay'
    overlay.innerHTML = `
      <div class="fa-choice-modal" role="dialog" aria-label="Choose how to explore this service">
        <div class="fa-choice-header">
          <button class="fa-choice-close" aria-label="Close">${CLOSE_ICON}</button>
          <div class="fa-choice-service-icon" id="fa-choice-svc-icon"></div>
          <h3 class="fa-choice-title" id="fa-choice-svc-title">Service Name</h3>
          <p class="fa-choice-subtitle" id="fa-choice-svc-desc">Service description</p>
        </div>
        <div class="fa-choice-body">
          <a class="fa-choice-card" id="fa-choice-ai" href="#">
            <div class="fa-choice-card-icon ai">${AI_ICON}</div>
            <div class="fa-choice-card-text">
              <h4 class="fa-choice-card-title">Explore with AI Agent</h4>
              <p class="fa-choice-card-desc">Chat with Mehar — get a full breakdown, ask questions, and learn everything interactively</p>
            </div>
            <div class="fa-choice-card-arrow">${ARROW_ICON}</div>
          </a>
          <a class="fa-choice-card" id="fa-choice-contact" href="#">
            <div class="fa-choice-card-icon contact">${CONTACT_ICON}</div>
            <div class="fa-choice-card-text">
              <h4 class="fa-choice-card-title">Go to Contact Page</h4>
              <p class="fa-choice-card-desc">Jump straight to the contact form with this service pre-filled in the Subject</p>
            </div>
            <div class="fa-choice-card-arrow">${ARROW_ICON}</div>
          </a>
        </div>
      </div>
    `

    // Wire up close
    overlay.querySelector('.fa-choice-close').addEventListener('click', closeChoice)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeChoice()
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeChoice()
    })

    return overlay
  }

  let modalEl = null

  function openChoice(serviceKey) {
    const svc = SERVICES[serviceKey]
    if (!svc) return

    if (!modalEl) {
      modalEl = buildModal()
      document.body.appendChild(modalEl)
    }

    // Populate the modal with service info
    modalEl.querySelector('#fa-choice-svc-icon').innerHTML = svc.icon
    modalEl.querySelector('#fa-choice-svc-title').textContent = svc.name
    modalEl.querySelector('#fa-choice-svc-desc').textContent = svc.desc

    // Wire up the two choice cards
    const aiCard = modalEl.querySelector('#fa-choice-ai')
    const contactCard = modalEl.querySelector('#fa-choice-contact')

    // AI Agent → opens service.html in a NEW TAB
    aiCard.href = '/service.html?s=' + serviceKey
    aiCard.target = '_blank'
    aiCard.rel = 'noopener'

    // Contact → goes to contact.html with service pre-filled (same tab)
    contactCard.href = '/contact.html?service=' + encodeURIComponent(svc.name)

    // Show the modal
    modalEl.classList.add('is-open')
    document.body.style.overflow = 'hidden'
  }

  function closeChoice() {
    if (!modalEl) return
    modalEl.classList.remove('is-open')
    document.body.style.overflow = ''
  }

  // Handle footer service link clicks
  function handleServiceClick(e, linkEl) {
    const text = linkEl.textContent.trim()
    const serviceKey = detectService(text)
    if (!serviceKey) return // not a service link, let it navigate normally

    e.preventDefault()

    if (isMobile()) {
      // Mobile: skip the choice, go directly to contact with service pre-filled
      const svc = SERVICES[serviceKey]
      window.location.href = '/contact.html?service=' + encodeURIComponent(svc.name)
    } else {
      // Desktop: open the choice modal
      openChoice(serviceKey)
    }
  }

  // Wire up all footer service links
  function init() {
    // Target the footer "Services" column links
    const footerServiceLinks = document.querySelectorAll('#footer-col-products .footer-link, .footer-col:nth-child(3) .footer-link')

    // Also catch any link whose text matches a service name (fallback)
    const allFooterLinks = document.querySelectorAll('.footer-link')

    allFooterLinks.forEach(function (link) {
      const text = link.textContent.trim()
      if (detectService(text)) {
        link.style.cursor = 'pointer'
        link.addEventListener('click', function (e) {
          handleServiceClick(e, link)
        })
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Expose for external use
  window.openServiceChoice = openChoice
})()
