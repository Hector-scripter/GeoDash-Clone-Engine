
import React from 'react';
import { AppSettings } from '../types';
import { ACHIEVEMENTS } from '../constants';

interface AchievementViewProps {
  settings: AppSettings;
  onBack: () => void;
}

const AchievementView: React.FC<AchievementViewProps> = ({ settings, onBack }) => {
  return (
    <div className="w-full h-full flex flex-col items-center bg-zinc-950 p-8 overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black italic text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">BADGES</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Your achievements and milestones</p>
          </div>
          <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
           {[
             { label: 'JUMPS', value: settings.stats.totalJumps, color: 'text-yellow-400' },
             { label: 'DEATHS', value: settings.stats.totalDeaths, color: 'text-red-400' },
             { label: 'COMPLETED', value: settings.stats.levelsCompleted, color: 'text-cyan-400' },
             { label: 'SPENT', value: settings.stats.orbsSpent, color: 'text-purple-400' }
           ].map(stat => (
             <div key={stat.label} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-zinc-500 font-black">{stat.label}</span>
             </div>
           ))}
        </div>

        {/* Achievement Grid */}
        <div className="space-y-4">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = settings.unlockedAchievements.includes(ach.id);
            return (
              <div 
                key={ach.id}
                className={`p-6 rounded-2xl border-2 flex items-center gap-6 transition-all ${unlocked ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-800/50 border-white/5 opacity-60'}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${unlocked ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-zinc-700 text-zinc-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.315 15h.685a.5.5 0 0 1 0 1H2a.5.5 0 0 1 0-1h.685l1.815-1.24a1.502 1.502 0 0 0 .537-.255L6.463 13.14a.5.5 0 0 1-.463-.49V10.437c-.955-.234-2.043-1.146-2.833-3.011a3 3 0 1 1-1.132-5.89A33.776 33.776 0 0 1 2.5.5z"/>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl font-black uppercase tracking-tight ${unlocked ? 'text-white' : 'text-zinc-500'}`}>
                      {ach.title}
                    </h3>
                    {unlocked && (
                      <span className="bg-purple-500/20 text-purple-400 text-[10px] font-black px-2 py-0.5 rounded border border-purple-500/30">
                        EARNED
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">{ach.description}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <div className={`w-3 h-3 rounded-full ${unlocked ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-zinc-600'}`} />
                    <span className={`font-black text-lg ${unlocked ? 'text-cyan-400' : 'text-zinc-500'}`}>+{ach.reward}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase">ORBS</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AchievementView;
