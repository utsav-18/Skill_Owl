/* global window, document, requestAnimationFrame */

// ---------- Canvas particles (denser, twinkle + connections) ----------
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
let particles = [];
const BASE = Math.round((W * H) / 90000);
const PCOUNT = Math.max(100, BASE * 2); // heavy but still reasonable

function rand(min, max){ return Math.random() * (max - min) + min; }

function createParticles(){
  particles = [];
  for(let i=0;i<PCOUNT;i++){
    particles.push({
      x: rand(0, W),
      y: rand(0, H),
      r: rand(0.6, 2.6),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.35, 0.35),
      baseAlpha: rand(0.04, 0.22),
      alphaPhase: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.002, 0.01)
    });
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0, 'rgba(10,20,30,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  const now = performance.now();

  for(let p of particles){
    const a = p.baseAlpha + Math.sin(now * p.twinkleSpeed + p.alphaPhase) * (p.baseAlpha * 0.6);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, a))})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }

  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if(d < 160){
        const alpha = 0.016 * (1 - d / 160);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

function update(){
  for(let p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if(p.x < -20) p.x = W + 20;
    if(p.x > W + 20) p.x = -20;
    if(p.y < -20) p.y = H + 20;
    if(p.y > H + 20) p.y = -20;
  }
}

let raf;
function loop(){
  update();
  draw();
  raf = requestAnimationFrame(loop);
}
createParticles();
loop();

window.addEventListener('resize', ()=> {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  createParticles();
});

// ---------- Parallax / tilt on image ----------
const imageFrame = document.getElementById('imageFrame');
if (imageFrame) {
  imageFrame.addEventListener('mousemove', (e)=>{
    const rect = imageFrame.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rx = (dy / rect.height) * -6;
    const ry = (dx / rect.width) * 10;
    imageFrame.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
  });
  imageFrame.addEventListener('mouseleave', ()=>{
    imageFrame.style.transform = `perspective(900px) rotateX(0) rotateY(0) translateZ(0)`;
  });
}

// subtle move particles on mouse
window.addEventListener('mousemove', (e)=>{
  const mx = (e.clientX / innerWidth - 0.5) * 0.6;
  const my = (e.clientY / innerHeight - 0.5) * 0.6;
  for(let p of particles){
    p.x += mx * 0.12;
    p.y += my * 0.12;
  }
});

// ---------- Typed subtitle ----------
const typed = document.getElementById('typed-subtitle');
const phrases = [
  "Empowering organizations with expert-led training programs.",
  "Drive leadership excellence, communication mastery, and measurable growth.",
  "Tailored workshops for teams — scalable, measurable, human-centered."
];
let tIndex = 0, char = 0, forward = true;
function typeLoop(){
  const text = phrases[tIndex];
  if(forward){
    char++;
    if(char > text.length){ forward = false; setTimeout(typeLoop, 1500); return; }
  } else {
    char--;
    if(char === 0){ forward = true; tIndex = (tIndex+1) % phrases.length; setTimeout(typeLoop, 420); return; }
  }
  typed.textContent = text.slice(0, char);
  setTimeout(typeLoop, forward ? 22 + Math.random()*22 : 12);
}
setTimeout(typeLoop, 600);

// ---------- Reveal on scroll with direction + stagger ----------
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const rect = el.getBoundingClientRect();
    const baseDelay = Math.max(0, (rect.top / window.innerHeight) * 300);
    setTimeout(() => {
      el.classList.add('show');
      if(el.classList.contains('hero-right')){
        const frame = el.querySelector('.image-frame');
        if(frame){
          frame.classList.add('revealed');
          setTimeout(()=> frame.classList.add('lift'), 420);
        }
      }
    }, baseDelay + 80);
    observer.unobserve(el);
  });
}, {threshold: 0.12});

revealEls.forEach(el => observer.observe(el));

// ---------- Ripple for anchors (no navigation blocking) ----------
function createRipple(e){
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
  btn.appendChild(ripple);
  ripple.animate([
    { transform: 'scale(0)', opacity: 0.7 },
    { transform: 'scale(1)', opacity: 0.12 },
    { transform: 'scale(1.4)', opacity: 0 }
  ], { duration: 620, easing: 'cubic-bezier(.22,.9,.33,1)'});
  setTimeout(()=> ripple.remove(), 700);
}

