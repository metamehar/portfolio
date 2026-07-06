/* ==========================================================================
   FAISAL — Draggable Hero Slider (v4 — Complete Rewrite)
   Built from scratch for maximum smoothness and reliability.

   Key design decisions:
   1. During drag: ONLY update track transform (1 DOM write per frame)
   2. Parallax/text-fade: applied via CSS, not JS (GPU-accelerated, no jank)
   3. Snap: requestAnimationFrame with ease-out (no CSS transitions)
   4. Infinite loop: clone first/last, seamless reset after snap completes
   5. No flicker: all state changes happen inside rAF callbacks
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_DRAG_HERO_LOADED__) return
  window.__FAISAL_DRAG_HERO_LOADED__ = true

  function init() {
    var hero = document.querySelector('.hero-section.draggable-hero')
    if (!hero) return

    var track = hero.querySelector('.hero-track')
    var realSlides = Array.prototype.slice.call(
      hero.querySelectorAll('.hero-slide:not([data-clone])')
    )
    var dotsContainer = hero.querySelector('.drag-dots')

    if (!track || realSlides.length === 0) return

    var slideCount = realSlides.length
    var vw = window.innerWidth

    // --- Clone first & last slide for infinite loop ---
    var firstClone = realSlides[0].cloneNode(true)
    var lastClone = realSlides[realSlides.length - 1].cloneNode(true)
    firstClone.setAttribute('data-clone', 'first')
    lastClone.setAttribute('data-clone', 'last')

    // Demote h1 to h2 in clones to avoid duplicate h1 tags (SEO best practice)
    var cloneH1s = firstClone.querySelectorAll('h1')
    for (var i = 0; i < cloneH1s.length; i++) {
      cloneH1s[i].outerHTML = cloneH1s[i].outerHTML.replace(/<h1/g, '<h2').replace(/<\/h1>/g, '</h2>')
    }
    var cloneH1s2 = lastClone.querySelectorAll('h1')
    for (var j = 0; j < cloneH1s2.length; j++) {
      cloneH1s2[j].outerHTML = cloneH1s2[j].outerHTML.replace(/<h1/g, '<h2').replace(/<\/h1>/g, '</h2>')
    }

    track.appendChild(firstClone)
    track.insertBefore(lastClone, track.firstChild)

    var allSlides = Array.prototype.slice.call(track.querySelectorAll('.hero-slide'))
    var totalSlides = allSlides.length  // real + 2 clones

    // --- State ---
    var index = 1            // current position in allSlides (1 = first real slide)
    var offset = -index * vw // current translateX
    var isDragging = false
    var startX = 0
    var startOffset = 0
    var lastX = 0
    var lastTime = 0
    var velocity = 0
    var snapRAF = null       // requestAnimationFrame ID for snap
    var isSnapping = false
    var autoTimer = null
    var isHovered = false

    // --- Apply transform (single function, minimal work) ---
    function apply(animate) {
      // During drag: no transition, just transform
      // During snap: we use rAF, so also no CSS transition
      track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
      track.style.transform = 'translate3d(' + offset + 'px,0,0)'
    }

    // --- Update dots to reflect real slide ---
    function updateDots() {
      if (!dotsContainer) return
      var real = ((index - 1) % slideCount + slideCount) % slideCount
      var dots = dotsContainer.children
      for (var i = 0; i < dots.length; i++) {
        dots[i].className = i === real ? 'drag-dot is-active' : 'drag-dot'
      }
    }

    // --- Build dots ---
    if (dotsContainer) {
      dotsContainer.innerHTML = ''
      for (var i = 0; i < slideCount; i++) {
        var dot = document.createElement('button')
        dot.className = 'drag-dot' + (i === 0 ? ' is-active' : '')
        dot.setAttribute('aria-label', 'Slide ' + (i + 1))
        dot.addEventListener('click', function (realIndex) {
          return function () { snapTo(realIndex + 1) }
        }(i))
        dotsContainer.appendChild(dot)
      }
    }

    // --- Seamless reset (after snap animation finishes) ---
    function seamlessReset() {
      // If we're on the last-clone (index 0), jump to last real slide
      if (index === 0) {
        index = slideCount
        offset = -index * vw
        apply(false)
        void track.offsetWidth  // force reflow
        updateDots()
      }
      // If we're on the first-clone (last index), jump to first real slide
      else if (index === totalSlides - 1) {
        index = 1
        offset = -index * vw
        apply(false)
        void track.offsetWidth
        updateDots()
      }
    }

    // --- Snap to a specific slide index (in allSlides) ---
    function snapTo(targetIndex) {
      if (snapRAF) cancelAnimationFrame(snapRAF)
      isSnapping = true

      var startOffset = offset
      var targetOffset = -targetIndex * vw
      var distance = targetOffset - startOffset
      var duration = 450
      var startTime = performance.now()

      function step(now) {
        var t = (now - startTime) / duration
        if (t >= 1) t = 1

        // Ease-out cubic
        var eased = 1 - Math.pow(1 - t, 3)
        offset = startOffset + distance * eased
        apply(false)

        if (t < 1) {
          snapRAF = requestAnimationFrame(step)
        } else {
          // Snap done
          offset = targetOffset
          index = targetIndex
          isSnapping = false
          snapRAF = null
          apply(false)
          updateDots()
          seamlessReset()
        }
      }

      snapRAF = requestAnimationFrame(step)
    }

    function next() { snapTo(index + 1) }
    function prev() { snapTo(index - 1) }

    // --- Drag handlers ---
    function dragStart(e) {
      // Cancel any ongoing snap
      if (snapRAF) {
        cancelAnimationFrame(snapRAF)
        snapRAF = null
        isSnapping = false
      }

      isDragging = true
      hero.classList.add('is-dragging')

      var x = e.touches ? e.touches[0].clientX : e.clientX
      startX = x
      startOffset = offset
      lastX = x
      lastTime = performance.now()
      velocity = 0
    }

    function dragMove(e) {
      if (!isDragging) return

      var x = e.touches ? e.touches[0].clientX : e.clientX
      offset = startOffset + (x - startX)
      apply(false)  // fast — just transform, no parallax

      // Track velocity
      var now = performance.now()
      var dt = now - lastTime
      if (dt > 0) {
        velocity = (x - lastX) / dt
      }
      lastX = x
      lastTime = now

      if (e.cancelable) e.preventDefault()
    }

    function dragEnd() {
      if (!isDragging) return

      isDragging = false
      hero.classList.remove('is-dragging')

      // Fast flick → go to next/prev
      if (Math.abs(velocity) > 0.35) {
        snapTo(velocity < 0 ? index + 1 : index - 1)
        return
      }

      // Slow drag → threshold check (20% of viewport)
      var dragDist = offset - startOffset
      var threshold = vw * 0.2

      if (dragDist < -threshold) {
        snapTo(index + 1)
      } else if (dragDist > threshold) {
        snapTo(index - 1)
      } else {
        snapTo(index)  // snap back to current
      }
    }

    // --- Events ---
    hero.addEventListener('mousedown', dragStart)
    window.addEventListener('mousemove', dragMove)
    window.addEventListener('mouseup', dragEnd)

    hero.addEventListener('touchstart', dragStart, { passive: true })
    hero.addEventListener('touchmove', dragMove, { passive: false })
    hero.addEventListener('touchend', dragEnd)

    // Wheel (trackpad horizontal swipe)
    var wheelTimer = null
    var wheelSum = 0
    hero.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        wheelSum += e.deltaX
        clearTimeout(wheelTimer)
        wheelTimer = setTimeout(function () {
          if (wheelSum > 40) next()
          else if (wheelSum < -40) prev()
          wheelSum = 0
        }, 80)
      }
    }, { passive: false })

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    })

    // Auto-advance
    function startAuto() {
      stopAuto()
      autoTimer = setInterval(function () {
        if (!isHovered && !isDragging && !isSnapping) next()
      }, 7000)
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
    }

    hero.addEventListener('mouseenter', function () { isHovered = true })
    hero.addEventListener('mouseleave', function () { isHovered = false })

    // Resize
    var resizeTimer = null
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        vw = window.innerWidth
        offset = -index * vw
        apply(false)
      }, 150)
    })

    // --- Init ---
    apply(false)
    updateDots()
    startAuto()

    // Expose
    window.faisalDragHero = {
      next: next,
      prev: prev,
      goTo: function (i) { snapTo(i + 1) },
      getCurrent: function () { return ((index - 1) % slideCount + slideCount) % slideCount },
      getTotal: function () { return slideCount },
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
