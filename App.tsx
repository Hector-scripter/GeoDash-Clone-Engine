
import React, { useState, useEffect, useCallback } from 'react';
import MenuView from './components/MenuView';
import GameView from './components/GameView';
import EditorView from './components/EditorView';
import LevelSelectView from './components/LevelSelectView';
import SettingsView from './components/SettingsView';
import ShopView from './components/ShopView';
import AchievementView from './components/AchievementView';
import { GameState, LevelData, ObjectType, LevelDifficulty, AppSettings } from './types';
import { ACHIEVEMENTS } from './constants';

const INITIAL_LEVELS: LevelData[] = [
  {
    id: 'default-1',
    name: "Stereo Madness",
    difficulty: LevelDifficulty.EASY,
    objects: [
      { id: '1', type: ObjectType.BLOCK, x: 5, y: 9 },
      { id: '2', type: ObjectType.BLOCK, x: 6, y: 9 },
      { id: '3', type: ObjectType.BLOCK, x: 7, y: 9 },
      { id: '4', type: ObjectType.SPIKE, x: 10, y: 9 },
      { id: '5', type: ObjectType.BLOCK, x: 12, y: 8 },
      { id: '6', type: ObjectType.BLOCK, x: 13, y: 8 },
      { id: '7', type: ObjectType.SPIKE, x: 15, y: 9 },
      { id: '8', type: ObjectType.PORTAL_SHIP, x: 25, y: 7 },
      { id: '9', type: ObjectType.PORTAL_CUBE, x: 45, y: 7 },
    ]
  },
  {
    id: 'default-2',
    name: "Back on Track",
    difficulty: LevelDifficulty.EASY,
    objects: [
      { id: 'b1', type: ObjectType.BLOCK, x: 5, y: 9 },
      { id: 'b2', type: ObjectType.BLOCK, x: 6, y: 9 },
      { id: 'b3', type: ObjectType.JUMP_PAD, x: 8, y: 9 },
      { id: 'b4', type: ObjectType.BLOCK, x: 12, y: 6 },
      { id: 'b5', type: ObjectType.BLOCK, x: 13, y: 6 },
      { id: 'b6', type: ObjectType.SPIKE, x: 17, y: 9 },
      { id: 'b7', type: ObjectType.BLOCK, x: 20, y: 8 },
      { id: 'b8', type: ObjectType.ORB_YELLOW, x: 22, y: 7 },
      { id: 'b9', type: ObjectType.BLOCK, x: 25, y: 5 },
      { id: 'b10', type: ObjectType.BLOCK, x: 26, y: 5 },
      { id: 'b11', type: ObjectType.SPIKE, x: 35, y: 9 },
      { id: 'b12', type: ObjectType.SPIKE, x: 36, y: 9 },
    ]
  },
  {
    id: 'default-3',
    name: "Multi-Modality",
    difficulty: LevelDifficulty.INSANE,
    objects: [
      { id: 'm1', type: ObjectType.PORTAL_BALL, x: 10, y: 8 },
      { id: 'm2', type: ObjectType.BLOCK, x: 15, y: 9 }, { id: 'm3', type: ObjectType.BLOCK, x: 15, y: 4 },
      { id: 'm4', type: ObjectType.BLOCK, x: 20, y: 9 }, { id: 'm5', type: ObjectType.BLOCK, x: 20, y: 4 },
      { id: 'm6', type: ObjectType.SPIKE, x: 18, y: 9 }, { id: 'm7', type: ObjectType.SPIKE, x: 18, y: 4.5 },
      { id: 'm8', type: ObjectType.PORTAL_UFO, x: 30, y: 6 },
      { id: 'm9', type: ObjectType.BLOCK, x: 35, y: 8 }, { id: 'm10', type: ObjectType.BLOCK, x: 35, y: 3 },
      { id: 'm11', type: ObjectType.BLOCK, x: 40, y: 7 }, { id: 'm12', type: ObjectType.BLOCK, x: 40, y: 2 },
      { id: 'm13', type: ObjectType.BLOCK, x: 45, y: 8 }, { id: 'm14', type: ObjectType.BLOCK, x: 45, y: 3 },
      { id: 'm15', type: ObjectType.PORTAL_ROBOT, x: 55, y: 8 },
      { id: 'm16', type: ObjectType.BLOCK, x: 60, y: 9 },
      { id: 'm17', type: ObjectType.SPIKE, x: 62, y: 9 }, { id: 'm18', type: ObjectType.SPIKE, x: 63, y: 9 },
      { id: 'm19', type: ObjectType.BLOCK, x: 65, y: 9 },
      { id: 'm20', type: ObjectType.SPIKE, x: 68, y: 9 }, { id: 'm21', type: ObjectType.SPIKE, x: 69, y: 9 }, { id: 'm22', type: ObjectType.SPIKE, x: 70, y: 9 },
      { id: 'm23', type: ObjectType.PORTAL_SPIDER, x: 75, y: 8 },
      { id: 'm24', type: ObjectType.BLOCK, x: 80, y: 9 }, { id: 'm25', type: ObjectType.BLOCK, x: 80, y: 4 },
      { id: 'm26', type: ObjectType.SPIKE, x: 82, y: 9 }, { id: 'm27', type: ObjectType.SPIKE, x: 84, y: 4.5 },
      { id: 'm28', type: ObjectType.BLOCK, x: 86, y: 9 }, { id: 'm29', type: ObjectType.BLOCK, x: 86, y: 4 },
      { id: 'm30', type: ObjectType.PORTAL_SWING, x: 95, y: 6 },
      { id: 'm31', type: ObjectType.BLOCK, x: 100, y: 9 }, { id: 'm32', type: ObjectType.BLOCK, x: 100, y: 1 },
      { id: 'm33', type: ObjectType.SPIKE, x: 105, y: 8 }, { id: 'm34', type: ObjectType.SPIKE, x: 105, y: 2 },
      { id: 'm35', type: ObjectType.BLOCK, x: 110, y: 9 }, { id: 'm36', type: ObjectType.BLOCK, x: 110, y: 1 },
      { id: 'm37', type: ObjectType.PORTAL_CUBE, x: 120, y: 8 },
      { id: 'm38', type: ObjectType.BLOCK, x: 125, y: 9 },
    ]
  }
];