// attach ripple to CTA anchors and chat anchors (keeps href behavior)
document.querySelectorAll('.cta-btn').forEach(a=>{
  a.addEventListener('click', (e)=>{
    createRipple(e);
    a.animate([{ transform:'translateY(0)' }, { transform:'translateY(-6px)' }, { transform:'translateY(0)' }], { duration: 340, easing: 'ease-out' });
    // allow default anchor navigation to proceed immediately
  });
});
document.querySelectorAll('.chat-btn').forEach(a=>{
  a.addEventListener('click', (e)=>{
    createRipple(e);
    a.animate([{ transform:'scale(1)' }, { transform:'scale(1.08)' }, { transform:'scale(1)' }], { duration: 360, easing: 'ease-out' });
    // allow default anchor navigation
  });
});

// ---------- Nav underline hover origin (based on hover side) ----------
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('mouseenter', (e) => {
    const rect = link.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const fromLeft = (e.clientX <= cx);
    link.style.setProperty('--origin-x', fromLeft ? 'left' : 'right');
  });
  link.addEventListener('focus', ()=> link.style.setProperty('--origin-x', 'left'));
});

// ---------- Respect reduced motion ----------
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  cancelAnimationFrame(raf);
  canvas.style.display = 'none';
  document.querySelectorAll('.reveal').forEach(r => r.classList.add('show'));
  document.querySelectorAll('.image-frame').forEach(f => f.classList.add('revealed'));
}



{


(function(){
  /* ====== CONFIG ====== */
  // Set countdown target ISO string or null to hide countdown
  const COUNTDOWN_TARGET_ISO = "2025-12-20T18:30:00+05:30"; // change to your date or set null

  /* ====== FADE-UP INTERSECTION ANIM ====== */
  const fadeEls = document.querySelectorAll('.fade-up');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0;
        setTimeout(()=> el.classList.add('show'), Math.round(delay*1000));
        obs.unobserve(el);
      }
    });
  }, {threshold: 0.18});
  fadeEls.forEach(e => io.observe(e));

  /* ====== COUNTER ANIM ====== */
  // Works for integers and 1-decimal place values if data-fixed="1"
  function animateCounters(){
    const counters = document.querySelectorAll('.stat-item h3[data-target]');
    counters.forEach(h => {
      const raw = h.getAttribute('data-target');
      const fixed = parseInt(h.getAttribute('data-fixed') || '0', 10);
      const target = parseFloat(raw);
      const isDecimal = fixed > 0;
      const steps = 80; // smoothness
      const duration = 1200;
      let start = 0;
      const startTime = performance.now();

      function step(now){
        const t = Math.min(1, (now - startTime) / duration);
        // easeOutCubic
        const ease = 1 - Math.pow(1 - t, 3);
        const val = start + (target - start) * ease;
        h.innerText = isDecimal ? val.toFixed(fixed) : Math.floor(val);
        if (t < 1) requestAnimationFrame(step);
        else {
          h.innerText = isDecimal ? target.toFixed(fixed) : String(Math.floor(target));
        }
      }
      requestAnimationFrame(step);
    });
  }

  // Run counters once main card visible (observe the card)
  const card = document.querySelector('.about-card');
  if (card) {
    const cardObs = new IntersectionObserver((entries, o)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          animateCounters();
          o.disconnect();
        }
      });
    }, {threshold: 0.35});
    cardObs.observe(card);
  } else {
    // fallback
    animateCounters();
  }

  /* ====== COUNTDOWN ====== */
  if (COUNTDOWN_TARGET_ISO) {
    const targetDate = new Date(COUNTDOWN_TARGET_ISO);
    const holder = document.querySelector('.about-countdown');
    if (holder) {
      const chip = document.createElement('div');
      chip.className = 'countdown-chip';
      chip.setAttribute('role','status');
      chip.setAttribute('aria-live','polite');
      holder.appendChild(chip);

      function update() {
        const now = new Date();
        let diff = Math.max(0, targetDate - now);
        if (diff <= 0) {
          chip.textContent = 'Offer ended';
          return;
        }
        const d = Math.floor(diff / (1000*60*60*24));
        const h = Math.floor(diff / (1000*60*60) % 24);
        const m = Math.floor(diff / (1000*60) % 60);
        const s = Math.floor(diff / 1000 % 60);
        chip.textContent = `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s left`;
      }
      update();
      const tid = setInterval(update, 1000);
      // stop when passed
      setTimeout(()=>{ clearInterval(tid); }, Math.max(0, targetDate - new Date()) + 1000);
    }
  }

  /* ====== IMAGE SUBTLE PARALLAX ON MOUSE (only desktop, respecting reduced-motion) ====== */
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imgWrap = document.querySelector('.about-image-wrapper');
  if (imgWrap && !prefersReduced) {
    imgWrap.addEventListener('mousemove', function(e){
      const r = imgWrap.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
      const dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
      const tx = dx * 6;
      const ty = dy * 6;
      imgWrap.style.transform = `translateY(-6px) translateX(${tx}px) rotate(${tx*0.02}deg) scale(1.01)`;
    });
    imgWrap.addEventListener('mouseleave', function(){
      imgWrap.style.transform = '';
    });
  }

})();


}


