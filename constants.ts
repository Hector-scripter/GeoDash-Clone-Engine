
export const TILE_SIZE = 40;
export const GRAVITY = 0.8;
export const JUMP_FORCE = -12;
export const JUMP_PAD_FORCE = -17;
export const PLAYER_SPEED = 6;

// Platformer Physics
export const PLATFORMER_MAX_SPEED = 7;
export const PLATFORMER_ACCEL = 0.8;
export const PLATFORMER_FRICTION = 0.85;

// Ship Physics
export const SHIP_GRAVITY = 0.4;
export const SHIP_THRUST = -0.9;
export const SHIP_MAX_VY = 8;

// Wave Physics
export const WAVE_ANGLE = 45;
export const WAVE_SPEED_Y = 6;

// Swing Physics
export const SWING_GRAVITY = 0.35;
export const SWING_MAX_VY = 9;

// UFO Physics
export const UFO_JUMP_FORCE = -10;

// Robot Physics
export const ROBOT_MAX_JUMP_TIME = 15;
export const ROBOT_MIN_JUMP_FORCE = -8;
export const ROBOT_JUMP_ADD = -0.6;

export const CAMERA_OFFSET_X = 200;
export const GROUND_Y_GRID = 10;

export const COLORS = {
  PLAYER: '#00ffff',
  BLOCK: '#ffffff',
  SPIKE: '#ff0055',
  ORB: '#22ccff', // Blue Gravity Orb
  ORB_YELLOW: '#ffff00', // Yellow Jump Orb
  ORB_SPIDER: '#a855f7', // Purple Spider Orb
  JUMP_PAD: '#ffcc00',
  PAD_BLUE: '#3b82f6', // Blue Gravity Pad
  PORTAL_SHIP: '#22c55e', // Green
  PORTAL_CUBE: '#ec4899', // Pink
  PORTAL_BALL: '#f97316', // Orange
  PORTAL_UFO: '#fb923c', // Light Orange
  PORTAL_WAVE: '#00ffff', // Cyan
  PORTAL_ROBOT: '#ffffff', // White
  PORTAL_SPIDER: '#a855f7', // Purple
  PORTAL_SWING: '#0ea5e9', // Sky Blue/Cyan
  PORTAL_GRAVITY_NORMAL: '#3b82f6', // Bright Blue
  PORTAL_GRAVITY_INVERTED: '#fbbf24', // Bright Yellow
  PORTAL_SIZE_SMALL: '#a855f7', // Purple
  PORTAL_SIZE_BIG: '#22d3ee', // Cyan
  BACKGROUND: '#050505',
  GRID: 'rgba(255, 255, 255, 0.05)',
  ACCENT: '#ff00ff',
  SPEED: {
    '0_5X': '#00ffff',
    '1X': '#ffff00',
    '2X': '#00ff00',
    '3X': '#ff00ff',
    '4X': '#ff0000',
    '5X': '#ffffff'
  },
  DIFFICULTY: {
    EASY: '#3b82f6',
    NORMAL: '#22c55e',
    HARD: '#eab308',
    HARDER: '#f97316',
    INSANE: '#a855f7',
    DEMON: '#ef4444'
  }
};

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  reward: number;
  requirement: (stats: any) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_jump',
    title: 'Leap of Faith',
    description: 'Perform your first jump.',
    reward: 50,
    requirement: (s) => s.totalJumps >= 1
  },
  {
    id: 'jump_100',
    title: 'Bunny Hopper',
    description: 'Jump 100 times.',
    reward: 200,
    requirement: (s) => s.totalJumps >= 100
  },
  {
    id: 'first_death',
    title: 'Just a Scratch',
    description: 'Die for the first time.',
    reward: 25,
    requirement: (s) => s.totalDeaths >= 1
  },
  {
    id: 'death_50',
    title: 'Persistent',
    description: 'Die 50 times.',
    reward: 300,
    requirement: (s) => s.totalDeaths >= 50
  },
  {
    id: 'complete_1',
    title: 'Winner!',
    description: 'Complete your first level.',
    reward: 500,
    requirement: (s) => s.levelsCompleted >= 1
  },
  {
    id: 'spend_500',
    title: 'Big Spender',
    description: 'Spend 500 Mana Orbs in the shop.',
    reward: 250,
    requirement: (s) => s.orbsSpent >= 500
  }
];
