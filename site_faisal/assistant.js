/* ==========================================================================
   FAISAL — AI Brand Concierge Widget v4 (client logic)
   - Gemini-style gradient spark launcher that morphs into an X when open
   - "New Pro Tip" button generates a fresh random Pro Tip on demand
   - No auto-open (was causing scroll blocking on mobile)
   - Panel closes when clicking outside or pressing Esc
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_ASSISTANT_LOADED__) return
  window.__FAISAL_ASSISTANT_LOADED__ = true

  // ----- SVG icons -----
  // FAISAL's custom AI icon (enhanced 4-pointed star with gradient + glow)
  // Used in the launcher and the panel header avatar
  const AI_ICON_IMG = '<img src="/images/faisal-ai-icon.png" alt="FAISAL AI" style="width:100%;height:100%;object-fit:contain;">'

  const X_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#fff" d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L10.58 13.4 4.29 19.71 2.87 18.29 9.16 12 2.87 5.71 4.29 4.29 10.58 10.6l6.29-6.31z"/>
  </svg>`

  const SEND_SVG = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>'
  const SPARKLE_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2L9.91 8.91 3 11l6.91 2.09L12 20l2.09-6.91L21 11l-6.91-2.09z"/></svg>'
  const CLEAR_SVG = '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm2 3h14v12H5zm3-6h8v2H8z"/></svg>'
  // Back arrow icon — used for the mobile close button (back navigation)
  const BACK_SVG = '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/></svg>'

  // ----- State -----
  const STORAGE_KEY = 'faisal_assistant_history_v2'
  let conversation = []
  let isOpen = false
  let isTyping = false

  // Greeting
  const GREETING =
    "Hi, I'm Mehar — FAISAL's AI Concierge. Ask me about SEO, WordPress, branding, or get an instant project cost estimate."

  // Quick replies
  const QUICK_REPLIES = [
    'Estimate my project cost',
    'Tell me about your SEO services',
    'How fast can you build a WordPress site?',
    'I want to hire FAISAL',
  ]

  // Curated list of Pro Tips (used by the "New Pro Tip" button so the user
  // gets an instant tip without waiting for a full LLM round-trip)
  const PRO_TIP_POOL = [
    'Add your business to Google Business Profile — it\'s free and boosts local SEO in 2 weeks.',
    'Compress images to under 200KB before uploading — page speed directly affects Google rankings.',
    'Pick 3 brand colors and use them everywhere — consistency builds trust faster than any logo.',
    'Ask any freelancer for 2 case studies with real metrics before signing a contract.',
    'Audit your site for broken links monthly — even one can hurt your SEO performance.',
    'Target long-tail keywords with low competition to rank faster and attract warmer leads.',
    'Start with a clear sitemap — it cuts development time by 30%.',
    'Factor in 15% budget for post-launch plugin and theme updates.',
    'Lock scope in writing before kickoff — scope creep is the #1 budget killer.',
    'Use WP Rocket or LiteSpeed Cache — caching alone can cut load time by 60%.',
    'Add alt text to every image — it\'s an easy SEO win and improves accessibility.',
    'Publish 1 blog post per week — consistent content beats sporadic bursts every time.',
    'Claim your brand name on all social platforms — even if you don\'t post yet.',
    'Use a .com domain when possible — it still carries the most trust.',
    'Test your site on real 4G, not just wifi — that\'s how most mobile users experience it.',
    'Add internal links between related blog posts — it keeps visitors on your site longer.',
    'Use schema markup for reviews and FAQs — it can win you rich snippets in Google.',
    'Write meta descriptions under 155 characters — Google truncates the rest.',
    'Update WordPress core and plugins within 7 days of release — security patches matter.',
    'Use a CDN like Cloudflare — it\'s free and speeds up your site globally.',
  ]
  let protipIndex = 0

  // ----- Persistence -----
  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (_) {}
    return []
  }

  function saveHistory() {
    try {
      const trimmed = conversation.slice(-20)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch (_) {}
  }

  // ----- DOM build -----
  function buildLauncher() {
    const btn = document.createElement('button')
    btn.className = 'fa-launcher'
    btn.setAttribute('aria-label', 'Open FAISAL AI assistant')
    btn.innerHTML = `
      <div class="fa-spark">${AI_ICON_IMG}</div>
      <div class="fa-x-icon">${X_SVG}</div>
      <span class="fa-status-dot"></span>
    `
    btn.addEventListener('click', function (e) {
      e.stopPropagation()
      togglePanel()
    })
    return btn
  }

  function buildPanel() {
    const panel = document.createElement('div')
    panel.className = 'fa-panel'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', 'FAISAL AI Brand Concierge')
    panel.innerHTML = `
      <div class="fa-header">
        <div class="fa-avatar" aria-hidden="true">${AI_ICON_IMG}</div>
        <div class="fa-header-info">
          <p class="fa-header-name">Mehar · AI Concierge</p>
          <p class="fa-header-status">Online · replies instantly</p>
        </div>
        <div class="fa-header-controls">
          <button class="fa-icon-btn fa-close-back" id="fa-close-btn" aria-label="Close assistant (back)" title="Close">
            ${BACK_SVG}
          </button>
          <button class="fa-protip-btn" id="fa-protip-btn" aria-label="Get a new Pro Tip" title="New Pro Tip">
            ${SPARKLE_SVG}
            <span>Tip</span>
          </button>
          <button class="fa-icon-btn" id="fa-clear-btn" aria-label="Clear conversation" title="Clear chat">
            ${CLEAR_SVG}
          </button>
        </div>
      </div>
      <div class="fa-messages" id="fa-messages"></div>
      <div class="fa-quick-replies" id="fa-quick-replies"></div>
      <div class="fa-input-area">
        <textarea class="fa-input" id="fa-input" rows="1"
          placeholder="Ask me anything about FAISAL's services..."
          aria-label="Type your message"></textarea>
        <button class="fa-send-btn" id="fa-send" aria-label="Send message">${SEND_SVG}</button>
      </div>
      <div class="fa-footer">
        Powered by <a href="contact.html">FAISAL · Digital Growth Architect</a>
      </div>
    `
    // Wire up events
    panel.querySelector('#fa-send').addEventListener('click', handleSend)
    panel.querySelector('#fa-clear-btn').addEventListener('click', clearConversation)
    panel.querySelector('#fa-protip-btn').addEventListener('click', handleNewProTip)
    panel.querySelector('#fa-close-btn').addEventListener('click', closePanel)

    const input = panel.querySelector('#fa-input')
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    })
    input.addEventListener('input', autoResize)
    return panel
  }

  function autoResize() {
    const input = document.getElementById('fa-input')
    if (!input) return
    input.style.height = 'auto'
    input.style.height = Math.min(input.scrollHeight, 90) + 'px'
  }

  // ----- Render helpers -----
  function appendMessage(role, content) {
    const wrap = document.getElementById('fa-messages')
    if (!wrap) return
    const div = document.createElement('div')
    div.className = 'fa-msg ' + (role === 'user' ? 'is-user' : 'is-ai')

    if (role === 'assistant') {
      const protipMatch = content.match(/^(.*?)(\n*\s*[💡✨\*]?\s*[Pp]ro\s*[Tt]ip:.*?)$/s)
      if (protipMatch && protipMatch[2]) {
        const mainText = protipMatch[1].replace(/\s+$/, '')
        const tipText = protipMatch[2].replace(/^\s+/, '')
        if (mainText) div.appendChild(document.createTextNode(mainText))
        const tip = document.createElement('span')
        tip.className = 'fa-protip'
        tip.textContent = tipText
        div.appendChild(tip)
      } else {
        div.textContent = content
      }
    } else {
      div.textContent = content
    }

    wrap.appendChild(div)
    wrap.scrollTop = wrap.scrollHeight
  }

  function renderQuickReplies(show) {
    const wrap = document.getElementById('fa-quick-replies')
    if (!wrap) return
    wrap.innerHTML = ''
    if (!show) return
    QUICK_REPLIES.forEach(function (text) {
      const b = document.createElement('button')
      b.textContent = text
      b.addEventListener('click', function () {
        if (/estimate.*cost/i.test(text) && typeof window.openFaisalCostCalculator === 'function') {
          renderQuickReplies(false)
          appendMessage('user', text)
          conversation.push({ role: 'user', content: text })
          const ack = "Opening our live cost calculator now — it pulls current 2026 market rates to give you an instant estimate.\n💡 Pro Tip: Pick the closest scope match first, then refine the features for the most accurate range."
          conversation.push({ role: 'assistant', content: ack })
          appendMessage('assistant', ack)
          saveHistory()
          setTimeout(function () { window.openFaisalCostCalculator() }, 400)
          return
        }
        const input = document.getElementById('fa-input')
        if (input) input.value = text
        handleSend()
      })
      wrap.appendChild(b)
    })
  }

  function showTyping() {
    const wrap = document.getElementById('fa-messages')
    if (!wrap) return
    if (document.getElementById('fa-typing')) return
    const div = document.createElement('div')
    div.className = 'fa-typing'
    div.id = 'fa-typing'
    div.innerHTML = '<span></span><span></span><span></span>'
    wrap.appendChild(div)
    wrap.scrollTop = wrap.scrollHeight
  }

  function hideTyping() {
    const t = document.getElementById('fa-typing')
    if (t) t.remove()
  }

  // ----- Conversation flow -----
  async function handleSend() {
    const input = document.getElementById('fa-input')
    if (!input) return
    const text = input.value.trim()
    if (!text || isTyping) return

    conversation.push({ role: 'user', content: text })
    appendMessage('user', text)
    input.value = ''
    input.style.height = 'auto'
    renderQuickReplies(false)
    saveHistory()

    isTyping = true
    const sendBtn = document.getElementById('fa-send')
    if (sendBtn) sendBtn.disabled = true
    showTyping()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: conversation }),
      })
      const data = await res.json()
      hideTyping()
      if (data && data.success && data.reply) {
        conversation.push({ role: 'assistant', content: data.reply })
        appendMessage('assistant', data.reply)
      } else {
        const errMsg = (data && data.error) || "I'm sorry — I couldn't reach my brain right now. Please try again."
        appendMessage('assistant', errMsg)
      }
    } catch (err) {
      hideTyping()
      appendMessage('assistant', "I'm having trouble connecting. Please try again, or email hello@metamehar.com directly.")
    } finally {
      isTyping = false
      const sb = document.getElementById('fa-send')
      if (sb) sb.disabled = false
      saveHistory()
    }
  }

  // ----- "New Pro Tip" button -----
  // Generates a fresh Pro Tip from the curated pool (instant, no LLM call)
  async function handleNewProTip() {
    const btn = document.getElementById('fa-protip-btn')
    if (!btn || btn.classList.contains('is-loading')) return

    btn.classList.add('is-loading')
    const label = btn.querySelector('span')
    const originalText = label ? label.textContent : ''
    if (label) label.textContent = '...'

    // Pick the next tip from the pool (cycles through all 20)
    protipIndex = (protipIndex + 1) % PRO_TIP_POOL.length
    const tip = '💡 Pro Tip: ' + PRO_TIP_POOL[protipIndex]

    // Small delay so the loading state is visible
    await new Promise(function (r) { setTimeout(r, 350) })

    btn.classList.remove('is-loading')
    if (label) label.textContent = originalText

    // Append the tip as a new AI message
    conversation.push({ role: 'assistant', content: tip })
    appendMessage('assistant', tip)
    saveHistory()
  }

  // ----- Clear conversation -----
  function clearConversation() {
    conversation = []
    try { sessionStorage.removeItem(STORAGE_KEY) } catch (_) {}
    const wrap = document.getElementById('fa-messages')
    if (wrap) wrap.innerHTML = ''
    // Re-show greeting
    conversation.push({ role: 'assistant', content: GREETING })
    appendMessage('assistant', GREETING)
    renderQuickReplies(true)
    saveHistory()
  }

  // ----- Open / close -----
  function openPanel() {
    const panel = document.getElementById('fa-panel-instance')
    const launcher = document.getElementById('fa-launcher-instance')
    if (!panel || !launcher) return
    panel.classList.add('is-open')
    launcher.classList.add('is-open')
    launcher.classList.remove('is-hidden')
    isOpen = true

    // Lock body scroll on mobile when panel is open (prevents background scroll)
    if (window.innerWidth <= 480) {
      document.body.style.overflow = 'hidden'
    }

    if (conversation.length === 0) {
      conversation.push({ role: 'assistant', content: GREETING })
      appendMessage('assistant', GREETING)
      renderQuickReplies(true)
      saveHistory()
    }

    setTimeout(function () {
      const input = document.getElementById('fa-input')
      if (input && window.innerWidth > 480) input.focus()
    }, 350)
  }

  function closePanel() {
    const panel = document.getElementById('fa-panel-instance')
    const launcher = document.getElementById('fa-launcher-instance')
    if (!panel || !launcher) return
    panel.classList.remove('is-open')
    launcher.classList.remove('is-open')

    // Unlock body scroll
    document.body.style.overflow = ''
    isOpen = false
  }

  function togglePanel() {
    if (isOpen) closePanel()
    else openPanel()
  }

  // Expose for external use
  window.openFaisalAssistant = function (message) {
    if (!isOpen) openPanel()
    if (message) {
      const input = document.getElementById('fa-input')
      if (input) input.value = message
      handleSend()
    }
  }

  // ----- Init -----
  function init() {
    const root = document.createElement('div')
    root.id = 'faisal-assistant-root'
    root.setAttribute('aria-live', 'polite')

    const launcher = buildLauncher()
    launcher.id = 'fa-launcher-instance'

    const panel = buildPanel()
    panel.id = 'fa-panel-instance'

    root.appendChild(launcher)
    root.appendChild(panel)
    document.body.appendChild(root)

    // Restore history (without replaying greeting)
    conversation = loadHistory()
    if (conversation.length > 0) {
      conversation.forEach(function (m) {
        appendMessage(m.role === 'user' ? 'user' : 'assistant', m.content)
      })
    }

    // Esc to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closePanel()
    })

    // NO auto-open — was causing scroll blocking on mobile.
    // The launcher is always visible so users can open it on demand.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
