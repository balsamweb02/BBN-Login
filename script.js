// Page load fade-in
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.body.classList.remove('pre-load');
    document.body.classList.add('is-loaded');
  });
});
if (document.readyState === 'complete') {
  document.body.classList.remove('pre-load');
  document.body.classList.add('is-loaded');
}

// ---- Cursor glow (fine-pointer devices only) ----
const cursorGlow = document.getElementById('cursor-glow');
const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (cursorGlow && supportsFineHover) {
  let glowActive = false;
  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.setProperty('--cx', `${e.clientX}px`);
    cursorGlow.style.setProperty('--cy', `${e.clientY}px`);
    if (!glowActive) { cursorGlow.classList.add('active'); glowActive = true; }
  }, { passive: true });
  window.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
    glowActive = false;
  });
}

// ---- Reveal-on-load animations ----
const revealEls = document.querySelectorAll('[data-reveal]');
revealEls.forEach((el) => {
  const delay = el.getAttribute('data-reveal-delay');
  if (delay) el.style.setProperty('--reveal-delay', delay);
});
requestAnimationFrame(() => {
  setTimeout(() => revealEls.forEach((el) => el.classList.add('in-view')), 60);
});

// ---- Subtle magnetic hover on "back to home" ----
const magneticEls = document.querySelectorAll('.magnetic');
if (supportsFineHover) {
  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ---- Gentle 3D tilt on the whole auth shell ----
const shell = document.getElementById('auth-shell');
if (shell && supportsFineHover) {
  shell.addEventListener('mousemove', (e) => {
    const rect = shell.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    shell.style.transform = `rotateX(${py * -2.2}deg) rotateY(${px * 2.6}deg)`;
  });
  shell.addEventListener('mouseleave', () => {
    shell.style.transform = '';
  });
}

// ---- Ripple effect on buttons ----
document.querySelectorAll('.btn, .auth-submit').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// ==========================================================================
// Tab switching (Sign In / Join BBN) with brand-panel narrative swap
// ==========================================================================
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const tabFill = document.getElementById('tab-fill');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const authBrand = document.getElementById('auth-brand');

let authMode = 'login';
const FLIP_CLASSES = ['flip-exit-left', 'flip-exit-right', 'flip-enter-left', 'flip-enter-right'];

function setMode(mode, animate = true) {
  if (mode === authMode) return;
  const goingToRegister = mode === 'register';
  authMode = mode;

  tabLogin.classList.toggle('active', !goingToRegister);
  tabRegister.classList.toggle('active', goingToRegister);
  tabLogin.setAttribute('aria-selected', String(!goingToRegister));
  tabRegister.setAttribute('aria-selected', String(goingToRegister));
  tabFill.classList.toggle('on-register', goingToRegister);

  const incoming = goingToRegister ? formRegister : formLogin;
  const outgoing = goingToRegister ? formLogin : formRegister;

  FLIP_CLASSES.forEach((c) => { incoming.classList.remove(c); outgoing.classList.remove(c); });

  if (animate) {
    // outgoing form flips away toward whichever side it's headed
    outgoing.classList.remove('is-active');
    outgoing.classList.add(goingToRegister ? 'flip-exit-left' : 'flip-exit-right');

    // incoming form starts pre-rotated (no transition), then on the next
    // frame gets its transition back and rotates in to 0deg
    incoming.classList.add(goingToRegister ? 'flip-enter-right' : 'flip-enter-left');
    void incoming.offsetWidth; // force reflow so the start state is committed
    requestAnimationFrame(() => {
      incoming.classList.remove('flip-enter-right', 'flip-enter-left');
      incoming.classList.add('is-active');
    });

    setTimeout(() => {
      outgoing.classList.remove('flip-exit-left', 'flip-exit-right');
    }, 650);
  } else {
    outgoing.classList.remove('is-active');
    incoming.classList.add('is-active');
  }

  // Brand panel narrative swap — CSS handles the crossfade via .is-current
  authBrand.querySelectorAll('.brand-heading').forEach((h) => {
    h.classList.toggle('is-current', h.getAttribute('data-mode') === mode);
  });
  authBrand.querySelectorAll('.brand-sub').forEach((p) => {
    p.classList.toggle('is-current', p.getAttribute('data-mode') === mode);
  });
}

tabLogin.addEventListener('click', () => setMode('login'));
tabRegister.addEventListener('click', () => setMode('register'));
document.querySelectorAll('.switch-link').forEach((btn) => {
  btn.addEventListener('click', () => setMode(btn.dataset.target));
});

// Initialize brand copy visibility to match default (login) mode
document.querySelectorAll('.brand-heading, .brand-sub').forEach((el) => {
  el.classList.toggle('is-current', el.getAttribute('data-mode') === 'login');
});

// ==========================================================================
// Password show/hide toggles
// ==========================================================================
document.querySelectorAll('.field-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const input = document.getElementById(toggle.dataset.target);
    const icon = toggle.querySelector('i');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !isPassword);
    icon.classList.toggle('fa-eye-slash', isPassword);
  });
});

