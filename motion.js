/* Scroll-linked journey: one scheduled update per scroll, never a timer loop. */
(() => {
  'use strict';
  const query = selector => document.querySelector(selector);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = query('#character-stage');
  const toggle = query('#motion-button');
  const rail = query('.journey-rail');
  const path = query('#journey-path');
  const light = query('#journey-light');
  const steps = [...document.querySelectorAll('[data-journey]')];
  const targets = steps.map(step => document.getElementById(step.dataset.journey)).filter(Boolean);
  const narrow = matchMedia('(max-width: 760px)');
  let paused = preference.matches;
  let railVisible = true;
  let frame = 0;
  const length = path?.getTotalLength() ?? 0;
  function resetTilt() {
    stage?.style.setProperty('--rx', '0deg');
    stage?.style.setProperty('--ry', '0deg');
  }

  function placeLight(fraction) {
    if (!path || !light) return;
    const point = path.getPointAtLength(length * fraction);
    light.setAttribute('transform', `translate(${point.x} ${point.y})`);
  }

  function updateFromScroll() {
    frame = 0;
    const visibleTargets = targets.filter(target => !target.hidden);
    if (!visibleTargets.length) return;
    const first = visibleTargets[0].getBoundingClientRect();
    const last = visibleTargets[visibleTargets.length - 1].getBoundingClientRect();
    const start = first.top + first.height / 2;
    const end = last.top + last.height / 2;
    const progress = end > start ? (innerHeight / 2 - start) / (end - start) : 0;
    placeLight(Math.max(0, Math.min(1, progress)));
  }

  function syncAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    document.body.classList.toggle('page-hidden', document.hidden);
    if (!paused && !document.hidden && railVisible && !narrow.matches && path) {
      frame = requestAnimationFrame(updateFromScroll);
    }
  }

  function syncPreference() {
    document.body.classList.toggle('reduced-motion', paused);
    toggle?.setAttribute('aria-pressed', String(paused));
    if (toggle) toggle.textContent = paused ? 'Ativar movimento' : 'Pausar movimento';
    resetTilt();
    syncAnimation();
  }

  toggle?.addEventListener('click', () => { paused = !paused; syncPreference(); });
  preference.addEventListener('change', event => { paused = event.matches; syncPreference(); });
  narrow.addEventListener('change', syncAnimation);
  document.addEventListener('visibilitychange', syncAnimation);
  window.addEventListener('scroll', syncAnimation, { passive: true });
  window.addEventListener('resize', syncAnimation, { passive: true });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', syncAnimation));
  if ('ResizeObserver' in window) {
    const layoutObserver = new ResizeObserver(syncAnimation);
    targets.forEach(target => layoutObserver.observe(target));
  }
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
  window.addEventListener('pageshow', syncAnimation);
  placeLight(0);
  syncPreference();

  function setStep(id) {
    steps.forEach(step => {
      const active = step.dataset.journey === id;
      step.classList.toggle('active', active);
      if (active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  steps.forEach(step => step.addEventListener('click', () => {
    const target = document.getElementById(step.dataset.journey);
    if (!target) return;
    if (target.hidden) query('[data-filter="all"]')?.click();
    setStep(target.id);
    target.scrollIntoView({ behavior: paused ? 'auto' : 'smooth', block: 'center' });
  }));

  if ('IntersectionObserver' in window) {
    const railObserver = new IntersectionObserver(entries => {
      railVisible = entries.some(entry => entry.isIntersecting);
      syncAnimation();
    });
    if (rail) railObserver.observe(rail);
    const visible = new Map();
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.hidden) visible.set(entry.target.id, entry.target);
        else visible.delete(entry.target.id);
      });
      const candidates = [...visible.values()].filter(target => !target.hidden);
      const center = innerHeight * .45;
      candidates.sort((a, b) => {
        const distance = element => {
          const bounds = element.getBoundingClientRect();
          return Math.abs((bounds.top + bounds.bottom) / 2 - center);
        };
        return distance(a) - distance(b);
      });
      if (candidates[0]) setStep(candidates[0].id);
    }, { rootMargin: '-12% 0px -25% 0px', threshold: [0, .15, .4, .7] });
    targets.forEach(target => cardObserver.observe(target));
  }

  // Escape closes the mobile menu; dialogs handle their own Escape behavior.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !query('#main-nav.open')) return;
    query('#main-nav').classList.remove('open');
    query('#menu-button')?.setAttribute('aria-expanded', 'false');
    query('#menu-button')?.focus();
  });
})();
