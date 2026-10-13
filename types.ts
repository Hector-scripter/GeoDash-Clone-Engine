
export enum ObjectType {
  BLOCK = 'BLOCK',
  SPIKE = 'SPIKE',
  ORB = 'ORB', // Blue Gravity Orb
  ORB_YELLOW = 'ORB_YELLOW', // Yellow Jump Orb
  ORB_SPIDER = 'ORB_SPIDER', // Spider Teleport Orb
  PORTAL_SHIP = 'PORTAL_SHIP',
  PORTAL_CUBE = 'PORTAL_CUBE',
  PORTAL_BALL = 'PORTAL_BALL',
  PORTAL_UFO = 'PORTAL_UFO',
  PORTAL_ROBOT = 'PORTAL_ROBOT',
  PORTAL_SPIDER = 'PORTAL_SPIDER',
  PORTAL_SWING = 'PORTAL_SWING',
  PORTAL_WAVE = 'PORTAL_WAVE',
  PORTAL_GRAVITY_NORMAL = 'PORTAL_GRAVITY_NORMAL',
  PORTAL_GRAVITY_INVERTED = 'PORTAL_GRAVITY_INVERTED',
  PORTAL_SIZE_SMALL = 'PORTAL_SIZE_SMALL',
  PORTAL_SIZE_BIG = 'PORTAL_SIZE_BIG',
  JUMP_PAD = 'JUMP_PAD',
  PAD_BLUE = 'PAD_BLUE', // Blue Gravity Pad
  // Speed Changers
  SPEED_0_5X = 'SPEED_0_5X',
  SPEED_1X = 'SPEED_1X',
  SPEED_2X = 'SPEED_2X',
  SPEED_3X = 'SPEED_3X',
  SPEED_4X = 'SPEED_4X',
  SPEED_5X = 'SPEED_5X'
}

export enum LevelDifficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  HARDER = 'HARDER',
  INSANE = 'INSANE',
  DEMON = 'DEMON'
}

export type PlayerMode = 'CUBE' | 'SHIP' | 'BALL' | 'UFO' | 'ROBOT' | 'SPIDER' | 'SWING' | 'WAVE';

export interface GameObject {
  id: string;
  type: ObjectType;
  x: number; // grid units
  y: number; // grid units
  width?: number;
  height?: number;
}

export interface LevelData {
  id: string;
  name: string;
  difficulty: LevelDifficulty;
  objects: GameObject[];
  isPlatformer?: boolean;
}

export type GameState = 'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'EDITING' | 'SETTINGS' | 'SHOP' | 'ACHIEVEMENTS' | 'TOWER' | 'MULTIPLAYER_LOBBY';

export interface Player {
  x: number;
  y: number;
  vx: number; // horizontal velocity
  vy: number; // vertical velocity
  isJumping: boolean;
  rotation: number;
  isDead: boolean;
  mode: PlayerMode;
  gravityDir: number; // 1 for normal, -1 for inverted
  speedMultiplier: number;
  scale: number; // 1 for normal, 0.6 for mini
  jumpTimer?: number; // For Robot hold jump
}

export interface RemotePlayer extends Player {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  lastUpdate: number;
  progress: number;
}

export interface Checkpoint {
  player: Player;
  usedOrbs: Set<string>;
}

export interface AppSettings {
  showGrid: boolean;
  musicVolume: number;
  sfxVolume: number;
  playerColor: string;
  playerColorSecondary: string;
  iconId: number;
  shipId: number;
  ballId: number;
  ufoId: number;
  waveId: number;
  robotId: number;
  spiderId: number;
  swingId: number;
  particlesEnabled: boolean;
  manaOrbs: number;
  unlockedCubes: number[];
  unlockedShips: number[];
  unlockedBalls: number[];
  unlockedUfos: number[];
  unlockedWaves: number[];
  unlockedRobots: number[];
  unlockedSpiders: number[];
  unlockedSwings: number[];
  // Achievement Tracking
  unlockedAchievements: string[];
  stats: {
    totalJumps: number;
    totalDeaths: number;
    levelsCompleted: number;
    orbsSpent: number;
  };
}
