import { icon } from '../icons.js';

export function AppLogo({ className = '', size = 'md', variant = 'compass_shield' } = {}) {
  const sizeClasses = { sm: 'w-7 h-7 rounded-lg', md: 'w-9 h-9 rounded-xl', lg: 'w-12 h-12 rounded-2xl', xl: 'w-16 h-16 rounded-3xl' }[size];
  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-6 h-6', xl: 'w-8 h-8' }[size];

  let inner;
  if (variant === 'academic_crest') {
    inner = icon('GraduationCap', `${iconSizes} text-cyan-400`);
  } else if (variant === 'star_nexus') {
    inner = icon('Sparkles', `${iconSizes} text-cyan-400`);
  } else {
    inner = `<div class="relative flex items-center justify-center">
      ${icon('Compass', `${iconSizes} text-cyan-400 drop-shadow-sm`)}
      <div class="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
    </div>`;
  }

  return `
    <div class="relative flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform ${sizeClasses} ${className}">
      <div class="w-full h-full bg-slate-900 rounded-[inherit] flex items-center justify-center overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 pointer-events-none"></div>
        ${inner}
      </div>
    </div>
  `;
}