{


/*
  Achievements JS
  - Animates counters (reads data-target, data-suffix, data-fixed)
  - Injects visible suffix span (so + and % are always visible)
  - Adds countdown chip (change COUNTDOWN_TARGET_ISO)
  - Highlights the 3rd card (index 2) by adding .selected
*/
(function(){
  // ===== CONFIG =====
  const COUNTDOWN_TARGET_ISO = "2025-12-20T18:30:00+05:30"; // set to null to disable countdown
  const COUNTER_DURATION = 1200; // ms
  const COUNTER_EASE = t => 1 - Math.pow(1 - t, 3); // easeOutCubic

  // ===== helpers =====
  function ensureSuffixEl(hEl, suffixText) {
    if (!suffixText) return;
    // keep suffix in its own element for styling
    let s = hEl.querySelector('.suffix');
    if (!s) {
      s = document.createElement('span');
      s.className = 'suffix';
      // Put suffix after the numeric text. Use appendChild to avoid replacing number node.
      hEl.appendChild(s);
    }
    s.textContent = suffixText;
  }

  function animateValue(el, to, fixed) {
    const start = 0;
    const t0 = performance.now();
    function step(now) {
      const t = Math.min(1, (now - t0) / COUNTER_DURATION);
      const eased = COUNTER_EASE(t);
      const val = start + (to - start) * eased;
      el.textContent = fixed ? Number(val).toFixed(fixed) : Math.floor(val);
      // maintain suffix if present (avoid removing it)
      const suffix = el._suffixText;
      if (suffix) ensureSuffixEl(el, suffix);
      if (t < 1) requestAnimationFrame(step);
      else {
        el.textContent = fixed ? Number(to).toFixed(fixed) : String(Math.floor(to));
        if (suffix) ensureSuffixEl(el, suffix);
      }
    }
    requestAnimationFrame(step);
  }

  // ===== counters when visible =====
  const grid = document.querySelector('.impact-grid');
  if (grid) {
    const gridObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // start counters
        const cards = grid.querySelectorAll('.impact-card');
        cards.forEach(card => {
          const h3 = card.querySelector('h3');
          if (!h3) return;
          // determine target
          const dataTarget = card.getAttribute('data-target');
          const htmlNumber = (h3.textContent || '').replace(/[^\d.]/g, '');
          const target = dataTarget !== null ? parseFloat(dataTarget) : (htmlNumber ? parseFloat(htmlNumber) : 0);
          const fixed = parseInt(card.getAttribute('data-fixed') || '0', 10);
          // suffix preference: data-suffix attribute, else preserve any existing suffix text in markup
          const suffixAttr = card.getAttribute('data-suffix');
          const existingSuffix = (h3.querySelector('.suffix') && h3.querySelector('.suffix').textContent) || '';
          const suffix = (suffixAttr !== null ? suffixAttr : existingSuffix) || '';
          // store suffix for animate loop
          h3._suffixText = suffix || '';
          // clear numeric content before anim (keep suffix element if exists)
          // remove only text nodes except suffix element
          // easiest: set textContent then re-add suffix in animate loop
          h3.textContent = '';
          // start animation
          animateValue(h3, isNaN(target) ? 0 : target, fixed);
        });

        // optional: mark 3rd card as selected (index 2)
        const third = grid.querySelectorAll('.impact-card')[2];
        if (third) third.classList.add('selected');

        obs.disconnect();
      });
    }, { threshold: 0.25 });
    gridObserver.observe(grid);
  } else {
    // fallback: animate immediately if grid missing
    document.querySelectorAll('.impact-card').forEach(card => {
      const h3 = card.querySelector('h3');
      if (!h3) return;
      const target = parseFloat(card.getAttribute('data-target') || h3.textContent.replace(/[^\d.]/g,'') || 0);
      const fixed = parseInt(card.getAttribute('data-fixed') || '0', 10);
      const suffix = card.getAttribute('data-suffix') || '';
      h3._suffixText = suffix;
      animateValue(h3, target, fixed);
    });
  }

  // ===== countdown =====
  if (COUNTDOWN_TARGET_ISO) {
    const tgt = new Date(COUNTDOWN_TARGET_ISO);
    if (!isNaN(tgt)) {
      let holder = document.querySelector('.impact-countdown');
      if (!holder) {
        // create holder under .impact-top
        const top = document.querySelector('.impact-top');
        holder = document.createElement('div');
        holder.className = 'impact-countdown fade-up';
        if (top) top.appendChild(holder);
      }
      // create chip
      const chip = document.createElement('div');
      chip.className = 'cd-chip';
      chip.setAttribute('role','status');
      chip.setAttribute('aria-live','polite');
      holder.appendChild(chip);

      function updateCountdown() {
        const now = new Date();
        let diff = tgt - now;
        if (diff <= 0) {
          chip.textContent = 'Offer ended';
          return;
        }
        const days = Math.floor(diff / (1000*60*60*24));
        const hours = Math.floor(diff / (1000*60*60) % 24);
        const mins = Math.floor(diff / (1000*60) % 60);
        const secs = Math.floor(diff / 1000 % 60);
        chip.textContent = `${days}d ${String(hours).padStart(2,'0')}h ${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s left`;
      }

      updateCountdown();
      const tid = setInterval(updateCountdown, 1000);
      // cleanup when time passes
      setTimeout(()=> clearInterval(tid), Math.max(0, tgt - new Date()) + 2000);
    }
  }

  // ===== ensure suffix '+' and '%' are visible even if your CSS used ::after fallback =====
  // If any h3 already includes numeric text + percent/plus inside text, convert to explicit suffix span
  document.querySelectorAll('.impact-card h3').forEach(h3=>{
    // if there's a literal trailing '+' or '%' in the text, extract and move into .suffix
    const txt = (h3.textContent || '').trim();
    const m = txt.match(/([\d,.]+)\s*([+%])$/);
    if (m) {
      const num = m[1];
      const suf = m[2];
      h3.textContent = num;
      ensureSuffixEl(h3, suf);
    }
  });

})();
    
}

