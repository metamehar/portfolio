/* ==========================================================================
   FAISAL — Live Project Cost Calculator (client logic)
   Self-contained: creates its own DOM, manages state, calls /api/estimate-cost.
   Exposes window.openFaisalCostCalculator() so the AI assistant can trigger it.
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_CALCULATOR_LOADED__) return
  window.__FAISAL_CALCULATOR_LOADED__ = true

  const ICONS = {
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 2L9.91 8.91 3 11l6.91 2.09L12 20l2.09-6.91L21 11l-6.91-2.09z"/></svg>',
  }

  // State
  const state = {
    service: 'wordpress',
    scope: 'medium',
    features: [],
    timeline: 'standard',
    market: 'pakistan',
    description: '',
  }

  // Service labels (for the share + contact pre-fill feature)
  const SERVICE_LABELS = {
    wordpress: 'WordPress Web Design',
    seo: 'SEO & Digital Marketing',
    brand: 'Brand Identity Systems',
    canva: 'Canva Graphic Design',
  }

  // ---------- DOM build ----------
  function buildOverlay() {
    const ov = document.createElement('div')
    ov.className = 'fa-calc-overlay'
    ov.id = 'fa-calc-overlay'
    ov.innerHTML = `
      <div class="fa-calc-modal" role="dialog" aria-label="Project Cost Calculator">
        <div class="fa-calc-header">
          <div class="fa-calc-title-block">
            <h3>Live Project Cost Calculator</h3>
            <p>Powered by 2026 market data — get an instant estimate for your SEO, WordPress, branding, or design project.</p>
          </div>
          <button class="fa-calc-close" aria-label="Close calculator">${ICONS.close}</button>
        </div>

        <div class="fa-calc-body" id="fa-calc-body">
          <!-- Service -->
          <div class="fa-calc-field">
            <label>What do you need?</label>
            <div class="fa-calc-chip-group" data-field="service">
              <button class="fa-calc-chip is-active" data-value="wordpress">WordPress Website</button>
              <button class="fa-calc-chip" data-value="seo">SEO Campaign</button>
              <button class="fa-calc-chip" data-value="brand">Brand Identity</button>
              <button class="fa-calc-chip" data-value="canva">Canva Design Pack</button>
            </div>
          </div>

          <!-- Scope -->
          <div class="fa-calc-field">
            <label>Project size</label>
            <div class="fa-calc-chip-group" data-field="scope">
              <button class="fa-calc-chip" data-value="small">Small (1–5 pages)</button>
              <button class="fa-calc-chip is-active" data-value="medium">Medium (6–15 pages)</button>
              <button class="fa-calc-chip" data-value="large">Large (15–40 pages)</button>
              <button class="fa-calc-chip" data-value="enterprise">Enterprise (40+ pages)</button>
            </div>
          </div>

          <!-- Features -->
          <div class="fa-calc-field">
            <label>Features (select all that apply)</label>
            <div class="fa-calc-chip-group" data-field="features" data-multi="true">
              <button class="fa-calc-chip" data-value="ecommerce">E-commerce</button>
              <button class="fa-calc-chip" data-value="multilingual">Multi-language</button>
              <button class="fa-calc-chip" data-value="booking">Booking / Membership</button>
              <button class="fa-calc-chip" data-value="blog">Blog / News</button>
              <button class="fa-calc-chip" data-value="seo-optimization">Advanced SEO</button>
              <button class="fa-calc-chip" data-value="animations">Custom Animations</button>
              <button class="fa-calc-chip" data-value="content">Content Writing</button>
              <button class="fa-calc-chip" data-value="schema">Schema Markup</button>
            </div>
          </div>

          <!-- Timeline -->
          <div class="fa-calc-field">
            <label>Timeline</label>
            <div class="fa-calc-chip-group" data-field="timeline">
              <button class="fa-calc-chip" data-value="rush">Rush (under 1 week)</button>
              <button class="fa-calc-chip is-active" data-value="standard">Standard (2–4 weeks)</button>
              <button class="fa-calc-chip" data-value="relaxed">Relaxed (1–3 months)</button>
            </div>
          </div>

          <!-- Market -->
          <div class="fa-calc-field">
            <label>Your target market (affects rate tier)</label>
            <div class="fa-calc-chip-group" data-field="market">
              <button class="fa-calc-chip is-active" data-value="pakistan">Pakistan / South Asia</button>
              <button class="fa-calc-chip" data-value="india">India</button>
              <button class="fa-calc-chip" data-value="us">United States</button>
              <button class="fa-calc-chip" data-value="eu">European Union</button>
              <button class="fa-calc-chip" data-value="uk">United Kingdom</button>
              <button class="fa-calc-chip" data-value="gcc">GCC / Middle East</button>
              <button class="fa-calc-chip" data-value="global">Global / Other</button>
            </div>
          </div>

          <!-- Description -->
          <div class="fa-calc-field">
            <label>Project brief (optional)</label>
            <textarea class="fa-calc-textarea" id="fa-calc-desc"
              placeholder="e.g. WooCommerce store for a fashion brand with 50 products, English + Urdu, blog included..."
              aria-label="Project description"></textarea>
          </div>

          <button class="fa-calc-submit" id="fa-calc-submit">
            ${ICONS.spark} Get My Instant Estimate
          </button>
        </div>

        <!-- Loading state -->
        <div class="fa-calc-loading" id="fa-calc-loading">
          <div class="fa-calc-spinner"></div>
          <p>Analyzing 2026 market trends…</p>
          <p>Crunching rates for your selected scope and features.</p>
        </div>

        <!-- Result card -->
        <div class="fa-calc-result" id="fa-calc-result"></div>
      </div>
    `

    // Wire up chip clicks
    ov.querySelectorAll('.fa-calc-chip-group').forEach(function (group) {
      const field = group.getAttribute('data-field')
      const isMulti = group.getAttribute('data-multi') === 'true'

      group.querySelectorAll('.fa-calc-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          const value = chip.getAttribute('data-value')
          if (isMulti) {
            // Toggle
            const idx = state.features.indexOf(value)
            if (idx === -1) {
              state.features.push(value)
              chip.classList.add('is-active')
            } else {
              state.features.splice(idx, 1)
              chip.classList.remove('is-active')
            }
          } else {
            // Single select
            state[field] = value
            group.querySelectorAll('.fa-calc-chip').forEach(function (c) {
              c.classList.remove('is-active')
            })
            chip.classList.add('is-active')
          }
        })
      })
    })

    // Wire up close + submit
    ov.querySelector('.fa-calc-close').addEventListener('click', closeCalculator)
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeCalculator()
    })
    ov.querySelector('#fa-calc-submit').addEventListener('click', handleSubmit)

    // Wire up description
    ov.querySelector('#fa-calc-desc').addEventListener('input', function (e) {
      state.description = e.target.value
    })

    return ov
  }

  // ---------- Open / close ----------
  function openCalculator() {
    const ov = document.getElementById('fa-calc-overlay')
    if (!ov) return
    ov.classList.add('is-open')
    document.body.style.overflow = 'hidden'
  }

  function closeCalculator() {
    const ov = document.getElementById('fa-calc-overlay')
    if (!ov) return
    ov.classList.remove('is-open')
    document.body.style.overflow = ''
  }

  // Expose globally so the AI assistant can trigger it
  window.openFaisalCostCalculator = openCalculator

  // ---------- Submit → call API ----------
  async function handleSubmit() {
    const body = document.getElementById('fa-calc-body')
    const loading = document.getElementById('fa-calc-loading')
    const result = document.getElementById('fa-calc-result')
    const submitBtn = document.getElementById('fa-calc-submit')

    // Show loading, hide form + result
    body.style.display = 'none'
    result.classList.remove('is-visible')
    loading.classList.add('is-visible')
    submitBtn.disabled = true

    try {
      const res = await fetch('/api/estimate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: state.service,
          scope: state.scope,
          features: state.features,
          timeline: state.timeline,
          market: state.market,
          description: state.description,
        }),
      })
      const data = await res.json()

      loading.classList.remove('is-visible')

      if (data && data.success && data.estimate_low !== undefined) {
        renderResult(data)
        result.classList.add('is-visible')
      } else {
        renderError(data)
        result.classList.add('is-visible')
      }
    } catch (err) {
      loading.classList.remove('is-visible')
      renderError({ error: 'Network error. Please try again.' })
      result.classList.add('is-visible')
    } finally {
      submitBtn.disabled = false
    }
  }

  // ---------- Render result ----------
  function renderResult(data) {
    const result = document.getElementById('fa-calc-result')
    const fmt = function (n) {
      return '$' + Number(n).toLocaleString('en-US')
    }
    const range =
      data.estimate_low === data.estimate_high
        ? fmt(data.estimate_low)
        : fmt(data.estimate_low) + ' – ' + fmt(data.estimate_high)

    const breakdownHTML = (data.breakdown || [])
      .map(function (item) {
        const price =
          item.low === item.high
            ? fmt(item.low)
            : fmt(item.low) + ' – ' + fmt(item.high)
        return (
          '<li><span class="item-name">' +
          escapeHTML(item.item) +
          '</span><span class="item-price">' +
          price +
          '</span></li>'
        )
      })
      .join('')

    const trendsHTML = (data.trends || [])
      .map(function (t) {
        return '<li>' + escapeHTML(t) + '</li>'
      })
      .join('')

    result.innerHTML = `
      <div class="fa-calc-price-hero">
        <p class="fa-calc-price-label">Estimated Project Cost</p>
        <div class="fa-calc-price-range">${range}</div>
        <p class="fa-calc-price-meta">
          Recommended budget: <strong>${fmt(data.recommended_budget || data.estimate_low)}</strong>
          &nbsp;·&nbsp; Timeline: ${data.timeline_weeks_low || 2}–${data.timeline_weeks_high || 4} weeks
        </p>
      </div>

      ${breakdownHTML ? `
        <div class="fa-calc-section">
          <h4>Cost Breakdown</h4>
          <ul class="fa-calc-breakdown">${breakdownHTML}</ul>
        </div>` : ''}

      ${data.market_context ? `
        <div class="fa-calc-section">
          <h4>Market Context</h4>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.55;">${escapeHTML(data.market_context)}</p>
        </div>` : ''}

      ${trendsHTML ? `
        <div class="fa-calc-section">
          <h4>Live 2026 Trends</h4>
          <div class="fa-calc-trends"><ul>${trendsHTML}</ul></div>
        </div>` : ''}

      ${data.pro_tip ? `<div class="fa-calc-protip">${escapeHTML(data.pro_tip)}</div>` : ''}

      <div class="fa-calc-disclaimer">${escapeHTML(data.disclaimer || 'Final pricing depends on scope confirmed in a discovery call.')}</div>

      <div class="fa-calc-actions">
        <button class="fa-calc-btn-secondary" id="fa-calc-recalc">Recalculate</button>
        <button class="fa-calc-btn-secondary" id="fa-calc-share" title="Share this estimate">Share</button>
        <button class="fa-calc-btn-primary" id="fa-calc-contact">Discuss with FAISAL →</button>
      </div>
    `

    // Wire up the action buttons
    result.querySelector('#fa-calc-recalc').addEventListener('click', function () {
      result.classList.remove('is-visible')
      document.getElementById('fa-calc-body').style.display = 'block'
    })
    result.querySelector('#fa-calc-contact').addEventListener('click', function () {
      // Save the estimate to sessionStorage so the contact page can reference it
      try {
        sessionStorage.setItem('faisal_last_estimate', JSON.stringify({
          range: range,
          recommended: fmt(data.recommended_budget || data.estimate_low),
          timeline: (data.timeline_weeks_low || 2) + '-' + (data.timeline_weeks_high || 4) + ' weeks',
          service: state.service,
          scope: state.scope,
        }))
      } catch (_) {}
      closeCalculator()
      window.location.href = '/contact.html?service=' + encodeURIComponent(SERVICE_LABELS[state.service] || 'Project')
    })
    result.querySelector('#fa-calc-share').addEventListener('click', function () {
      const shareText = 'FAISAL project estimate: ' + range + ' (recommended: ' + fmt(data.recommended_budget || data.estimate_low) + ', timeline: ' + (data.timeline_weeks_low || 2) + '-' + (data.timeline_weeks_high || 4) + ' weeks). Get yours at https://metamehar.github.io/'
      if (navigator.share) {
        navigator.share({ title: 'FAISAL Project Estimate', text: shareText, url: window.location.href })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(function () {
          const btn = result.querySelector('#fa-calc-share')
          const orig = btn.textContent
          btn.textContent = '✓ Copied!'
          setTimeout(function () { btn.textContent = orig }, 2000)
        }).catch(function () {
          alert(shareText)
        })
      }
    })
  }

  function renderError(data) {
    const result = document.getElementById('fa-calc-result')
    result.innerHTML = `
      <div style="padding:40px 24px;text-align:center;">
        <p style="color:#f85d80;font-weight:600;margin:0 0 8px;">Couldn't generate an estimate</p>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 18px;">${escapeHTML((data && data.error) || 'Please try again.')}</p>
        <button class="fa-calc-btn-primary" id="fa-calc-retry" style="padding:11px 24px;">Try Again</button>
      </div>
    `
    result.querySelector('#fa-calc-retry').addEventListener('click', function () {
      result.classList.remove('is-visible')
      document.getElementById('fa-calc-body').style.display = 'block'
    })
  }

  function escapeHTML(s) {
    if (s == null) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // ---------- Init ----------
  function init() {
    const overlay = buildOverlay()
    document.body.appendChild(overlay)
    // Esc to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const ov = document.getElementById('fa-calc-overlay')
        if (ov && ov.classList.contains('is-open')) closeCalculator()
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
