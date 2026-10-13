
import React, { useState } from 'react';
import { AppSettings, PlayerMode } from '../types';
import PlayerIcon from './PlayerIcon';

interface ShopViewProps {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  onBack: () => void;
}

interface ShopItem {
  id: number;
  type: 'cube' | 'ship' | 'ball' | 'ufo' | 'robot' | 'spider' | 'swing';
  mode: PlayerMode;
  price: number;
  name: string;
}

const ITEMS: ShopItem[] = [
  { id: 1, type: 'cube', mode: 'CUBE', price: 100, name: 'Crosstown' },
  { id: 2, type: 'cube', mode: 'CUBE', price: 250, name: 'Double Box' },
  { id: 3, type: 'cube', mode: 'CUBE', price: 500, name: 'Dotty' },
  { id: 1, type: 'ship', mode: 'SHIP', price: 150, name: 'Rocket' },
  { id: 2, type: 'ship', mode: 'SHIP', price: 300, name: 'Cargo' },
  { id: 3, type: 'ship', mode: 'SHIP', price: 600, name: 'Fighter' },
  { id: 4, type: 'ship', mode: 'SHIP', price: 1200, name: 'Bat-Wing' },
  { id: 5, type: 'ship', mode: 'SHIP', price: 2000, name: 'Scout' },
  { id: 6, type: 'ship', mode: 'SHIP', price: 3500, name: 'Dreadnought' },
  { id: 1, type: 'ball', mode: 'BALL', price: 200, name: 'Sawblade' },
  { id: 2, type: 'ball', mode: 'BALL', price: 400, name: 'Target' },
  { id: 3, type: 'ball', mode: 'BALL', price: 800, name: 'Gearbox' },
  { id: 4, type: 'ball', mode: 'BALL', price: 1500, name: 'Solar' },
  { id: 5, type: 'ball', mode: 'BALL', price: 2500, name: 'Flow' },
  { id: 6, type: 'ball', mode: 'BALL', price: 4000, name: 'Grid' },
  { id: 1, type: 'swing', mode: 'SWING', price: 400, name: 'Capsule' },
  { id: 2, type: 'swing', mode: 'SWING', price: 1000, name: 'Star-Flyer' },
  { id: 3, type: 'swing', mode: 'SWING', price: 2500, name: 'Apex' },
  { id: 1, type: 'ufo', mode: 'UFO', price: 200, name: 'Spiky Disc' },
  { id: 2, type: 'ufo', mode: 'UFO', price: 450, name: 'Ringed' },
  { id: 1, type: 'robot', mode: 'ROBOT', price: 300, name: 'Heaver' },
  { id: 2, type: 'robot', mode: 'ROBOT', price: 600, name: 'Slim-Line' },
  { id: 1, type: 'spider', mode: 'SPIDER', price: 400, name: 'Crabber' },
];

const ShopView: React.FC<ShopViewProps> = ({ settings, onUpdate, onBack }) => {
  const [tab, setTab] = useState<'cube' | 'ship' | 'ball' | 'ufo' | 'robot' | 'spider' | 'swing'>('cube');

  const buyItem = (item: ShopItem) => {
    if (settings.manaOrbs < item.price) {
      alert("Not enough Mana Orbs!");
      return;
    }
    const newSettings = { 
      ...settings, 
      manaOrbs: settings.manaOrbs - item.price,
      stats: { ...settings.stats, orbsSpent: settings.stats.orbsSpent + item.price }
    };
    if (item.type === 'cube') newSettings.unlockedCubes = [...settings.unlockedCubes, item.id];
    if (item.type === 'ship') newSettings.unlockedShips = [...settings.unlockedShips, item.id];
    if (item.type === 'ball') newSettings.unlockedBalls = [...settings.unlockedBalls, item.id];
    if (item.type === 'ufo') newSettings.unlockedUfos = [...settings.unlockedUfos, item.id];
    if (item.type === 'robot') newSettings.unlockedRobots = [...settings.unlockedRobots, item.id];
    if (item.type === 'spider') newSettings.unlockedSpiders = [...settings.unlockedSpiders, item.id];
    if (item.type === 'swing') newSettings.unlockedSwings = [...settings.unlockedSwings, item.id];
    onUpdate(newSettings);
  };

  const isUnlocked = (item: ShopItem) => {
    if (item.type === 'cube') return settings.unlockedCubes.includes(item.id);
    if (item.type === 'ship') return settings.unlockedShips.includes(item.id);
    if (item.type === 'ball') return settings.unlockedBalls.includes(item.id);
    if (item.type === 'ufo') return settings.unlockedUfos.includes(item.id);
    if (item.type === 'robot') return settings.unlockedRobots.includes(item.id);
    if (item.type === 'spider') return settings.unlockedSpiders.includes(item.id);
    if (item.type === 'swing') return settings.unlockedSwings.includes(item.id);
    return false;
  };

  const filteredItems = ITEMS.filter(i => i.type === tab);

  return (
    <div className="w-full h-full flex flex-col items-center bg-zinc-950 p-8 overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black italic text-cyan-400 drop-shadow-[0_0_10px_cyan]">THE SHOP</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Trade your Mana Orbs for new skins</p>
          </div>
          <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-2xl border border-cyan-400/20 mb-8 w-fit">
          <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]" />
          <span className="text-3xl font-black text-white">{settings.manaOrbs}</span>
        </div>
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {(['cube', 'ship', 'ball', 'swing', 'ufo', 'robot', 'spider'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all border shrink-0 ${tab === t ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}`}>{t}S</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const unlocked = isUnlocked(item);
            return (
              <div key={`${item.type}-${item.id}`} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${unlocked ? 'bg-white/5 border-white/10' : 'bg-zinc-800 border-zinc-700 hover:border-cyan-500/50'}`}>
                <div className="w-24 h-24 bg-black/40 rounded-xl flex items-center justify-center relative border border-white/5">
                  <PlayerIcon 
                    mode={item.mode} 
                    id={item.id} 
                    primaryColor={settings.playerColor} 
                    secondaryColor={settings.playerColorSecondary} 
                    size={60}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-white uppercase tracking-tight">{item.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1"><div className="w-3 h-3 rounded-full bg-cyan-400" /><span className="text-sm font-black text-cyan-400">{item.price}</span></div>
                </div>
                <button disabled={unlocked} onClick={() => buyItem(item)} className={`w-full py-2 rounded-lg font-black uppercase transition-all ${unlocked ? 'bg-zinc-700 text-zinc-500 cursor-default' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95'}`}>{unlocked ? 'UNLOCKED' : 'PURCHASE'}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopView;