const STORAGE_KEY_LEVELS = 'geodash_clone_levels';
const STORAGE_KEY_SETTINGS = 'geodash_clone_settings';

const DEFAULT_SETTINGS: AppSettings = {
  showGrid: true,
  musicVolume: 80,
  sfxVolume: 100,
  playerColor: '#00ffff',
  playerColorSecondary: '#ffffff',
  iconId: 0,
  shipId: 0,
  ballId: 0,
  ufoId: 0,
  waveId: 0,
  robotId: 0,
  spiderId: 0,
  swingId: 0,
  particlesEnabled: true,
  manaOrbs: 1000,
  unlockedCubes: [0],
  unlockedShips: [0],
  unlockedBalls: [0],
  unlockedUfos: [0],
  unlockedWaves: [0],
  unlockedRobots: [0],
  unlockedSpiders: [0],
  unlockedSwings: [0],
  unlockedAchievements: [],
  stats: {
    totalJumps: 0,
    totalDeaths: 0,
    levelsCompleted: 0,
    orbsSpent: 0
  }
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [levels, setLevels] = useState<LevelData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LEVELS);
    return saved ? JSON.parse(saved) : INITIAL_LEVELS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  });

  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LEVELS, JSON.stringify(levels));
  }, [levels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const updateSettingsWithAchievementCheck = useCallback((newSettings: AppSettings) => {
    let finalSettings = { ...newSettings };
    let gainedOrbs = 0;
    
    ACHIEVEMENTS.forEach(ach => {
      if (!finalSettings.unlockedAchievements.includes(ach.id) && ach.requirement(finalSettings.stats)) {
        finalSettings.unlockedAchievements = [...finalSettings.unlockedAchievements, ach.id];
        gainedOrbs += ach.reward;
      }
    });

    if (gainedOrbs > 0) {
      finalSettings.manaOrbs += gainedOrbs;
    }
    
    setSettings(finalSettings);
  }, []);

  const activeLevel = levels.find(l => l.id === activeLevelId);

  const startNewLevel = () => {
    const newLvl: LevelData = {
      id: Math.random().toString(36).substr(2, 9),
      name: `NEW LEVEL ${levels.length + 1}`,
      difficulty: LevelDifficulty.NORMAL,
      objects: [],
      isPlatformer: false
    };
    setLevels([...levels, newLvl]);
    setActiveLevelId(newLvl.id);
    setGameState('EDITING');
  };

  const deleteLevel = (id: string) => {
    if (window.confirm("Are you sure you want to delete this level?")) {
      setLevels(levels.filter(l => l.id !== id));
    }
  };

  const updateLevel = (updatedLevel: LevelData) => {
    setLevels(levels.map(l => l.id === updatedLevel.id ? updatedLevel : l));
  };

  const handleLevelSelect = (level: LevelData, mode: 'PLAY' | 'EDIT' | 'MULTIPLAYER') => {
    setActiveLevelId(level.id);
    if (mode === 'MULTIPLAYER') {
        setGameState('PLAYING');
    } else {
        setGameState(mode === 'PLAY' ? 'PLAYING' : 'EDITING');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      {gameState === 'MENU' && (
        <>
          <MenuView 
            settings={settings}
            onPlay={() => setGameState('LEVEL_SELECT')} 
            onMultiplayer={() => setGameState('MULTIPLAYER_LOBBY')}
            onTower={() => setGameState('TOWER')}
            onSettings={() => setGameState('SETTINGS')}
            onShop={() => setGameState('SHOP')}
            onAchievements={() => setGameState('ACHIEVEMENTS')}
          />
          {deferredPrompt && (
            <button 
              onClick={installApp}
              className="absolute bottom-28 bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg z-50 animate-bounce"
            >
              Install Mobile App
            </button>
          )}
        </>
      )}

      {gameState === 'LEVEL_SELECT' && (
        <LevelSelectView 
          levels={levels}
          onSelect={handleLevelSelect}
          onCreate={startNewLevel}
          onDelete={deleteLevel}
          onBack={() => setGameState('MENU')}
        />
      )}

      {gameState === 'MULTIPLAYER_LOBBY' && (
        <LevelSelectView 
          levels={levels}
          title="MULTIPLAYER LOBBY"
          onSelect={(lvl) => handleLevelSelect(lvl, 'MULTIPLAYER')}
          onCreate={startNewLevel}
          onDelete={deleteLevel}
          onBack={() => setGameState('MENU')}
        />
      )}

      {gameState === 'TOWER' && (
        <LevelSelectView 
          levels={levels.filter(l => l.isPlatformer)}
          title="THE TOWER"
          onSelect={handleLevelSelect}
          onCreate={startNewLevel}
          onDelete={deleteLevel}
          onBack={() => setGameState('MENU')}
        />
      )}

      {gameState === 'SETTINGS' && (
        <SettingsView 
          settings={settings}
          onUpdate={setSettings}
          onBack={() => setGameState('MENU')}
        />
      )}

      {gameState === 'SHOP' && (
        <ShopView 
          settings={settings}
          onUpdate={updateSettingsWithAchievementCheck}
          onBack={() => setGameState('MENU')}
        />
      )}

      {gameState === 'ACHIEVEMENTS' && (
        <AchievementView 
          settings={settings}
          onBack={() => setGameState('MENU')}
        />
      )}

      {gameState === 'PLAYING' && activeLevel && (
        <GameView 
          level={activeLevel} 
          settings={settings}
          multiplayer={gameState === 'PLAYING' && !!activeLevelId}
          onExit={() => setGameState(activeLevel.isPlatformer ? 'TOWER' : 'LEVEL_SELECT')} 
          onUpdateSettings={updateSettingsWithAchievementCheck}
          onDeath={() => {
            updateSettingsWithAchievementCheck({
              ...settings,
              stats: { ...settings.stats, totalDeaths: settings.stats.totalDeaths + 1 }
            });
          }} 
        />
      )}

      {gameState === 'EDITING' && activeLevel && (
        <EditorView 
          level={activeLevel} 
          onSave={updateLevel} 
          onExit={() => setGameState('LEVEL_SELECT')}
          onTest={() => setGameState('PLAYING')}
        />
      )}
    </div>
  );
};

export default App;
