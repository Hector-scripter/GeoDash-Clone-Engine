
import React from 'react';
import { LevelData, LevelDifficulty } from '../types';
import { COLORS } from '../constants';

interface LevelSelectViewProps {
  levels: LevelData[];
  title?: string;
  onSelect: (level: LevelData, mode: 'PLAY' | 'EDIT') => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const LevelSelectView: React.FC<LevelSelectViewProps> = ({ levels, title = "SELECT LEVEL", onSelect, onCreate, onDelete, onBack }) => {
  const getDifficultyColor = (diff: LevelDifficulty) => {
    return COLORS.DIFFICULTY[diff] || COLORS.DIFFICULTY.NORMAL;
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-8 overflow-y-auto bg-zinc-950">
      <div className="w-full max-w-6xl flex justify-between items-center mb-12">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
        </button>
        <h2 className={`text-4xl font-black italic tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${title === "THE TOWER" ? "text-orange-400" : "text-white"}`}>
          {title}
        </h2>
        <button 
          onClick={onCreate}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)]"
        >
          NEW LEVEL
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((lvl) => (
          <div 
            key={lvl.id}
            className="group relative bg-zinc-900/50 border border-white/10 p-6 rounded-2xl hover:border-cyan-500/50 hover:bg-zinc-900 transition-all duration-300 flex flex-col gap-6"
            style={{ borderLeft: `4px solid ${getDifficultyColor(lvl.difficulty)}` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                  {lvl.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] font-black px-2 py-0.5 rounded text-black" 
                    style={{ backgroundColor: getDifficultyColor(lvl.difficulty) }}
                  >
                    {lvl.difficulty}
                  </span>
                  <p className="text-xs text-zinc-500 font-mono">
                    {lvl.objects.length} OBJECTS
                  </p>
                  {lvl.isPlatformer && (
                    <span className="text-[8px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1 rounded font-black">PLATFORMER</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onDelete(lvl.id)}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                title="Delete Level"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => onSelect(lvl, 'PLAY')}
                className="flex-1 py-3 bg-white text-black font-black rounded-lg hover:bg-cyan-400 transition-colors"
              >
                PLAY
              </button>
              <button 
                onClick={() => onSelect(lvl, 'EDIT')}
                className="flex-1 py-3 bg-zinc-800 text-white font-black rounded-lg hover:bg-zinc-700 border border-white/5 transition-colors"
              >
                EDIT
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {levels.length === 0 && (
        <div className="mt-20 text-center">
          <p className="text-zinc-500 text-xl font-medium mb-6">NO LEVELS FOUND</p>
          <button 
            onClick={onCreate}
            className="text-cyan-500 hover:text-cyan-400 font-bold underline"
          >
            CREATE YOUR FIRST ONE
          </button>
        </div>
      )}
    </div>
  );
};

export default LevelSelectView;