// ==========================================================================
// Live field validity (adds a check icon once filled in)
// ==========================================================================
function wireValidity(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const field = input.closest('.field');
  input.addEventListener('input', () => {
    const valid = input.checkValidity() && input.value.trim().length > 0;
    field.classList.toggle('is-valid', valid);
    field.classList.remove('is-invalid');
  });
}
['login-email', 'reg-name', 'reg-email', 'reg-confirm'].forEach(wireValidity);

// ==========================================================================
// Confirm-password match hint
// ==========================================================================
const regPassword = document.getElementById('reg-password');
const regConfirm = document.getElementById('reg-confirm');
const matchHint = document.getElementById('match-hint');

function checkMatch() {
  if (!regConfirm.value) {
    matchHint.classList.remove('show', 'ok');
    return;
  }
  const match = regConfirm.value === regPassword.value;
  matchHint.textContent = match ? 'Passwords match' : "Passwords don't match yet";
  matchHint.classList.add('show');
  matchHint.classList.toggle('ok', match);
  regConfirm.closest('.field').classList.toggle('is-valid', match);
}
if (regPassword) regPassword.addEventListener('input', checkMatch);
if (regConfirm) regConfirm.addEventListener('input', checkMatch);

// ==========================================================================
// Toast
// ==========================================================================
const toast = document.getElementById('auth-toast');
const toastTitle = document.getElementById('toast-title');
const toastMsg = document.getElementById('toast-msg');
let toastTimer = null;

function showToast(title, msg) {
  toastTitle.textContent = title;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
}

// ==========================================================================
// Form submission (demo only — no backend wired up yet)
// ==========================================================================
function handleSubmit(form, { title, msg }) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation pass: shake any empty/invalid required fields
    let firstInvalid = null;
    form.querySelectorAll('input[required]').forEach((input) => {
      const field = input.closest('.field') || input.closest('.terms-check');
      const valid = input.type === 'checkbox' ? input.checked : input.checkValidity() && input.value.trim();
      if (!valid) {
        if (field) {
          field.classList.add('is-invalid');
          setTimeout(() => field.classList.remove('is-invalid'), 420);
        }
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (form.id === 'form-register' && regPassword.value && regConfirm.value && regPassword.value !== regConfirm.value) {
      firstInvalid = firstInvalid || regConfirm;
      const field = regConfirm.closest('.field');
      field.classList.add('is-invalid');
      setTimeout(() => field.classList.remove('is-invalid'), 420);
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const btn = form.querySelector('.auth-submit');
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.classList.add('success');
      showToast(title, msg);
      setTimeout(() => {
        btn.classList.remove('success');
        btn.disabled = false;
      }, 1600);
    }, 1100);
  });
}

handleSubmit(formLogin, {
  title: 'Registration not live yet',
  msg: "Sign-in for Balsam Business Network isn't active yet — stay tuned for launch.",
});
handleSubmit(formRegister, {
  title: 'Thanks for your interest!',
  msg: "Founding member registration isn't live yet — stay tuned for updates.",
});