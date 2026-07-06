document.addEventListener('DOMContentLoaded', () => {

  /* --- HEADER SCROLL ACTION --- */
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* --- MOBILE BURGER DRAWER --- */
  const burger = document.querySelector('.burger-menu');
  const navLinks = document.querySelector('.nav-links');
  
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  /* --- HERO SLIDER ---
     The hero slider is now handled by drag-hero.js (premium draggable slider).
     The old carousel logic has been removed. */

  /* --- TESTIMONIAL SLIDER --- */
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  let currentTestimonial = 0;
  let testimonialInterval;

  if (testimonialSlides.length > 0) {
    const updateTestimonials = () => {
      testimonialSlides.forEach((slide, index) => {
        if (index === currentTestimonial) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
    };

    const nextTestimonial = () => {
      currentTestimonial = (currentTestimonial + 1) % testimonialSlides.length;
      updateTestimonials();
    };

    // Auto-advance testimonials every 5 seconds (arrows removed, so auto-rotate)
    const startTestimonialInterval = () => {
      testimonialInterval = setInterval(nextTestimonial, 5000);
    };

    startTestimonialInterval();

    // Pause on hover, resume on leave
    const testimonialContainer = document.querySelector('.testimonial-slider-container');
    if (testimonialContainer) {
      testimonialContainer.addEventListener('mouseenter', () => clearInterval(testimonialInterval));
      testimonialContainer.addEventListener('mouseleave', startTestimonialInterval);
    }
  }

  /* --- STATS COUNT-UP ANIMATION --- */
  const stats = document.querySelectorAll('.stat-number');
  
  if (stats.length > 0) {
    const countUp = (element) => {
      const target = parseInt(element.getAttribute('data-target'), 10);
      const isPercent = element.getAttribute('data-format') === 'percent';
      const suffix = element.getAttribute('data-suffix') || '';
      const prefix = element.getAttribute('data-prefix') || '';
      let count = 0;
      const duration = 2000; // Animation duration in milliseconds
      const stepTime = Math.max(Math.floor(duration / target), 15);
      
      const timer = setInterval(() => {
        count += Math.ceil(target / (duration / stepTime));
        if (count >= target) {
          element.textContent = prefix + target + suffix;
          clearInterval(timer);
        } else {
          element.textContent = prefix + count + suffix;
        }
      }, stepTime);
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));
  }

  /* --- SCROLL REVEAL TRIGGERS ---
     Uses IntersectionObserver with a low threshold (0.05 = 5%) so sections
     reveal as soon as any part is visible. Also immediately reveals any
     sections that are already in the viewport on page load (prevents
     sections being invisible after refresh). */
  const reveals = document.querySelectorAll('.reveal');
  
  if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          entry.target.classList.add('is-visible');
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);  // stop observing once revealed
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(element => revealObserver.observe(element));

    // SAFETY NET: immediately reveal any sections already in the viewport
    // (prevents invisible content after page refresh)
    setTimeout(() => {
      reveals.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          element.classList.add('active');
          element.classList.add('is-visible');
          element.classList.add('visible');
        }
      });
    }, 100);

    // FALLBACK: if IntersectionObserver fails for any reason, reveal all
    // sections after 2 seconds (ensures content is never permanently hidden)
    setTimeout(() => {
      reveals.forEach(element => {
        if (!element.classList.contains('active')) {
          element.classList.add('active');
          element.classList.add('is-visible');
          element.classList.add('visible');
        }
      });
    }, 2000);
  }

  /* --- SCROLL TO TOP ACTION ---
     Removed: the floating arrow button was clashing with the AI assistant
     launcher (both sat at bottom-right). Scroll-to-top is now triggered by
     tapping the FAISAL logo in the header, which is the conventional pattern. */

  /* --- FORM SUBMISSIONS FEEDBACK --- */
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input');
      const submitBtn = newsletterForm.querySelector('button');
      
      if (emailInput.value.trim() !== '') {
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Subscribing...';
        
        setTimeout(() => {
          emailInput.value = '';
          submitBtn.innerHTML = 'Thank You!';
          submitBtn.style.background = '#2cffa5';
          
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
          }, 3000);
        }, 1500);
      }
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Message...';
      
      setTimeout(() => {
        contactForm.reset();
        submitBtn.innerHTML = 'Message Sent!';
        submitBtn.style.background = '#2cffa5';
        
        // Show success popup alert
        const successMsg = document.createElement('div');
        successMsg.style.position = 'fixed';
        successMsg.style.bottom = '40px';
        successMsg.style.left = '40px';
        successMsg.style.background = '#191a24';
        successMsg.style.borderLeft = '4px solid #2cffa5';
        successMsg.style.color = '#fff';
        successMsg.style.padding = '16px 24px';
        successMsg.style.borderRadius = '8px';
        successMsg.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        successMsg.style.zIndex = '1000';
        successMsg.innerHTML = '<strong>Success!</strong> Your message has been sent successfully.';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.style.opacity = '0';
          successMsg.style.transition = 'opacity 0.5s ease';
          setTimeout(() => successMsg.remove(), 500);
        }, 4000);

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
        }, 3000);
      }, 1800);
    });
  }
});

