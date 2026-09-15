import { icon, refreshIcons } from '../icons.js';
import { store } from '../store.js';
import { signUp, signIn, signInDemo } from '../auth.js';

let mode = 'login';
let name = '', email = '', password = '', confirmPassword = '';
let errorMsg = '';
let submitting = false;

function resetForm(initialMode) {
  mode = initialMode;
  name = ''; email = ''; password = ''; confirmPassword = ''; errorMsg = ''; submitting = false;
}

export function renderAuthModal() {
  const root = document.getElementById('auth-modal-root');
  const { authModal } = store.state;
  if (!authModal.isOpen) { root.innerHTML = ''; return; }
  if (mode !== authModal.mode && !root.dataset.initialized) { mode = authModal.mode; }

  root.innerHTML = `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
    <div id="auth-modal-panel" class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      <div class="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative">
        <button id="close-auth-modal-btn" class="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition">${icon('X', 'w-5 h-5')}</button>
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/20">${icon('Sparkles', 'w-3.5 h-3.5 text-cyan-400')}<span>SSAP v3.0</span></div>
        <h2 class="text-xl font-extrabold tracking-tight">${mode === 'login' ? 'Welcome Back to SSAP' : 'Create Your SSAP Account'}</h2>
        <p class="text-xs text-slate-300 mt-1">${mode === 'login' ? 'Sign in to access your unified academic & life command center.' : 'Begin organizing your classes, tasks, personal routines, and goals.'}</p>
        <div class="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl mt-4 border border-slate-700/50">
          <button type="button" id="switch-to-login-tab" class="py-1.5 text-xs font-bold rounded-lg transition ${mode === 'login' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}">Sign In</button>
          <button type="button" id="switch-to-register-tab" class="py-1.5 text-xs font-bold rounded-lg transition ${mode === 'register' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}">Create Account</button>
        </div>
      </div>

      <form id="auth-form" class="p-6 space-y-4">
        ${errorMsg ? `<div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span><span>${errorMsg}</span></div>` : ''}

        ${mode === 'register' ? `
        <div>
          <label for="auth-name-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
          <div class="relative">${icon('User', 'w-4 h-4 text-slate-400 absolute left-3 top-3')}
            <input id="auth-name-input" type="text" required value="${name}" placeholder="e.g., Alex Chen" class="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
          </div>
        </div>` : ''}

        <div>
          <label for="auth-email-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Student Email</label>
          <div class="relative">${icon('Mail', 'w-4 h-4 text-slate-400 absolute left-3 top-3')}
            <input id="auth-email-input" type="email" required value="${email}" placeholder="you@university.edu" class="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
          </div>
        </div>

        <div>
          <label for="auth-password-input" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
          <div class="relative">${icon('Lock', 'w-4 h-4 text-slate-400 absolute left-3 top-3')}
            <input id="auth-password-input" type="password" required value="${password}" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
          </div>
        </div>

        ${mode === 'register' ? `
        <div>
          <label for="auth-confirm-password" class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Confirm Password</label>
          <div class="relative">${icon('Lock', 'w-4 h-4 text-slate-400 absolute left-3 top-3')}
            <input id="auth-confirm-password" type="password" required value="${confirmPassword}" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" />
          </div>
        </div>` : ''}

        <button type="submit" id="auth-submit-btn" ${submitting ? 'disabled' : ''} class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
          <span>${submitting ? 'Please wait\u2026' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          ${icon('ArrowRight', 'w-4 h-4')}
        </button>

        <div class="flex items-center gap-1.5 justify-center text-[11px] text-slate-500 pt-1">${icon('ShieldCheck', 'w-3.5 h-3.5 text-emerald-600')}<span>Authenticated by Supabase. Your data is private to your account.</span></div>

        <div class="relative py-2">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
          <div class="relative flex justify-center text-[11px] uppercase tracking-wider"><span class="bg-white px-2 text-slate-400 font-semibold">Quick Reviewer Access</span></div>
        </div>

        <button type="button" id="demo-student-login-btn" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-2">
          ${icon('CheckCircle2', 'w-4 h-4 text-indigo-600')}<span>Explore as Demo Student (Anonymous Sign-In)</span>
        </button>
      </form>
    </div>
  </div>`;

  wireEvents(root);
  refreshIcons();
}

function closeModal() {
  store.setState({ authModal: { isOpen: false, mode: 'login' } });
}

function wireEvents(root) {
  root.querySelector('#close-auth-modal-btn')?.addEventListener('click', closeModal);
  root.querySelector('#switch-to-login-tab')?.addEventListener('click', () => { mode = 'login'; errorMsg = ''; renderAuthModal(); });
  root.querySelector('#switch-to-register-tab')?.addEventListener('click', () => { mode = 'register'; errorMsg = ''; renderAuthModal(); });

  root.querySelector('#auth-name-input')?.addEventListener('input', (e) => (name = e.target.value));
  root.querySelector('#auth-email-input')?.addEventListener('input', (e) => (email = e.target.value));
  root.querySelector('#auth-password-input')?.addEventListener('input', (e) => (password = e.target.value));
  root.querySelector('#auth-confirm-password')?.addEventListener('input', (e) => (confirmPassword = e.target.value));

  root.querySelector('#demo-student-login-btn')?.addEventListener('click', async () => {
    errorMsg = '';
    submitting = true;
    renderAuthModal();
    try {
      await signInDemo();
      // onAuthStateChange in main.js will pick up the session and close the modal.
    } catch (err) {
      errorMsg = err.message || 'Demo sign-in failed. Make sure Anonymous Sign-ins are enabled in your Supabase project.';
      submitting = false;
      renderAuthModal();
    }
  });

  root.querySelector('#auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg = '';

    if (!email || !email.includes('@')) { errorMsg = 'Please provide a valid email address.'; renderAuthModal(); return; }
    if (password.length < 6) { errorMsg = 'Password must be at least 6 characters long.'; renderAuthModal(); return; }
    if (mode === 'register') {
      if (!name.trim()) { errorMsg = 'Please enter your full name.'; renderAuthModal(); return; }
      if (password !== confirmPassword) { errorMsg = 'Passwords do not match.'; renderAuthModal(); return; }
    }

    submitting = true;
    renderAuthModal();
    try {
      if (mode === 'register') {
        await signUp(name.trim(), email.trim(), password);
        errorMsg = 'Account created! Check your email to confirm, then sign in.';
        mode = 'login';
      } else {
        await signIn(email.trim(), password);
        // onAuthStateChange in main.js picks up the session and closes the modal.
      }
    } catch (err) {
      errorMsg = err.message || 'Authentication failed. Please try again.';
    }
    submitting = false;
    renderAuthModal();
  });
}
