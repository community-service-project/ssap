import { icon, refreshIcons } from '../icons.js';
import { store, navigateTo } from '../store.js';
import { CREATORS_DATA } from '../initialData.js';

function socialLink(url, iconName, title, hoverCls) {
  if (!url) return '';
  const href = title === 'Email Lead' ? `mailto:${url}` : url;
  const target = title === 'Email Lead' ? '' : 'target="_blank" rel="noreferrer"';
  return `<a href="${href}" ${target} title="${title}" class="p-2 rounded-xl bg-slate-800/80 ${hoverCls} border border-slate-700 text-slate-300 hover:text-white transition">${icon(iconName, 'w-4 h-4')}</a>`;
}

export function renderCreators(root) {
  const isLoggedIn = store.state.isLoggedIn;
  const mentor = CREATORS_DATA.find((c) => c.category === 'mentor');
  const leader = CREATORS_DATA.find((c) => c.category === 'leader');
  const members = CREATORS_DATA.filter((c) => c.category === 'member');

  root.innerHTML = `
  <div class="bg-slate-900 text-white min-h-screen py-10 sm:py-16 selection:bg-cyan-500 selection:text-slate-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between pb-6 border-b border-slate-800 mb-10">
        <button id="creators-back-to-app-btn" class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition">${icon('ArrowLeft', 'w-4 h-4')}<span>${isLoggedIn ? 'Back to Dashboard' : 'Home / Back to SSAP'}</span></button>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">${icon('Users', 'w-3.5 h-3.5 text-cyan-400')}<span>Official Engineering &amp; Advisory Team</span></div>
      </div>

      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold mb-3">${icon('Sparkles', 'w-3.5 h-3.5 text-cyan-400')}<span>SSAP Creators &amp; Academic Leadership</span></div>
        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight">Meet the Minds Behind SSAP</h1>
        <p class="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">SSAP was conceived, architected, and built by a team of university software engineers under distinguished faculty mentorship. Our goal is to replace fragmented, ad-ridden SaaS tools with a free, self-hostable, privacy-first student productivity system.</p>
      </div>

      ${mentor ? `
      <div class="mb-14">
        <div class="flex items-center gap-2 mb-4">${icon('GraduationCap', 'w-5 h-5 text-indigo-400')}<h2 class="text-xs font-bold uppercase tracking-widest text-indigo-400">1. Project Mentor \u2014 Distinguished Advisory</h2></div>
        <div id="mentor-featured-card" class="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-2 border-indigo-500/40 p-6 sm:p-8 shadow-2xl shadow-indigo-950/60 overflow-hidden">
          <div class="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8 relative z-10">
            <div class="relative shrink-0">
              <div class="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-indigo-400/60 shadow-xl"><img src="${mentor.avatar}" alt="${mentor.name}" class="w-full h-full object-cover" /></div>
              <span class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">Faculty Mentor</span>
            </div>
            <div class="flex-1 text-center lg:text-left">
              <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div><h3 class="text-2xl sm:text-3xl font-black text-white">${mentor.name}</h3><p class="text-sm font-semibold text-indigo-300 mt-0.5">${mentor.role}</p></div>
                <div class="flex items-center justify-center lg:justify-end gap-2 pt-2 sm:pt-0">
                  ${socialLink(mentor.socialLinks.website, 'Globe', 'Faculty Profile', 'hover:bg-indigo-600/40')}
                  ${socialLink(mentor.socialLinks.linkedin, 'Linkedin', 'LinkedIn', 'hover:bg-indigo-600/40')}
                  ${socialLink(mentor.socialLinks.github, 'Github', 'GitHub', 'hover:bg-indigo-600/40')}
                </div>
              </div>
              <p class="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">${mentor.bio}</p>
              <div class="mt-6 pt-5 border-t border-slate-800/80">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Advisory &amp; Architectural Guidance</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  ${mentor.contributions.map((c) => `<div class="flex items-start gap-2">${icon('Award', 'w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5')}<span>${c}</span></div>`).join('')}
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-1.5 justify-center lg:justify-start">${mentor.skills.map((s) => `<span class="px-2.5 py-0.5 rounded-md bg-indigo-900/50 border border-indigo-700/50 text-indigo-200 text-[11px] font-medium">${s}</span>`).join('')}</div>
            </div>
          </div>
        </div>
      </div>` : ''}

      ${leader ? `
      <div class="mb-14">
        <div class="flex items-center gap-2 mb-4">${icon('Cpu', 'w-5 h-5 text-cyan-400')}<h2 class="text-xs font-bold uppercase tracking-widest text-cyan-400">2. Team Leader &amp; Systems Architect</h2></div>
        <div id="team-leader-card" class="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-cyan-500/40 p-6 sm:p-8 shadow-xl overflow-hidden">
          <div class="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8">
            <div class="relative shrink-0">
              <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-lg"><img src="${leader.avatar}" alt="${leader.name}" class="w-full h-full object-cover" /></div>
              <span class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md whitespace-nowrap">Team Leader</span>
            </div>
            <div class="flex-1 text-center lg:text-left">
              <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div><h3 class="text-xl sm:text-2xl font-black text-white">${leader.name}</h3><p class="text-sm font-semibold text-cyan-300 mt-0.5">${leader.role}</p></div>
                <div class="flex items-center justify-center lg:justify-end gap-2 pt-2 sm:pt-0">
                  ${socialLink(leader.socialLinks.email, 'Mail', 'Email Lead', 'hover:bg-cyan-600/40')}
                  ${socialLink(leader.socialLinks.linkedin, 'Linkedin', 'LinkedIn', 'hover:bg-cyan-600/40')}
                  ${socialLink(leader.socialLinks.github, 'Github', 'GitHub', 'hover:bg-cyan-600/40')}
                </div>
              </div>
              <p class="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">${leader.bio}</p>
              <div class="mt-5 pt-4 border-t border-slate-800">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Contributions</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  ${leader.contributions.map((c) => `<div class="flex items-start gap-2">${icon('Code2', 'w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5')}<span>${c}</span></div>`).join('')}
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-1.5 justify-center lg:justify-start">${leader.skills.map((s) => `<span class="px-2.5 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-800/50 text-cyan-200 text-[11px] font-medium">${s}</span>`).join('')}</div>
            </div>
          </div>
        </div>
      </div>` : ''}

      <div>
        <div class="flex items-center gap-2 mb-6">${icon('Users', 'w-5 h-5 text-teal-400')}<h2 class="text-xs font-bold uppercase tracking-widest text-teal-400">3. Core Engineering &amp; Design Team</h2></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${members.map((member) => `
          <div id="member-card-${member.id}" class="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80 shadow-md hover:border-slate-600 transition flex flex-col justify-between">
            <div>
              <div class="flex items-start gap-4 mb-4">
                <div class="w-16 h-16 rounded-xl overflow-hidden border border-slate-600 shrink-0"><img src="${member.avatar}" alt="${member.name}" class="w-full h-full object-cover" /></div>
                <div><h3 class="text-base font-bold text-white">${member.name}</h3><p class="text-xs font-medium text-cyan-300 mt-0.5">${member.role}</p><span class="inline-block mt-1 px-2 py-0.5 rounded bg-slate-700/70 text-slate-300 text-[10px] font-semibold">${member.badge}</span></div>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">${member.bio}</p>
              <div class="mt-4 pt-3 border-t border-slate-700/60">
                <h5 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Focus Areas</h5>
                <ul class="space-y-1 text-xs text-slate-300">${member.contributions.slice(0, 3).map((item) => `<li class="flex items-start gap-1.5"><span class="text-cyan-400 font-bold">\u2022</span><span>${item}</span></li>`).join('')}</ul>
              </div>
            </div>
            <div class="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <div class="flex flex-wrap gap-1">${member.skills.slice(0, 2).map((s) => `<span class="px-2 py-0.5 rounded bg-slate-700/50 text-[10px] text-slate-300 font-mono">${s}</span>`).join('')}</div>
              <div class="flex items-center gap-1.5">
                ${member.socialLinks.github ? `<a href="${member.socialLinks.github}" target="_blank" rel="noreferrer" class="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition">${icon('Github', 'w-3.5 h-3.5')}</a>` : ''}
                ${member.socialLinks.linkedin ? `<a href="${member.socialLinks.linkedin}" target="_blank" rel="noreferrer" class="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition">${icon('Linkedin', 'w-3.5 h-3.5')}</a>` : ''}
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <div class="mt-16 text-center pt-8 border-t border-slate-800">
        <button id="creators-bottom-home-btn" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 transition">${icon('ArrowLeft', 'w-4 h-4')}<span>Return to ${isLoggedIn ? 'Dashboard' : 'SSAP Overview'}</span></button>
      </div>
    </div>
  </div>`;

  root.querySelector('#creators-back-to-app-btn')?.addEventListener('click', () => navigateTo(isLoggedIn ? 'dashboard' : 'landing'));
  root.querySelector('#creators-bottom-home-btn')?.addEventListener('click', () => navigateTo(isLoggedIn ? 'dashboard' : 'landing'));

  refreshIcons();
}