/* ======================================================================
   FAISAL — Premium mouse-tracking glow for service cards
   Tracks the mouse position relative to each .service-card and exposes
   it as CSS custom properties (--mx, --my) so the radial gradient in
   the ::before pseudo-element follows the cursor.
   ====================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.service-card, .value-card, .team-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
});

/* ======================================================================
   FAISAL — Make portfolio & blog cards fully clickable on mobile
   The whole card navigates, not just the tiny arrow icon.
   ====================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Portfolio cards: click anywhere on the card to navigate
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
      // Don't intercept clicks on the actual link elements (let them work naturally)
      if (e.target.closest('a')) return;
      const link = card.querySelector('.portfolio-title')?.getAttribute('href') ||
                   card.querySelector('.portfolio-btn')?.getAttribute('href') ||
                   'portfolio.html';
      window.location.href = link;
    });
  });

  // Blog cards: click anywhere on the card to navigate to blog.html
  document.querySelectorAll('.blog-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
      if (e.target.closest('a')) return;
      const link = card.querySelector('.blog-title a')?.getAttribute('href') ||
                   card.querySelector('a')?.getAttribute('href') ||
                   'blog.html';
      window.location.href = link;
    });
  });

  // Service cards: visual hover animation only (no click handler —
  // clicking was interfering with the hover animation and opening the
  // AI assistant unexpectedly). The cards are purely decorative now.
  document.querySelectorAll('.service-card').forEach(card => {
    card.style.cursor = 'default';
  });
});

/* ======================================================================
   FAISAL — Keyboard navigation for hero slider
   Now handled by drag-hero.js (removed from here to avoid conflicts).
   ====================================================================== */

/* ======================================================================
   FAISAL — Back-to-top button
   REMOVED per user request (the arrow in bottom-left was unwanted).
   ====================================================================== */

/* ======================================================================
   FAISAL — Subtle parallax on hero image
   Now handled by drag-hero.js (parallax is built into the drag system).
   ====================================================================== */


/* ======================================================================
   FAISAL — Show More / Show Less toggle
   Expands or collapses the hidden content inside .expandable-content
   ====================================================================== */
function toggleExpand(btn) {
  var container = btn.previousElementSibling;
  if (!container || !container.classList.contains('expandable-content')) return;

  var hidden = container.querySelector('.expandable-hidden');
  if (!hidden) return;

  var isExpanded = hidden.classList.contains('is-visible');

  if (isExpanded) {
    // Collapse
    hidden.classList.remove('is-visible');
    hidden.style.display = 'none';
    btn.textContent = 'Show More';
    btn.classList.remove('is-expanded');
    container.setAttribute('data-collapsed', 'true');
  } else {
    // Expand
    hidden.style.display = 'block';
    hidden.classList.add('is-visible');
    btn.textContent = 'Show Less';
    btn.classList.add('is-expanded');
    container.setAttribute('data-collapsed', 'false');
  }
}

