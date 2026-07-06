/* ==========================================================================
   FAISAL — FAQ Accordion Logic
   Toggles the .is-open class on .faq-item when the question is clicked.
   ========================================================================== */
(function () {
  'use strict'

  if (window.__FAISAL_FAQ_LOADED__) return
  window.__FAISAL_FAQ_LOADED__ = true

  function init() {
    const questions = document.querySelectorAll('.faq-question')
    questions.forEach(function (q) {
      q.addEventListener('click', function () {
        const item = q.closest('.faq-item')
        if (!item) return
        const isOpen = item.classList.contains('is-open')

        // Close all other items (optional — comment out for multi-open)
        // document.querySelectorAll('.faq-item.is-open').forEach(function (other) {
        //   if (other !== item) other.classList.remove('is-open')
        // })

        // Toggle this item
        if (isOpen) {
          item.classList.remove('is-open')
          q.setAttribute('aria-expanded', 'false')
        } else {
          item.classList.add('is-open')
          q.setAttribute('aria-expanded', 'true')
        }
      })
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
