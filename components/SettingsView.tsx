
import React from 'react';
import { AppSettings, PlayerMode } from '../types';
import PlayerIcon from './PlayerIcon';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
}

const PALETTE = [
  '#00ffff', '#00ccff', '#0099ff', '#0066ff', '#0033ff', 
  '#3300ff', '#6600ff', '#9900ff', '#cc00ff', '#ff00ff',
  '#ff00cc', '#ff0099', '#ff0066', '#ff0033', '#ff0000',
  '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00',
  '#ccff00', '#99ff00', '#66ff00', '#33ff00', '#00ff00',
  '#00ff33', '#00ff66', '#00ff99', '#00ffcc', '#ffffff',
  '#cccccc', '#999999', '#666666', '#333333', '#000000'
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onBack }) => {
  const updateField = (field: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  const iconOptions = [0, 1, 2, 3];
  const shipOptions = [0, 1, 2, 3];
  const ballOptions = [0, 1, 2];
  const waveOptions = [0, 1, 2];
  const ufoOptions = [0, 1, 2];
  const robotOptions = [0, 1, 2];
  const spiderOptions = [0, 1];
  const swingOptions = [0, 1, 2, 3];

  const isUnlocked = (type: string, id: number) => {
    if (type === 'cube') return settings.unlockedCubes.includes(id);
    if (type === 'ship') return settings.unlockedShips.includes(id);
    if (type === 'ball') return settings.unlockedBalls.includes(id);
    if (type === 'wave') return settings.unlockedWaves.includes(id);
    if (type === 'ufo') return settings.unlockedUfos.includes(id);
    if (type === 'robot') return settings.unlockedRobots.includes(id);
    if (type === 'spider') return settings.unlockedSpiders.includes(id);
    if (type === 'swing') return settings.unlockedSwings.includes(id);
    return false;
  };

  const ColorGrid = ({ label, current, field }: { label: string, current: string, field: keyof AppSettings }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-xs font-black tracking-[0.2em] text-zinc-500 uppercase">{label}</label>
        <div className="w-6 h-6 rounded-md border border-white/20 shadow-lg" style={{ backgroundColor: current }} />
      </div>
      <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
        {PALETTE.map(color => (
          <button
            key={color}
            onClick={() => updateField(field, color)}
            className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-110 active:scale-95 ${current === color ? 'border-white ring-2 ring-cyan-500/50 scale-110' : 'border-transparent hover:border-white/30'}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center p-8 bg-zinc-950 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black italic tracking-widest text-white">CUSTOMIZE</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Design your player icon</p>
          </div>
          <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 hover:scale-105 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
          </button>
        </div>

        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ColorGrid label="Primary Color" current={settings.playerColor} field="playerColor" />
            <ColorGrid label="Secondary Color" current={settings.playerColorSecondary} field="playerColorSecondary" />
          </div>

          <div className="h-px bg-white/5 w-full" />

          <div className="space-y-12">
            {[
              { label: 'Cube Skins', type: 'cube', mode: 'CUBE' as PlayerMode, options: iconOptions, field: 'iconId' as const },
              { label: 'Ship Skins', type: 'ship', mode: 'SHIP' as PlayerMode, options: shipOptions, field: 'shipId' as const },
              { label: 'Ball Skins', type: 'ball', mode: 'BALL' as PlayerMode, options: ballOptions, field: 'ballId' as const },
              { label: 'Wave Skins', type: 'wave', mode: 'WAVE' as PlayerMode, options: waveOptions, field: 'waveId' as const },
              { label: 'UFO Skins', type: 'ufo', mode: 'UFO' as PlayerMode, options: ufoOptions, field: 'ufoId' as const },
              { label: 'Swing Skins', type: 'swing', mode: 'SWING' as PlayerMode, options: swingOptions, field: 'swingId' as const },
              { label: 'Robot Skins', type: 'robot', mode: 'ROBOT' as PlayerMode, options: robotOptions, field: 'robotId' as const },
              { label: 'Spider Skins', type: 'spider', mode: 'SPIDER' as PlayerMode, options: spiderOptions, field: 'spiderId' as const }
            ].map(group => (
              <div key={group.label} className="space-y-4">
                <label className="text-xs font-black tracking-[0.2em] text-zinc-500 uppercase">{group.label}</label>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {group.options.map(id => {
                    const unlocked = isUnlocked(group.type, id);
                    return (
                      <button
                        key={id}
                        disabled={!unlocked}
                        onClick={() => updateField(group.field, id)}
                        className={`shrink-0 w-20 h-20 rounded-xl border-4 transition-all flex items-center justify-center overflow-hidden relative snap-start ${!unlocked ? 'opacity-30 cursor-not-allowed bg-zinc-800' : (settings as any)[group.field] === id ? 'border-cyan-500 bg-cyan-500/10 scale-105 shadow-[0_0_20px_rgba(34,204,255,0.3)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                      >
                         <PlayerIcon 
                           mode={group.mode} 
                           id={id} 
                           primaryColor={settings.playerColor} 
                           secondaryColor={settings.playerColorSecondary} 
                           size={50}
                         />
                         { !unlocked && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg></div> }
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-white/5 w-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-xs font-black tracking-[0.2em] text-zinc-500 uppercase">Music Volume</label>
              <input type="range" min="0" max="100" value={settings.musicVolume} onChange={(e) => updateField('musicVolume', parseInt(e.target.value))} className="w-full accent-cyan-500" />
              <div className="text-right font-mono text-cyan-500 text-sm">{settings.musicVolume}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