/* ======================================================================
   FAISAL — Inline Cost Calculator (Tools tab) with macOS controls + live status
   ====================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const inlineState = {
    service: 'wordpress',
    scope: 'medium',
    timeline: 'standard',
    market: 'pakistan',
    description: '',
  };

  // --- macOS window controls ---
  const closeBtn = document.getElementById('calc-btn-close');
  const minimizeBtn = document.getElementById('calc-btn-minimize');
  const resetBtn = document.getElementById('calc-btn-reset');
  const bodyWrapper = document.getElementById('calc-body-wrapper');
  const calcCard = document.getElementById('fa-calc-inline-body');
  let isMinimized = false;

  // Close: hide the calculator card
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const section = document.getElementById('tools-tab-section');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
      if (calcCard) {
        calcCard.style.transition = 'all 0.3s ease';
        calcCard.style.opacity = '0';
        calcCard.style.transform = 'scale(0.9)';
        setTimeout(() => {
          calcCard.style.display = 'none';
          // Show a "reopen" button
          const reopen = document.createElement('button');
          reopen.id = 'calc-reopen-btn';
          reopen.innerHTML = 'Open Cost Calculator';
          reopen.style.cssText = 'width:100%;padding:16px;border-radius:14px;background:linear-gradient(135deg,#f85d80,#b06ab3);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 6px 18px rgba(248,93,128,0.3);max-width:640px;margin:0 auto;display:block;';
          reopen.addEventListener('click', () => {
            calcCard.style.display = 'block';
            calcCard.style.opacity = '1';
            calcCard.style.transform = 'scale(1)';
            reopen.remove();
          });
          const container = calcCard.parentElement;
          if (container) container.appendChild(reopen);
        }, 300);
      }
    });
  }

  // Minimize: collapse the body
  if (minimizeBtn && bodyWrapper) {
    minimizeBtn.addEventListener('click', () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        bodyWrapper.style.maxHeight = '0';
        bodyWrapper.style.overflow = 'hidden';
        bodyWrapper.style.padding = '0';
        bodyWrapper.style.opacity = '0';
      } else {
        bodyWrapper.style.maxHeight = 'none';
        bodyWrapper.style.overflow = 'visible';
        bodyWrapper.style.padding = '32px';
        bodyWrapper.style.opacity = '1';
      }
    });
  }

  // Reset: clear all selections, hide results, restore defaults
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset state to defaults
      inlineState.service = 'wordpress';
      inlineState.scope = 'medium';
      inlineState.timeline = 'standard';
      inlineState.market = 'pakistan';
      inlineState.description = '';
      inlineState.features = [];

      // Reset service chips
      var serviceChips = document.querySelectorAll('#inline-service-chips .inline-chip');
      serviceChips.forEach(c => c.classList.remove('is-active'));
      var wpChip = document.querySelector('#inline-service-chips .inline-chip[data-value="wordpress"]');
      if (wpChip) wpChip.classList.add('is-active');

      // Reset scope chips
      var scopeChips = document.querySelectorAll('#inline-scope-chips .inline-chip');
      scopeChips.forEach(c => c.classList.remove('is-active'));
      var medChip = document.querySelector('#inline-scope-chips .inline-chip[data-value="medium"]');
      if (medChip) medChip.classList.add('is-active');

      // Reset timeline chips
      var timelineChips = document.querySelectorAll('#inline-timeline-chips .inline-chip');
      timelineChips.forEach(c => c.classList.remove('is-active'));
      var stdChip = document.querySelector('#inline-timeline-chips .inline-chip[data-value="standard"]');
      if (stdChip) stdChip.classList.add('is-active');

      // Reset market chips
      var marketChips = document.querySelectorAll('#inline-market-chips .inline-chip');
      marketChips.forEach(c => c.classList.remove('is-active'));
      var pkChip = document.querySelector('#inline-market-chips .inline-chip[data-value="pakistan"]');
      if (pkChip) pkChip.classList.add('is-active');

      // Reset features chips (deselect all)
      var featureChips = document.querySelectorAll('#inline-features-chips .inline-chip');
      featureChips.forEach(c => c.classList.remove('is-active'));

      // Clear description
      var descEl2 = document.getElementById('inline-calc-desc');
      if (descEl2) descEl2.value = '';

      // Hide results and working status
      var resultEl2 = document.getElementById('inline-calc-result');
      if (resultEl2) resultEl2.style.display = 'none';

      var statusEl2 = document.getElementById('calc-working-status');
      if (statusEl2) statusEl2.style.display = 'none';

      // Reset submit button
      var submitBtn2 = document.getElementById('inline-calc-submit');
      if (submitBtn2) {
        submitBtn2.disabled = false;
        submitBtn2.textContent = 'Get My Instant Estimate';
      }

      // Flash the green dot to confirm reset
      if (resetBtn) {
        resetBtn.style.transform = 'scale(1.5)';
        resetBtn.style.boxShadow = '0 0 12px #28ca42';
        setTimeout(() => {
          resetBtn.style.transform = '';
          resetBtn.style.boxShadow = '';
        }, 300);
      }
    });
  }

  // --- Wire up chip groups ---
  function wireChipGroup(containerId, field) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.inline-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.inline-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        inlineState[field] = chip.getAttribute('data-value');
      });
    });
  }

  wireChipGroup('inline-service-chips', 'service');
  wireChipGroup('inline-scope-chips', 'scope');
  wireChipGroup('inline-timeline-chips', 'timeline');
  wireChipGroup('inline-market-chips', 'market');

  // Features (multi-select — toggle on/off)
  const featuresContainer = document.getElementById('inline-features-chips');
  if (featuresContainer) {
    featuresContainer.querySelectorAll('.inline-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('is-active');
        const value = chip.getAttribute('data-value');
        if (chip.classList.contains('is-active')) {
          if (!inlineState.features) inlineState.features = [];
          if (inlineState.features.indexOf(value) === -1) inlineState.features.push(value);
        } else {
          if (inlineState.features) {
            inlineState.features = inlineState.features.filter(f => f !== value);
          }
        }
      });
    });
  }

  // Description
  const descEl = document.getElementById('inline-calc-desc');
  if (descEl) {
    descEl.addEventListener('input', (e) => { inlineState.description = e.target.value; });
  }

  // --- Submit with live working status ---
  const submitBtn = document.getElementById('inline-calc-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async () => {
    const resultEl = document.getElementById('inline-calc-result');
    const statusEl = document.getElementById('calc-working-status');
    const stepsEl = document.getElementById('calc-working-steps');
    const titleEl = document.getElementById('calc-working-title');
    if (!resultEl) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Calculating...';
    resultEl.style.display = 'none';

    // Show working status
    if (statusEl) {
      statusEl.style.display = 'block';
      stepsEl.innerHTML = '';
      titleEl.textContent = 'Starting analysis...';
    }

    // Simulate live working steps (user sees what's happening)
    const steps = [
      { delay: 300, title: 'Searching the web for latest 2026 rates...', step: 'Fetching market data from 7 regions' },
      { delay: 1200, title: 'Analyzing competitor pricing...', step: 'Comparing Pakistan, US, EU, UK rates' },
      { delay: 2400, title: 'Calculating scope-based costs...', step: 'Factoring in project size and features' },
      { delay: 3600, title: 'Generating your estimate...', step: 'Applying urgency multipliers and trends' },
    ];

    const stepTimers = [];
    steps.forEach((s, i) => {
      const t = setTimeout(() => {
        if (titleEl) titleEl.textContent = s.title;
        if (stepsEl) {
          const stepDiv = document.createElement('div');
          stepDiv.style.cssText = 'padding: 4px 0; display: flex; align-items: center; gap: 8px;';
          stepDiv.innerHTML = '<span style="color: #2ecc71;">✓</span> ' + s.step;
          stepsEl.appendChild(stepDiv);
        }
      }, s.delay);
      stepTimers.push(t);
    });

    try {
      const res = await fetch('/api/estimate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inlineState),
      });
      const data = await res.json();

      // Clear timers
      stepTimers.forEach(t => clearTimeout(t));

      // Hide working status
      if (statusEl) statusEl.style.display = 'none';

      const fmt = (n) => '$' + Number(n).toLocaleString('en-US');

      if (data && data.success && data.estimate_low !== undefined) {
        const range = data.estimate_low === data.estimate_high ? fmt(data.estimate_low) : fmt(data.estimate_low) + ' – ' + fmt(data.estimate_high);
        const breakdownHTML = (data.breakdown || []).map(item => {
          const price = item.low === item.high ? fmt(item.low) : fmt(item.low) + ' – ' + fmt(item.high);
          return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;"><span style="color:rgba(255,255,255,0.7);">' + item.item + '</span><span style="color:#fff;font-weight:600;">' + price + '</span></div>';
        }).join('');
        const trendsHTML = (data.trends || []).map(t => '<div style="font-size:12px;color:rgba(46,204,113,0.8);padding:4px 0;">↗ ' + t + '</div>').join('');

        resultEl.style.display = 'block';
        var confidenceScore = data.confidence_score || 0;
        var liveSources = (data.live_rates_used || []).slice(0, 4);
        var liveSourcesHTML = liveSources.length > 0
          ? '<div style="margin-bottom:16px;"><p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(46,204,113,0.85);font-weight:700;margin:0 0 8px;">🔗 Live Data Sources Used</p>' + liveSources.map(function(s) { return '<div style="font-size:11px;color:rgba(46,204,113,0.7);padding:2px 0;">✓ ' + s + '</div>'; }).join('') + '</div>'
          : '';
        var rateAnalysisHTML = data.rate_analysis
          ? '<div style="padding:10px 13px;background:rgba(46,204,113,0.06);border-left:3px solid #2ecc71;border-radius:8px;font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:16px;">📊 ' + data.rate_analysis + '</div>'
          : '';

        resultEl.innerHTML = `
          <div style="text-align:center;padding:20px 0;border-bottom:1px dashed rgba(255,255,255,0.08);margin-bottom:16px;">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.5);font-weight:600;margin:0 0 8px;">Estimated Project Cost</p>
            <div style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#fff,#f85d80,#b06ab3);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">${range}</div>
            <p style="font-size:13px;color:rgba(255,255,255,0.55);margin:8px 0 0;">Recommended: ${fmt(data.recommended_budget || data.estimate_low)} · Timeline: ${(data.timeline_weeks_low||2)}–${(data.timeline_weeks_high||4)} weeks</p>
            ${confidenceScore > 0 ? '<div style="margin-top:12px;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:' + (confidenceScore >= 80 ? 'rgba(46,204,113,0.15)' : confidenceScore >= 60 ? 'rgba(255,189,46,0.15)' : 'rgba(255,95,87,0.15)') + ';border:1px solid ' + (confidenceScore >= 80 ? 'rgba(46,204,113,0.3)' : confidenceScore >= 60 ? 'rgba(255,189,46,0.3)' : 'rgba(255,95,87,0.3)') + ';"><span style="font-size:11px;font-weight:700;color:' + (confidenceScore >= 80 ? '#2ecc71' : confidenceScore >= 60 ? '#ffbd2e' : '#ff5f57') + ';">' + confidenceScore + '% confidence</span><span style="font-size:10px;color:rgba(255,255,255,0.4);">· based on live data</span></div>' : ''}
          </div>
          ${rateAnalysisHTML}
          ${breakdownHTML ? '<div style="margin-bottom:16px;"><p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(248,93,128,0.85);font-weight:700;margin:0 0 8px;">Cost Breakdown</p>' + breakdownHTML + '</div>' : ''}
          ${trendsHTML ? '<div style="margin-bottom:16px;"><p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(248,93,128,0.85);font-weight:700;margin:0 0 8px;">📡 Live 2026 Trends (from web search)</p>' + trendsHTML + '</div>' : ''}
          ${liveSourcesHTML}
          ${data.market_context ? '<div style="padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:16px;line-height:1.5;">📋 ' + data.market_context + '</div>' : ''}
          ${data.pro_tip ? '<div style="padding:10px 13px;background:linear-gradient(135deg,rgba(248,93,128,0.12),rgba(176,106,179,0.08));border-left:3px solid #f85d80;border-radius:8px;font-size:13px;color:rgba(255,220,230,0.95);font-style:italic;margin-bottom:16px;">' + data.pro_tip + '</div>' : ''}
          <div style="font-size:11px;color:rgba(255,255,255,0.4);text-align:center;margin-bottom:16px;">${data.disclaimer || 'Final pricing depends on scope confirmed in a discovery call.'}</div>
          <div style="display:flex;gap:10px;">
            <button onclick="document.getElementById('inline-calc-result').style.display='none';document.getElementById('fa-calc-inline-body').scrollIntoView({behavior:'smooth'});" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Recalculate</button>
            <a href="/contact.html" style="flex:1;padding:12px;border-radius:12px;background:linear-gradient(135deg,#f85d80,#b06ab3);color:#fff;font-size:13px;font-weight:600;text-decoration:none;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(248,93,128,0.3);">Discuss with FAISAL →</a>
          </div>
        `;
      } else {
        resultEl.style.display = 'block';
        resultEl.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.6);font-size:14px;">Could not generate estimate. Please try again.</div>';
      }
    } catch (err) {
      stepTimers.forEach(t => clearTimeout(t));
      if (statusEl) statusEl.style.display = 'none';
      resultEl.style.display = 'block';
      resultEl.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.6);font-size:14px;">Network error. Please try again.</div>';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get My Instant Estimate';
    }
  });
});
