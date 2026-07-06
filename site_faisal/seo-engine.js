/* ==========================================================================
   FAISAL — Autonomous SEO Engine v2 (Ultra-Advanced, Hidden, Autonomous)
   
   This engine runs COMPLETELY IN THE BACKGROUND with no visible UI:
   1. On page load → runs immediately
   2. Fetches live keyword data from /api/seo-engine
   3. Silently applies optimized meta tags to the page
   4. If competition is HIGH → re-checks every 60 seconds
   5. If competition is NORMAL → re-checks every 5 minutes
   6. Updates meta title, description, keywords autonomously
   7. Logs optimizations to console (for developers)
   
   The dashboard is still accessible via window.openSEOEngine() for manual
   review, but the engine works 100% autonomously without any user action.
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_SEO_ENGINE_LOADED__) return
  window.__FAISAL_SEO_ENGINE_LOADED__ = true

  var ICONS = {
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 2L9.91 8.91 3 11l6.91 2.09L12 20l2.09-6.91L21 11l-6.91-2.09z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    trend: '<svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>',
  }

  var dashboardEl = null
  var autoTimer = null
  var currentCompetition = 'normal'
  var lastResult = null
  var runCount = 0

  // === AUTONOMOUS ENGINE: runs on page load + repeats ===
  function startAutonomousEngine() {
    // Run immediately
    runAutonomousCycle()

    // Schedule the next check (interval is dynamic based on competition)
    scheduleNextCheck()
  }

  function scheduleNextCheck() {
    if (autoTimer) clearTimeout(autoTimer)
    var interval = currentCompetition === 'high' ? 300000 : 900000 // 5min (high) or 15min (normal)
    autoTimer = setTimeout(function () {
      runAutonomousCycle()
      scheduleNextCheck()
    }, interval)
  }

  async function runAutonomousCycle() {
    runCount++
    var pageName = window.location.pathname.split('/').pop() || 'index.html'
    var currentTitle = document.title || ''
    var descMeta = document.querySelector('meta[name="description"]')
    var currentDesc = descMeta ? descMeta.getAttribute('content') : ''

    try {
      var res = await fetch('/api/seo-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'autonomous',
          page: pageName,
          currentTitle: currentTitle,
          currentDescription: currentDesc,
          competitionLevel: currentCompetition,
        }),
      })
      var data = await res.json()

      if (data && data.success) {
        lastResult = data

        // Update competition level (affects next check interval)
        var comp = data.competition || {}
        currentCompetition = comp.intensity || 'normal'

        // Silently apply optimized meta tags
        if (data.analysis) {
          silentlyApplyOptimizations(data.analysis, data)
        }

        // Log to console for developers
        console.log(
          '%c[SEO Engine] Cycle #' + runCount + ' complete',
          'color: #f85d80; font-weight: 700'
        )
        console.log(
          '%c  Competition: ' + currentCompetition + ' (' + (comp.score || 0) + '/100)' +
          ' | Keywords: ' + (data.lowDifficultyKeywords || []).length + ' low-diff, ' +
          (data.highDifficultyKeywords || []).length + ' high-diff' +
          ' | AI Citation: ' + (data.analysis?.ai_citation_probability || 0) + '%' +
          ' | Next check: ' + (currentCompetition === 'high' ? '60s' : '5min'),
          'color: #abb8c3'
        )

        // Re-schedule with the new competition level
        scheduleNextCheck()
      }
    } catch (err) {
      console.error('[SEO Engine] Autonomous cycle failed:', err)
      // Retry in 2 minutes on error
      if (autoTimer) clearTimeout(autoTimer)
      autoTimer = setTimeout(function () {
        runAutonomousCycle()
        scheduleNextCheck()
      }, 120000)
    }
  }

  // === SILENT OPTIMIZATION: applies meta tags without any visible UI ===
  function silentlyApplyOptimizations(analysis, fullData) {
    var changes = []

    // Apply optimized title
    if (analysis.optimized_title && analysis.optimized_title.length > 20) {
      var oldTitle = document.title
      document.title = analysis.optimized_title
      if (oldTitle !== analysis.optimized_title) {
        changes.push('title: "' + analysis.optimized_title.substring(0, 50) + '..."')
      }
    }

    // Apply optimized description
    if (analysis.optimized_description) {
      var descMeta = document.querySelector('meta[name="description"]')
      if (descMeta) {
        var oldDesc = descMeta.getAttribute('content')
        descMeta.setAttribute('content', analysis.optimized_description)
        if (oldDesc !== analysis.optimized_description) {
          changes.push('description updated')
        }
      }
    }

    // Apply optimized keywords
    if (analysis.optimized_keywords) {
      var keywords = ''
      if (Array.isArray(analysis.optimized_keywords)) {
        keywords = analysis.optimized_keywords.map(function (k) {
          return typeof k === 'string' ? k : k.keyword
        }).join(', ')
      } else {
        keywords = String(analysis.optimized_keywords)
      }

      var kwMeta = document.querySelector('meta[name="keywords"]')
      if (kwMeta) {
        kwMeta.setAttribute('content', keywords)
      } else {
        var newKw = document.createElement('meta')
        newKw.name = 'keywords'
        newKw.content = keywords
        document.head.appendChild(newKw)
      }
      changes.push('keywords: ' + (Array.isArray(analysis.optimized_keywords) ? analysis.optimized_keywords.length : '?') + ' optimized')
    }

    // Apply OG tags if optimized title is available
    if (analysis.optimized_title) {
      var ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) ogTitle.setAttribute('content', analysis.optimized_title)
    }
    if (analysis.optimized_description) {
      var ogDesc = document.querySelector('meta[property="og:description"]')
      if (ogDesc) ogDesc.setAttribute('content', analysis.optimized_description)
    }

    if (changes.length > 0) {
      console.log(
        '%c[SEO Engine] Auto-applied: ' + changes.join(' | '),
        'color: #2ecc71; font-weight: 600'
      )
    }
  }

  // === DASHBOARD (optional — accessible via window.openSEOEngine) ===
  function buildDashboard() {
    var overlay = document.createElement('div')
    overlay.className = 'seo-dashboard-overlay'
    overlay.id = 'seo-dashboard-overlay'
    overlay.innerHTML = `
      <div class="seo-dashboard" role="dialog" aria-label="Autonomous SEO Engine">
        <div class="seo-dash-header">
          <div class="seo-dash-title">
            <div class="seo-dash-title-icon">${ICONS.spark}</div>
            <div>
              <h3>Autonomous SEO Engine</h3>
              <p>Live analysis · Auto-optimizing · Run #${runCount}</p>
            </div>
          </div>
          <button class="seo-dash-close" aria-label="Close">${ICONS.close}</button>
        </div>
        <div class="seo-dash-body" id="seo-dash-body">
          ${lastResult ? renderResultsHTML(lastResult) : '<div class="seo-dash-loading is-visible"><div class="seo-dash-spinner"></div><p>Running autonomous analysis...</p></div>'}
        </div>
      </div>
      <svg width="0" height="0" style="position:absolute">
        <defs>
          <linearGradient id="seo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f85d80"/>
            <stop offset="50%" stop-color="#b06ab3"/>
            <stop offset="100%" stop-color="#4568dc"/>
          </linearGradient>
        </defs>
      </svg>
    `

    overlay.querySelector('.seo-dash-close').addEventListener('click', closeDashboard)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDashboard()
    })

    return overlay
  }

  function renderResultsHTML(data) {
    var a = data.analysis || {}
    var score = a.ai_citation_probability || 0
    var dashOffset = 201 - (201 * score / 100)
    var comp = data.competition || {}

    var lowKeywords = (data.lowDifficultyKeywords || []).map(function (k) {
      return '<div class="seo-trend-item"><div class="seo-trend-icon">' + ICONS.check + '</div><span><strong style="color:#2ecc71">' + escapeHTML(k.keyword) + '</strong> — vol: ~' + (k.estimatedVolume || '?') + ' · difficulty: low · ' + escapeHTML(k.opportunity || 'quick-win') + '</span></div>'
    }).join('')

    var highKeywords = (data.highDifficultyKeywords || []).map(function (k) {
      return '<div class="seo-trend-item"><div class="seo-trend-icon">' + ICONS.trend + '</div><span><strong style="color:#f85d80">' + escapeHTML(k.keyword) + '</strong> — vol: ~' + (k.estimatedVolume || '?') + ' · difficulty: high · ' + escapeHTML(k.opportunity || 'authority') + (k.domain ? ' (' + escapeHTML(k.domain) + ')' : '') + '</span></div>'
    }).join('')

    var trendsHTML = (data.liveTrends || []).map(function (t) {
      return '<div class="seo-trend-item"><div class="seo-trend-icon">' + ICONS.spark + '</div><span>' + escapeHTML(t.title) + ' — ' + escapeHTML(t.snippet).substring(0, 80) + '</span></div>'
    }).join('')

    var actionsHTML = (a.autonomous_actions || []).map(function (act) {
      return '<div class="seo-trend-item"><div class="seo-trend-icon">' + ICONS.bolt + '</div><span>' + escapeHTML(act) + '</span></div>'
    }).join('')

    var serpHTML = (a.serp_opportunities || []).map(function (s) {
      return '<div class="seo-trend-item"><div class="seo-trend-icon">' + ICONS.trend + '</div><span><strong>' + escapeHTML(s.feature) + '</strong> — ' + escapeHTML(s.keyword || '') + ' → ' + escapeHTML(s.action || '') + '</span></div>'
    }).join('')

    var optKeywords = ''
    if (Array.isArray(a.optimized_keywords)) {
      optKeywords = a.optimized_keywords.map(function (k) {
        return typeof k === 'string' ? k : k.keyword + ' (vol:' + k.volume + ', diff:' + k.difficulty + ')'
      }).join(', ')
    } else {
      optKeywords = escapeHTML(String(a.optimized_keywords || ''))
    }

    return `
      <div class="seo-score-card">
        <div class="seo-score-ring">
          <svg viewBox="0 0 72 72">
            <circle class="bg-ring" cx="36" cy="36" r="32"/>
            <circle class="progress-ring" cx="36" cy="36" r="32" style="stroke-dashoffset: ${dashOffset};"/>
          </svg>
          <span class="seo-score-value">${score}</span>
        </div>
        <div class="seo-score-info">
          <h4>AI Citation Probability</h4>
          <p>${escapeHTML(a.summary || 'Autonomous analysis complete')} | Competition: ${comp.intensity || 'normal'} (${comp.score || 0}/100) | Next check: ${(data.nextCheckSeconds || 300)}s</p>
        </div>
      </div>

      <div class="seo-dash-section">
        <h4>Auto-Optimized Meta Tags (Applied Silently)</h4>
        <div class="seo-meta-card">
          <div class="seo-meta-label">Title (${escapeHTML(a.optimized_title || '').length} chars)</div>
          <div class="seo-meta-value">${escapeHTML(a.optimized_title || '')}</div>
        </div>
        <div class="seo-meta-card">
          <div class="seo-meta-label">Description (${escapeHTML(a.optimized_description || '').length} chars)</div>
          <div class="seo-meta-value">${escapeHTML(a.optimized_description || '')}</div>
        </div>
        <div class="seo-meta-card">
          <div class="seo-meta-label">Keywords (${Array.isArray(a.optimized_keywords) ? a.optimized_keywords.length : 0} keywords)</div>
          <div class="seo-meta-value">${optKeywords}</div>
        </div>
      </div>

      ${lowKeywords ? `<div class="seo-dash-section"><h4>🟢 Low-Difficulty Keywords (Quick Wins — High Volume)</h4>${lowKeywords}</div>` : ''}
      ${highKeywords ? `<div class="seo-dash-section"><h4>🔴 High-Difficulty Keywords (Authority Targets — Low Volume)</h4>${highKeywords}</div>` : ''}
      ${trendsHTML ? `<div class="seo-dash-section"><h4>📡 Live Trends (Last 7 Days)</h4>${trendsHTML}</div>` : ''}
      ${serpHTML ? `<div class="seo-dash-section"><h4>🎯 SERP Feature Opportunities</h4>${serpHTML}</div>` : ''}
      ${actionsHTML ? `<div class="seo-dash-section"><h4>⚡ Autonomous Actions Taken</h4>${actionsHTML}</div>` : ''}

      <div style="text-align:center;margin-top:16px;font-size:11px;color:rgba(255,255,255,0.3);">
        Engine running autonomously · Cycle #${runCount} · ${new Date(data.timestamp || Date.now()).toLocaleString()}
      </div>
    `
  }

  function escapeHTML(s) {
    if (s == null) return ''
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function openDashboard() {
    if (!dashboardEl) {
      dashboardEl = buildDashboard()
      document.body.appendChild(dashboardEl)
    } else {
      // Update content with latest data
      var body = dashboardEl.querySelector('#seo-dash-body')
      if (body && lastResult) {
        body.innerHTML = renderResultsHTML(lastResult)
      }
    }
    dashboardEl.classList.add('is-open')
    document.body.style.overflow = 'hidden'
  }

  function closeDashboard() {
    if (!dashboardEl) return
    dashboardEl.classList.remove('is-open')
    document.body.style.overflow = ''
  }

  // === INIT ===
  function init() {
    // Start the autonomous engine immediately (no visible button)
    // Delay 2 seconds to let the page load first
    setTimeout(startAutonomousEngine, 2000)

    // Esc to close dashboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dashboardEl && dashboardEl.classList.contains('is-open')) {
        closeDashboard()
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Expose for manual access (developers can call window.openSEOEngine())
  window.openSEOEngine = openDashboard
})()