{
// SIMPLE TESTIMONIAL AUTO SLIDER (optional)
let testimonials = document.querySelectorAll(".testimonial-card");
let index = 0;

function rotateTestimonials() {
    testimonials[index].style.opacity = 0;
    index = (index + 1) % testimonials.length;
    testimonials[index].style.opacity = 1;
}

setInterval(rotateTestimonials, 5000);

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------
   HERO ANIMATIONS
------------------------------ */
gsap.from(".hero-title", {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out"
});

gsap.from(".hero-desc", {
    y: 40,
    opacity: 0,
    delay: 0.3,
    duration: 1.2,
    ease: "power4.out"
});

gsap.from(".hero-buttons", {
    y: 30,
    opacity: 0,
    delay: 0.5,
    duration: 1,
    ease: "power3.out"
});

/* ------------------------------
   HERO IMAGE CARD FLOAT
------------------------------ */
gsap.to(".hero-card", {
    y: -20,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
});

/* ------------------------------
   STATS SCROLL REVEAL
------------------------------ */
gsap.utils.toArray(".stat").forEach((el, i) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.15,
        ease: "power3.out"
    });
});

/* ------------------------------
   ABOUT SECTION
------------------------------ */
gsap.from(".about-card", {
    scrollTrigger: {
        trigger: ".about-card",
        start: "top 80%",
    },
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out"
});

/* ------------------------------
   IMPACT CARDS
------------------------------ */
gsap.utils.toArray(".impact-card").forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
        },
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.15,
        ease: "power2.out"
    });
});

/* ------------------------------
   TESTIMONIAL
------------------------------ */
gsap.from(".testimonial-card", {
    scrollTrigger: {
        trigger: ".testimonial-card",
        start: "top 85%",
    },
    y: 40,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out"
});



}