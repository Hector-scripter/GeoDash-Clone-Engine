
import React from 'react';
import { AppSettings } from '../types';

interface MenuViewProps {
  settings: AppSettings;
  onPlay: () => void;
  onTower: () => void;
  onSettings: () => void;
  onShop: () => void;
  onAchievements: () => void;
  onMultiplayer: () => void;
}

const MenuView: React.FC<MenuViewProps> = ({ settings, onPlay, onTower, onSettings, onShop, onAchievements, onMultiplayer }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-black">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px' 
        }} />
      </div>

      {/* Title Section */}
      <div className="z-10 text-center mb-16 animate-in fade-in slide-in-from-top-12 duration-1000">
        <div className="relative inline-block">
          <div className="absolute -inset-4 blur-2xl bg-cyan-500/30 rounded-full animate-pulse" />
          <h1 className="relative text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_8px_0_rgba(0,0,0,0.5)]">
            GEO<span className="text-cyan-400">DASH</span>
          </h1>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
          <p className="text-cyan-500/80 font-bold tracking-[0.4em] text-xs uppercase">Clone Engine v2.0</p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
        </div>
      </div>

      {/* Mana Orbs Display */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
        <span className="text-xl font-black text-white">{settings.manaOrbs}</span>
      </div>

      {/* Main Buttons Grid */}
      <div className="z-10 flex items-center gap-8 animate-in zoom-in fade-in duration-700 delay-300">
        <div className="flex flex-col gap-4">
          {/* Shop Button */}
          <button 
            onClick={onShop}
            className="group relative w-24 h-24 bg-zinc-800 border-4 border-zinc-700 rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:border-cyan-500 active:scale-90 shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
            </svg>
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-cyan-500 tracking-widest uppercase">Shop</div>
          </button>
          {/* Multiplayer Button */}
          <button 
            onClick={onMultiplayer}
            className="group relative w-24 h-24 bg-zinc-800 border-4 border-zinc-700 rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:border-emerald-500 active:scale-90 shadow-xl"
          >
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-800 animate-pulse" />
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="text-emerald-400" viewBox="0 0 16 16">
              <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-emerald-500 tracking-widest uppercase text-center w-24">Versus</div>
          </button>
        </div>

        {/* Huge Play Button */}
        <button 
          onClick={onPlay}
          className="group relative w-48 h-48 bg-white rounded-3xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 w-0 h-0 border-t-[30px] border-t-transparent border-l-[50px] border-l-black group-hover:border-l-white border-bottom-[30px] border-bottom-transparent ml-4 transition-colors" />
        </button>

        <div className="flex flex-col gap-4">
          {/* Tower Button */}
          <button 
            onClick={onTower}
            className="group relative w-24 h-24 bg-zinc-800 border-4 border-zinc-700 rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:border-orange-500 active:scale-90 shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="text-orange-400" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 2h1v1H4V2zM1 10h1v1H1v-1zm1-3h1v1H2V7zm5-4h1v1H7V3zM3 14h1v1H3v-1zm9-12h1v1h-1V2zM8 12h1v1H8v-1zM5 8h1v1H5V8zm1-3h1v1H6V5zm3-3h1v1H9V2z"/>
            </svg>
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-orange-500 tracking-widest uppercase text-center w-24">The Tower</div>
          </button>
          
          {/* Settings Button */}
          <button 
            onClick={onSettings}
            className="group relative w-24 h-24 bg-zinc-800 border-4 border-zinc-700 rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:border-yellow-500 active:scale-90 shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white group-hover:text-yellow-400 transition-colors animate-[spin_10s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2 2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-yellow-500 tracking-widest uppercase">Options</div>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-12 z-10 flex gap-12 animate-in slide-in-from-bottom-8 duration-700 delay-500">
        <div className="text-center">
          <div className="text-cyan-400 font-black text-2xl">{settings.stats.levelsCompleted}</div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-black text-2xl">{settings.stats.totalJumps}</div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Jumps</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-black text-2xl">{settings.stats.totalDeaths}</div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Deaths</div>
        </div>
      </div>

      {/* Decorative Floor */}
      <div className="absolute bottom-0 w-full h-24 bg-zinc-950 border-t-4 border-cyan-500/30 overflow-hidden">
        <div className="w-[200%] h-full flex animate-[slide_2s_linear_infinite]" style={{ 
          backgroundImage: `linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 100%'
        }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-40px); }
        }
      `}} />
    </div>
  );
};

export default MenuView;
