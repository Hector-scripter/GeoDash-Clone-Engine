
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LevelData, GameObject, ObjectType, LevelDifficulty } from '../types';
import { TILE_SIZE, COLORS } from '../constants';

interface EditorViewProps {
  level: LevelData;
  onSave: (level: LevelData) => void;
  onExit: () => void;
  onTest: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ level, onSave, onExit, onTest }) => {
  const [objects, setObjects] = useState<GameObject[]>(level.objects);
  const [levelName, setLevelName] = useState(level.name);
  const [difficulty, setDifficulty] = useState<LevelDifficulty>(level.difficulty);
  const [isPlatformer, setIsPlatformer] = useState(!!level.isPlatformer);
  const [history, setHistory] = useState<GameObject[][]>([]);
  const [selectedType, setSelectedType] = useState<ObjectType>(ObjectType.BLOCK);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const pushToHistory = useCallback(() => {
    setHistory(prev => [...prev, [...objects]].slice(-50));
  }, [objects]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setObjects(previousState);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  const handleGridClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left + cameraX) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top + cameraY) / TILE_SIZE);

    if (e.button === 0) {
      const existingIdx = objects.findIndex(obj => obj.x === x && obj.y === y);
      const newObj: GameObject = { id: Math.random().toString(36).substr(2, 9), type: selectedType, x, y };
      if (existingIdx >= 0) {
        if (objects[existingIdx].type !== selectedType) {
          pushToHistory();
          const newObjects = [...objects];
          newObjects[existingIdx] = newObj;
          setObjects(newObjects);
        }
      } else {
        pushToHistory();
        setObjects([...objects, newObj]);
      }
    } else if (e.button === 2) {
      const objectToRemove = objects.find(obj => obj.x === x && obj.y === y);
      if (objectToRemove) {
        pushToHistory();
        setObjects(objects.filter(obj => obj.id !== objectToRemove.id));
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.shiftKey) {
      setCameraY(prev => prev + e.deltaY);
    } else {
      setCameraX(prev => Math.max(0, prev + e.deltaY));
    }
  };

  const saveAndTest = () => {
    onSave({ ...level, objects, name: levelName, difficulty, isPlatformer });
    onTest();
  };

  const clearLevel = () => {
    if (confirm("Clear all objects?")) {
      pushToHistory();
      setObjects([]);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-900 text-white font-sans overflow-hidden">
      <div className="h-16 bg-zinc-950 border-b border-white/10 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-6">
          <button onClick={() => { onSave({ ...level, objects, name: levelName, difficulty, isPlatformer }); onExit(); }} className="hover:text-cyan-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </button>
          <div className="h-8 w-px bg-white/10" />
          <input 
            value={levelName} 
            onChange={e => setLevelName(e.target.value)} 
            className="bg-transparent border-none focus:ring-1 focus:ring-cyan-500 rounded px-2 font-bold text-lg uppercase outline-none w-48"
            placeholder="LEVEL NAME"
          />
          <select 
            value={difficulty} 
            onChange={e => setDifficulty(e.target.value as LevelDifficulty)}
            className="bg-zinc-800 text-[10px] font-black uppercase px-2 py-1 rounded border border-white/10 outline-none cursor-pointer"
            style={{ color: COLORS.DIFFICULTY[difficulty] }}
          >
            {Object.values(LevelDifficulty).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsPlatformer(!isPlatformer)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border ${isPlatformer ? 'bg-purple-600 border-purple-400 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
          >
            {isPlatformer ? 'Platformer Mode: ON' : 'Platformer Mode: OFF'}
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={handleUndo} disabled={history.length === 0} className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-bold transition-all ${history.length === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192z"/>
            </svg>
            UNDO
          </button>
          <button onClick={clearLevel} className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors font-bold">CLEAR</button>
          <button onClick={saveAndTest} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded font-bold shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all">TEST LEVEL</button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        <div className="w-20 bg-zinc-950 border-r border-white/10 flex flex-col items-center py-6 gap-4 z-20 overflow-y-auto scrollbar-hide shrink-0">
          <button onClick={() => setSelectedType(ObjectType.BLOCK)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.BLOCK ? 'bg-cyan-600' : 'bg-white/5'}`} title="Block">
            <div className="w-8 h-8 bg-white rounded-sm" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.SPIKE)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.SPIKE ? 'bg-cyan-600' : 'bg-white/5'}`} title="Spike">
            <div className="w-8 h-8 bg-red-500" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </button>
          <button onClick={() => setSelectedType(ObjectType.ORB)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.ORB ? 'bg-cyan-600' : 'bg-white/5'}`} title="Gravity Orb">
            <div className="w-8 h-8 bg-cyan-400 rounded-full border-2 border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.ORB_YELLOW)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.ORB_YELLOW ? 'bg-cyan-600' : 'bg-white/5'}`} title="Jump Orb">
            <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.ORB_SPIDER)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.ORB_SPIDER ? 'bg-cyan-600' : 'bg-white/5'}`} title="Spider Orb">
            <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.JUMP_PAD)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.JUMP_PAD ? 'bg-cyan-600' : 'bg-white/5'}`} title="Jump Pad">
            <div className="w-8 h-3 bg-yellow-400 rounded-sm mt-2" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PAD_BLUE)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PAD_BLUE ? 'bg-cyan-600' : 'bg-white/5'}`} title="Gravity Pad">
            <div className="w-8 h-3 bg-blue-500 rounded-sm mt-2" />
          </button>
          <div className="w-12 h-px bg-white/10 my-2" />
          <button onClick={() => setSelectedType(ObjectType.PORTAL_WAVE)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_WAVE ? 'bg-cyan-600' : 'bg-white/5'}`} title="Wave Portal">
            <div className="w-6 h-10 bg-cyan-400 rounded-full border border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PORTAL_SHIP)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_SHIP ? 'bg-cyan-600' : 'bg-white/5'}`} title="Ship Portal">
            <div className="w-6 h-10 bg-green-500 rounded-full border border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PORTAL_CUBE)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_CUBE ? 'bg-cyan-600' : 'bg-white/5'}`} title="Cube Portal">
            <div className="w-6 h-10 bg-pink-500 rounded-full border border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PORTAL_BALL)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_BALL ? 'bg-cyan-600' : 'bg-white/5'}`} title="Ball Portal">
            <div className="w-6 h-10 bg-orange-500 rounded-full border border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PORTAL_SWING)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_SWING ? 'bg-cyan-600' : 'bg-white/5'}`} title="Swing Portal">
            <div className="w-6 h-10 bg-sky-500 rounded-full border border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PORTAL_UFO)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_UFO ? 'bg-cyan-600' : 'bg-white/5'}`} title="UFO Portal">
            <div className="w-6 h-10 bg-orange-400 rounded-full border border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PORTAL_ROBOT)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_ROBOT ? 'bg-cyan-600' : 'bg-white/5'}`} title="Robot Portal">
            <div className="w-6 h-10 bg-white rounded-full border border-white" />
          </button>
          <button onClick={() => setSelectedType(ObjectType.PORTAL_SPIDER)} className={`p-2 rounded-lg transition-all ${selectedType === ObjectType.PORTAL_SPIDER ? 'bg-cyan-600' : 'bg-white/5'}`} title="Spider Portal">
            <div className="w-6 h-10 bg-purple-500 rounded-full border border-white" />
          </button>
        </div>

        <div 
          ref={containerRef} 
          className="flex-1 overflow-hidden cursor-crosshair bg-black relative" 
          onMouseDown={handleGridClick} 
          onContextMenu={(e) => { e.preventDefault(); handleGridClick(e); }} 
          onWheel={handleWheel}
        >
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              backgroundImage: `linear-gradient(${COLORS.GRID} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.GRID} 1px, transparent 1px)`, 
              backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`, 
              transform: `translate(${-cameraX % TILE_SIZE}px, ${-cameraY % TILE_SIZE}px)` 
            }} 
          />
          <div className="absolute w-full h-1 bg-cyan-900/50" style={{ top: 10 * TILE_SIZE - cameraY }} />
          <div className="absolute inset-0 pointer-events-none" style={{ transform: `translate(${-cameraX}px, ${-cameraY}px)` }}>
            {objects.map(obj => (
              <div key={obj.id} className="absolute flex items-center justify-center" style={{ left: obj.x * TILE_SIZE, top: obj.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                {obj.type === ObjectType.BLOCK && <div className="w-full h-full bg-white border border-black/20" />}
                {obj.type === ObjectType.SPIKE && <div className="w-full h-full bg-red-500" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />}
                {(obj.type === ObjectType.ORB || obj.type === ObjectType.ORB_YELLOW || obj.type === ObjectType.ORB_SPIDER) && (
                  <div className={`w-2/3 h-2/3 rounded-full border-2 border-white ${obj.type === ObjectType.ORB ? 'bg-cyan-400' : obj.type === ObjectType.ORB_YELLOW ? 'bg-yellow-400' : 'bg-purple-500'}`} />
                )}
                {(obj.type === ObjectType.JUMP_PAD || obj.type === ObjectType.PAD_BLUE) && <div className={`absolute bottom-0 w-4/5 h-1/4 rounded-sm ${obj.type === ObjectType.JUMP_PAD ? 'bg-yellow-400' : 'bg-blue-500'}`} />}
                {obj.type.startsWith('PORTAL_') && (
                  <div 
                    className="w-2/3 h-full rounded-full border-2 border-white" 
                    style={{ backgroundColor: (COLORS as any)[obj.type] }} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorView;
