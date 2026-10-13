
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LevelData, Player, ObjectType, AppSettings, PlayerMode, Checkpoint, RemotePlayer } from '../types';
import { 
  TILE_SIZE, GRAVITY, JUMP_FORCE, JUMP_PAD_FORCE, PLAYER_SPEED, 
  CAMERA_OFFSET_X, COLORS, SHIP_GRAVITY, SHIP_THRUST, SHIP_MAX_VY,
  PLATFORMER_MAX_SPEED, PLATFORMER_ACCEL, PLATFORMER_FRICTION, UFO_JUMP_FORCE,
  ROBOT_MAX_JUMP_TIME, ROBOT_MIN_JUMP_FORCE, ROBOT_JUMP_ADD,
  SWING_GRAVITY, SWING_MAX_VY, GROUND_Y_GRID, WAVE_SPEED_Y
} from '../constants';

interface GameViewProps {
  level: LevelData;
  settings: AppSettings;
  onExit: () => void;
  onDeath: () => void;
  onUpdateSettings: (s: AppSettings) => void;
  multiplayer?: boolean;
}

const GameView: React.FC<GameViewProps> = ({ level, settings, onExit, onDeath, onUpdateSettings, multiplayer = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [isDead, setIsDead] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const [autoCheckpoint, setAutoCheckpoint] = useState(true);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const usedOrbs = useRef<Set<string>>(new Set());
  
  // Multiplayer state
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayer>>(new Map());
  const myId = useRef(Math.random().toString(36).substring(7));
  const channelRef = useRef<BroadcastChannel | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAutoCheckpointX = useRef(0);

  // Simple synthetic SFX generator
  const playSfx = (type: 'jump' | 'death') => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { console.error("SFX Error", e); }
  };

  const playerRef = useRef<Player>({
    x: 100,
    y: 360,
    vx: 0,
    vy: 0,
    isJumping: false,
    rotation: 0,
    isDead: false,
    mode: 'CUBE',
    gravityDir: 1,
    speedMultiplier: 1,
    scale: 1,
    jumpTimer: 0
  });
  
  const inputRef = useRef({ jump: false, lastJump: false, left: false, right: false });

  // Multiplayer Broadcast Setup
  useEffect(() => {
    if (!multiplayer) return;

    channelRef.current = new BroadcastChannel('geodash_sync');
    channelRef.current.onmessage = (event) => {
      const data = event.data;
      if (data.id === myId.current) return;

      setRemotePlayers(prev => {
        const next = new Map(prev);
        next.set(data.id, {
          ...data,
          lastUpdate: Date.now()
        });
        return next;
      });
    };

    const cleanupInterval = setInterval(() => {
      setRemotePlayers(prev => {
        const next = new Map<string, RemotePlayer>(prev);
        const now = Date.now();
        // Fix: Explicitly type entries to avoid 'unknown' errors on p.lastUpdate
        for (const [id, p] of Array.from(next.entries()) as [string, RemotePlayer][]) {
          if (now - p.lastUpdate > 2000) next.delete(id);
        }
        return next;
      });
    }, 1000);

    return () => {
      channelRef.current?.close();
      clearInterval(cleanupInterval);
    };
  }, [multiplayer]);

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: 100,
      y: 360,
      vx: 0,
      vy: 0,
      isJumping: false,
      rotation: 0,
      isDead: false,
      mode: 'CUBE',
      gravityDir: 1,
      speedMultiplier: 1,
      scale: 1,
      jumpTimer: 0
    };
    usedOrbs.current.clear();
    setCheckpoints([]);
    lastAutoCheckpointX.current = 100;
    setIsDead(false);
    setIsPaused(false);
    setIsFinished(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const placeCheckpoint = useCallback(() => {
    if (!isPractice || playerRef.current.isDead) return;
    const newCheckpoint: Checkpoint = {
      player: { ...playerRef.current },
      usedOrbs: new Set(usedOrbs.current)
    };
    setCheckpoints(prev => [...prev, newCheckpoint]);
  }, [isPractice]);

  const removeLastCheckpoint = useCallback(() => {
    setCheckpoints(prev => prev.slice(0, -1));
  }, []);

  const respawnAtCheckpoint = useCallback(() => {
    if (checkpoints.length === 0) {
      resetGame();
      return;
    }
    const last = checkpoints[checkpoints.length - 1];
    playerRef.current = { ...last.player, isDead: false };
    usedOrbs.current = new Set(last.usedOrbs);
    setIsDead(false);
    if (audioRef.current) {
        audioRef.current.play().catch(() => {});
    }
  }, [checkpoints, resetGame]);

  const togglePause = useCallback(() => {
    if (!isDead && !isFinished) {
      setIsPaused(prev => {
        const newState = !prev;
        if (audioRef.current) {
          if (newState) audioRef.current.pause();
          else audioRef.current.play().catch(() => {});
        }
        return newState;
      });
    }
  }, [isDead, isFinished]);

  useEffect(() => {
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/01/21/audio_6e476495d8.mp3');
    audio.loop = true;
    audio.volume = settings.musicVolume / 100;
    audioRef.current = audio;
    
    const startMusic = () => {
      audio.play().catch(() => {});
      window.removeEventListener('touchstart', startMusic);
      window.removeEventListener('mousedown', startMusic);
      window.removeEventListener('keydown', startMusic);
    };
    window.addEventListener('touchstart', startMusic);
    window.addEventListener('mousedown', startMusic);
    window.addEventListener('keydown', startMusic);

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [settings.musicVolume]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.jump = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = true;
      
      if (e.code === 'KeyZ') placeCheckpoint();
      if (e.code === 'KeyX') removeLastCheckpoint();
      if (e.code === 'KeyP') setIsPractice(p => !p);

      if (e.code === 'Escape') {
        if (isDead || isFinished) onExit();
        else togglePause();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.jump = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = false;
    };
    
    const handleGlobalJumpStart = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input')) return;
      if (level.isPlatformer && target.closest('[data-control-area="movement"]')) return;
      if (e instanceof TouchEvent) {
          if (!isPaused && !isDead && !isFinished) e.preventDefault();
      }
      if (!isPaused && !isDead && !isFinished) {
        inputRef.current.jump = true;
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
      }
    };
    
    const handleGlobalJumpEnd = () => {
      inputRef.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleGlobalJumpStart);
    window.addEventListener('mouseup', handleGlobalJumpEnd);
    window.addEventListener('touchstart', handleGlobalJumpStart, { passive: false });
    window.addEventListener('touchend', handleGlobalJumpEnd);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleGlobalJumpStart);
      window.removeEventListener('mouseup', handleGlobalJumpEnd);
      window.removeEventListener('touchstart', handleGlobalJumpStart);
      window.removeEventListener('touchend', handleGlobalJumpEnd);
    };
  }, [onExit, isPaused, isDead, isFinished, togglePause, placeCheckpoint, removeLastCheckpoint, level.isPlatformer]);

  const update = useCallback(() => {
    const player = playerRef.current;
    if (player.isDead || isPaused || isFinished) return;

    const justPressed = inputRef.current.jump && !inputRef.current.lastJump;
    inputRef.current.lastJump = inputRef.current.jump;

    const gravityFactor = player.scale < 1 ? 1.2 : 1.0;
    const jumpFactor = player.scale < 1 ? 0.85 : 1.0;

    if (justPressed && !player.isJumping && (player.mode === 'CUBE' || player.mode === 'ROBOT')) {
        playSfx('jump');
    }

    if (justPressed && (player.mode === 'CUBE' || player.mode === 'BALL' || player.mode === 'UFO' || player.mode === 'ROBOT' || player.mode === 'SPIDER' || player.mode === 'SWING')) {
      if (player.mode === 'UFO' || player.mode === 'SPIDER' || player.mode === 'SWING' || !player.isJumping) {
        onUpdateSettings({
          ...settings,
          stats: { ...settings.stats, totalJumps: settings.stats.totalJumps + 1 }
        });
      }
    }

    if (level.isPlatformer) {
      if (inputRef.current.left) player.vx -= PLATFORMER_ACCEL;
      if (inputRef.current.right) player.vx += PLATFORMER_ACCEL;
      player.vx *= PLATFORMER_FRICTION;
      if (Math.abs(player.vx) < 0.1) player.vx = 0;
      player.vx = Math.max(-PLATFORMER_MAX_SPEED, Math.min(PLATFORMER_MAX_SPEED, player.vx));
      player.x += player.vx;
    } else {
      player.x += PLAYER_SPEED * player.speedMultiplier;
    }

    if (isPractice && autoCheckpoint && !level.isPlatformer) {
        if (player.x - lastAutoCheckpointX.current > TILE_SIZE * 15 && !player.isJumping) {
            placeCheckpoint();
            lastAutoCheckpointX.current = player.x;
        }
    }

    let currentProgress = 0;
    if (level.isPlatformer) {
      const highestY = Math.min(...level.objects.map(o => o.y * TILE_SIZE));
      const startingY = GROUND_Y_GRID * TILE_SIZE;
      const totalDist = Math.abs(startingY - highestY);
      const currentDist = Math.abs(startingY - player.y);
      currentProgress = Math.min(100, Math.floor((currentDist / totalDist) * 100));
    } else {
      const furthestX = level.objects.length > 0 
        ? Math.max(...level.objects.map(o => o.x * TILE_SIZE)) 
        : 2000;
      currentProgress = Math.min(100, Math.floor((player.x / furthestX) * 100));
    }
    setProgress(currentProgress);

    if (currentProgress >= 100 && !isFinished) {
      setIsFinished(true);
      if (audioRef.current) audioRef.current.pause();
      onUpdateSettings({
        ...settings,
        manaOrbs: settings.manaOrbs + 150,
        stats: { ...settings.stats, levelsCompleted: settings.stats.levelsCompleted + 1 }
      });
    }

    if (player.mode === 'CUBE') {
      player.vy += GRAVITY * gravityFactor * player.gravityDir;
      if (inputRef.current.jump && !player.isJumping) {
        player.vy = JUMP_FORCE * jumpFactor * player.gravityDir;
        player.isJumping = true;
      }
    } else if (player.mode === 'SHIP') {
      if (inputRef.current.jump) player.vy += SHIP_THRUST * player.gravityDir;
      else player.vy += SHIP_GRAVITY * gravityFactor * player.gravityDir;
      player.vy = Math.max(-SHIP_MAX_VY, Math.min(SHIP_MAX_VY, player.vy));
    } else if (player.mode === 'BALL') {
      player.vy += GRAVITY * gravityFactor * player.gravityDir;
      if (justPressed && !player.isJumping) {
        player.gravityDir *= -1;
        player.isJumping = true;
      }
      player.vy = Math.max(-12, Math.min(12, player.vy));
    } else if (player.mode === 'WAVE') {
        if (inputRef.current.jump) {
            player.vy = -WAVE_SPEED_Y * player.gravityDir;
        } else {
            player.vy = WAVE_SPEED_Y * player.gravityDir;
        }
    } else if (player.mode === 'SWING') {
      if (justPressed) player.gravityDir *= -1;
      player.vy += SWING_GRAVITY * gravityFactor * player.gravityDir;
      player.vy = Math.max(-SWING_MAX_VY, Math.min(SWING_MAX_VY, player.vy));
    } else if (player.mode === 'UFO') {
      player.vy += GRAVITY * gravityFactor * player.gravityDir;
      if (justPressed) player.vy = UFO_JUMP_FORCE * jumpFactor * player.gravityDir;
      player.vy = Math.max(-15, Math.min(15, player.vy));
    } else if (player.mode === 'ROBOT') {
      player.vy += GRAVITY * gravityFactor * player.gravityDir;
      if (justPressed && !player.isJumping) {
        player.vy = ROBOT_MIN_JUMP_FORCE * jumpFactor * player.gravityDir;
        player.isJumping = true;
        player.jumpTimer = 0;
      } else if (inputRef.current.jump && player.isJumping && (player.jumpTimer || 0) < ROBOT_MAX_JUMP_TIME) {
        player.vy += ROBOT_JUMP_ADD * player.gravityDir;
        player.jumpTimer = (player.jumpTimer || 0) + 1;
      }
    } else if (player.mode === 'SPIDER') {
      player.vy += GRAVITY * gravityFactor * player.gravityDir;
      if (justPressed) {
        player.gravityDir *= -1;
        const playerSize = TILE_SIZE * player.scale;
        const groundY = GROUND_Y_GRID * TILE_SIZE;
        let targetY = player.gravityDir === 1 ? groundY - playerSize : -1000;
        level.objects.forEach(obj => {
          if (obj.type === ObjectType.BLOCK) {
            const ox = obj.x * TILE_SIZE;
            const oy = obj.y * TILE_SIZE;
            if (player.x + playerSize > ox && player.x < ox + TILE_SIZE) {
              if (player.gravityDir === 1 && oy > player.y && oy < targetY + playerSize) targetY = oy - playerSize;
              else if (player.gravityDir === -1 && oy < player.y && oy + TILE_SIZE > targetY) targetY = oy + TILE_SIZE;
            }
          }
        });
        player.y = targetY;
        player.vy = 0;
      }
    }
    player.y += player.vy;

    if (player.mode === 'CUBE' || player.mode === 'ROBOT') {
      if (player.isJumping) player.rotation += 5 * player.gravityDir * player.speedMultiplier;
      else if (level.isPlatformer) {
        if (Math.abs(player.vx) > 0.5) player.rotation += player.vx;
        else player.rotation = Math.round(player.rotation / 90) * 90;
      }
    } else if (player.mode === 'SHIP' || player.mode === 'SWING') player.rotation = player.vy * 4 * player.gravityDir;
    else if (player.mode === 'WAVE') player.rotation = Math.atan2(player.vy, PLAYER_SPEED * player.speedMultiplier) * (180 / Math.PI);
    else if (player.mode === 'BALL') {
      if (level.isPlatformer) player.rotation += player.vx * 2;
      else player.rotation += 6 * player.gravityDir * player.speedMultiplier;
    } else if (player.mode === 'UFO' || player.mode === 'SPIDER') player.rotation = Math.max(-30, Math.min(30, player.vy * 3)) * player.gravityDir;

    const groundY = GROUND_Y_GRID * TILE_SIZE;
    const playerSize = TILE_SIZE * player.scale;
    if (player.y + playerSize > groundY && (player.vy * player.gravityDir >= 0)) {
      if (player.mode === 'WAVE') {
          player.isDead = true; setIsDead(true); onDeath(); playSfx('death');
      } else {
        player.y = groundY - playerSize;
        player.vy = 0;
        player.isJumping = false;
        if ((player.mode === 'CUBE' || player.mode === 'ROBOT') && !level.isPlatformer) player.rotation = Math.round(player.rotation / 90) * 90;
      }
    } 
    
    if (player.y < 0 && (player.mode === 'WAVE' || player.mode === 'SHIP')) {
        player.isDead = true; setIsDead(true); onDeath(); playSfx('death');
    }

    const px = player.x; const py = player.y; const ps = playerSize;
    for (const obj of level.objects) {
      const ox = obj.x * TILE_SIZE; const oy = obj.y * TILE_SIZE; const os = TILE_SIZE;
      if (px < ox + os && px + ps > ox && py < oy + os && py + ps > oy) {
        if (obj.type === ObjectType.SPIKE) {
          const margin = 12 * player.scale;
          if (px + ps - margin > ox + margin && px + margin < ox + os - margin && py + ps > oy + os / 2) {
            player.isDead = true; setIsDead(true); onDeath(); playSfx('death');
          }
        } else if (obj.type === ObjectType.BLOCK) {
            if (player.mode === 'WAVE') {
                player.isDead = true; setIsDead(true); onDeath(); playSfx('death');
            } else {
                const isFallingToward = (player.gravityDir === 1 && player.vy >= 0 && py + ps - player.vy <= oy + 5) || 
                                        (player.gravityDir === -1 && player.vy <= 0 && py - player.vy >= oy + os - 5);
                if (isFallingToward) {
                    player.y = player.gravityDir === 1 ? oy - ps : oy + os;
                    player.vy = 0; player.isJumping = false;
                } else {
                    if (level.isPlatformer) {
                    if (px < ox) player.x = ox - ps;
                    else if (px + ps > ox + os) player.x = ox + os;
                    player.vx = 0;
                    } else {
                    player.isDead = true; setIsDead(true); onDeath(); playSfx('death');
                    }
                }
            }
        } else if (obj.type === ObjectType.JUMP_PAD) {
          player.vy = JUMP_PAD_FORCE * jumpFactor * player.gravityDir; player.isJumping = true; playSfx('jump');
        } else if (obj.type === ObjectType.PAD_BLUE) {
          player.gravityDir *= -1; player.vy = 0; playSfx('jump');
        } else if (obj.type === ObjectType.ORB) {
          if (justPressed && !usedOrbs.current.has(obj.id)) {
            player.gravityDir *= -1; player.vy = -8 * player.gravityDir; player.isJumping = true;
            usedOrbs.current.add(obj.id); playSfx('jump');
          }
        } else if (obj.type === ObjectType.ORB_YELLOW) {
          if (justPressed && !usedOrbs.current.has(obj.id)) {
            player.vy = JUMP_FORCE * jumpFactor * player.gravityDir; player.isJumping = true;
            usedOrbs.current.add(obj.id); playSfx('jump');
          }
        } else if (obj.type === ObjectType.ORB_SPIDER) {
          if (justPressed && !usedOrbs.current.has(obj.id)) {
            usedOrbs.current.add(obj.id);
            player.gravityDir *= -1;
            const playerSize = TILE_SIZE * player.scale;
            const groundY = GROUND_Y_GRID * TILE_SIZE;
            let targetY = player.gravityDir === 1 ? groundY - playerSize : -1000;
            level.objects.forEach(o => {
              if (o.type === ObjectType.BLOCK) {
                const ox2 = o.x * TILE_SIZE; const oy2 = o.y * TILE_SIZE;
                if (player.x + playerSize > ox2 && player.x < ox2 + TILE_SIZE) {
                  if (player.gravityDir === 1 && oy2 > player.y && oy2 < targetY + playerSize) targetY = oy2 - playerSize;
                  else if (player.gravityDir === -1 && oy2 < player.y && oy2 + TILE_SIZE > targetY) targetY = oy2 + TILE_SIZE;
                }
              }
            });
            player.y = targetY; player.vy = 0; playSfx('jump');
          }
        } else if (obj.type === ObjectType.PORTAL_SHIP) player.mode = 'SHIP';
        else if (obj.type === ObjectType.PORTAL_CUBE) player.mode = 'CUBE';
        else if (obj.type === ObjectType.PORTAL_BALL) player.mode = 'BALL';
        else if (obj.type === ObjectType.PORTAL_UFO) player.mode = 'UFO';
        else if (obj.type === ObjectType.PORTAL_WAVE) player.mode = 'WAVE';
        else if (obj.type === ObjectType.PORTAL_ROBOT) player.mode = 'ROBOT';
        else if (obj.type === ObjectType.PORTAL_SPIDER) player.mode = 'SPIDER';
        else if (obj.type === ObjectType.PORTAL_SWING) player.mode = 'SWING';
        else if (obj.type === ObjectType.PORTAL_GRAVITY_NORMAL) player.gravityDir = 1;
        else if (obj.type === ObjectType.PORTAL_GRAVITY_INVERTED) player.gravityDir = -1;
        else if (obj.type === ObjectType.PORTAL_SIZE_SMALL) player.scale = 0.6;
        else if (obj.type === ObjectType.PORTAL_SIZE_BIG) player.scale = 1;
        else if (obj.type === ObjectType.SPEED_0_5X) player.speedMultiplier = 0.5;
        else if (obj.type === ObjectType.SPEED_1X) player.speedMultiplier = 1;
        else if (obj.type === ObjectType.SPEED_2X) player.speedMultiplier = 1.3;
        else if (obj.type === ObjectType.SPEED_3X) player.speedMultiplier = 1.6;
        else if (obj.type === ObjectType.SPEED_4X) player.speedMultiplier = 2.0;
        else if (obj.type === ObjectType.SPEED_5X) player.speedMultiplier = 2.5; 
      }
    }

    if (player.isDead) {
        if (audioRef.current) audioRef.current.pause();
    }

    // Multiplayer sync broadcast
    if (multiplayer && channelRef.current) {
      channelRef.current.postMessage({
        id: myId.current,
        x: player.x,
        y: player.y,
        rotation: player.rotation,
        mode: player.mode,
        isDead: player.isDead,
        gravityDir: player.gravityDir,
        scale: player.scale,
        primaryColor: settings.playerColor,
        secondaryColor: settings.playerColorSecondary,
        progress: progress
      });
    }

  }, [level.objects, onDeath, isPaused, isFinished, level.id, level.isPlatformer, settings, onUpdateSettings, placeCheckpoint, isPractice, autoCheckpoint, multiplayer, progress]);

  const drawPlayerIcon = (ctx: CanvasRenderingContext2D, size: number, mode: PlayerMode, id: number, primaryColor: string, secondaryColor: string) => {
    const s = size;
    const half = s / 2;
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = Math.max(2, s / 15);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (mode === 'CUBE') {
      ctx.fillRect(-half + 4, -half + 4, s - 8, s - 8);
      if (id === 1) {
        ctx.beginPath(); ctx.moveTo(-half + 10, -half + 10); ctx.lineTo(half - 10, half - 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(half - 10, -half + 10); ctx.lineTo(-half + 10, half - 10); ctx.stroke();
      } else if (id === 2) {
        ctx.strokeRect(-half + 12, -half + 12, s - 24, s - 24);
      } else if (id === 3) {
        const dot = s / 8;
        ctx.fillStyle = secondaryColor;
        ctx.beginPath(); ctx.arc(-half/2, -half/2, dot, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(half/2, -half/2, dot, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(-half/2, half/2, dot, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(half/2, half/2, dot, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.strokeRect(-half + 8, -half + 8, s - 16, s - 16);
      }
    } else if (mode === 'SHIP') {
      ctx.beginPath();
      if (id === 1) {
        ctx.moveTo(-half, 0); ctx.quadraticCurveTo(-half, -half, half, -half/4); ctx.lineTo(half, half/4); ctx.quadraticCurveTo(-half, half, -half, 0);
      } else if (id === 2) {
        ctx.moveTo(-half, half/2); ctx.lineTo(-half, -half/2); ctx.lineTo(half, -half/2); ctx.lineTo(half, half/2); ctx.closePath();
      } else {
        ctx.moveTo(-half, 0); ctx.lineTo(half, -half/2); ctx.lineTo(half, half/2); ctx.closePath();
      }
      ctx.fill(); ctx.stroke();
    } else if (mode === 'WAVE') {
        ctx.beginPath();
        if (id === 1) {
            ctx.moveTo(-half, 0); ctx.lineTo(half, -half/2); ctx.lineTo(half, half/2); ctx.closePath();
        } else if (id === 2) {
            ctx.moveTo(-half, 0); ctx.lineTo(half, -half); ctx.lineTo(half, half); ctx.closePath();
        } else {
            ctx.moveTo(-half, 0); ctx.lineTo(half, 0); ctx.lineTo(0, -half/2); ctx.closePath();
        }
        ctx.fill(); ctx.stroke();
    } else if (mode === 'BALL') {
      const r = half - 2;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (id === 1) {
        for(let i=0; i<8; i++) {
          ctx.rotate(Math.PI/4); ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(r+4, 0); ctx.stroke();
        }
      } else if (id === 2) {
        ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
      }
    } else if (mode === 'UFO') {
      ctx.beginPath(); ctx.ellipse(0, 4, half, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -4, half/1.5, Math.PI, 0); ctx.fill(); ctx.stroke();
      if (id === 1) {
        ctx.fillStyle = secondaryColor; ctx.beginPath(); ctx.arc(0, -4, 3, 0, Math.PI*2); ctx.fill();
      } else if (id === 2) {
        ctx.beginPath(); ctx.moveTo(-half/2, 4); ctx.lineTo(half/2, 4); ctx.stroke();
      }
    } else if (mode === 'ROBOT') {
      ctx.fillRect(-half+6, -half, s-12, half); ctx.strokeRect(-half+6, -half, s-12, half);
      ctx.fillRect(-half+2, 0, s-4, half); ctx.strokeRect(-half+2, 0, s-4, half);
      if (id === 1) {
        ctx.fillStyle = secondaryColor; ctx.fillRect(-half+10, -half+4, s-20, 4);
      } else if (id === 2) {
        ctx.beginPath(); ctx.moveTo(-half+6, -half/2); ctx.lineTo(half-6, -half/2); ctx.stroke();
      }
    } else if (mode === 'SPIDER') {
      ctx.fillRect(-half/2, -half/2, half, half); ctx.strokeRect(-half/2, -half/2, half, half);
      const leg = (a: number) => {
        ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(half/4, 0); ctx.lineTo(half, -half/2); ctx.stroke(); ctx.restore();
      };
      leg(0.5); leg(-0.5); leg(Math.PI - 0.5); leg(Math.PI + 0.5);
      if (id === 1) {
        ctx.fillStyle = secondaryColor; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
      }
    } else if (mode === 'SWING') {
      const r = half - 4;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (id === 1) {
        ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
        ctx.strokeRect(-r/2, -r/2, r, r);
      } else if (id === 2) {
        ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke();
      } else if (id === 3) {
        ctx.fillStyle = secondaryColor;
        ctx.beginPath(); ctx.arc(0, 0, r/2, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
      }
    }
  };

  const drawSpeedChanger = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, arrows: number) => {
    ctx.fillStyle = color; ctx.shadowBlur = 10; ctx.shadowColor = color;
    for (let i = 0; i < arrows; i++) {
      const offsetX = (i - (arrows - 1) / 2) * 10;
      ctx.beginPath(); ctx.moveTo(x + TILE_SIZE / 2 + offsetX - 5, y + 10); ctx.lineTo(x + TILE_SIZE / 2 + offsetX + 5, y + TILE_SIZE / 2); ctx.lineTo(x + TILE_SIZE / 2 + offsetX - 5, y + TILE_SIZE - 10); ctx.closePath(); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    const cameraX = level.isPlatformer ? player.x - ctx.canvas.width / 2 : player.x - CAMERA_OFFSET_X;
    const cameraY = level.isPlatformer ? player.y - ctx.canvas.height / 2 : (player.y < 200 ? player.y - 300 : 0);
    const time = performance.now() / 1000;

    ctx.fillStyle = COLORS.BACKGROUND; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (settings.showGrid) {
      ctx.strokeStyle = COLORS.GRID; ctx.lineWidth = 1;
      const startGridX = Math.floor(cameraX / TILE_SIZE); const endGridX = startGridX + Math.ceil(ctx.canvas.width / TILE_SIZE) + 1;
      const startGridY = Math.floor(cameraY / TILE_SIZE); const endGridY = startGridY + Math.ceil(ctx.canvas.height / TILE_SIZE) + 1;
      for (let i = startGridX; i <= endGridX; i++) { ctx.beginPath(); ctx.moveTo(i * TILE_SIZE - cameraX, 0); ctx.lineTo(i * TILE_SIZE - cameraX, ctx.canvas.height); ctx.stroke(); }
      for (let j = startGridY; j <= endGridY; j++) { ctx.beginPath(); ctx.moveTo(0, j * TILE_SIZE - cameraY); ctx.lineTo(ctx.canvas.width, j * TILE_SIZE - cameraY); ctx.stroke(); }
    }
    
    ctx.fillStyle = '#111'; ctx.fillRect(0, GROUND_Y_GRID * TILE_SIZE - cameraY, ctx.canvas.width, 2000);
    ctx.strokeStyle = settings.playerColor; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y_GRID * TILE_SIZE - cameraY); ctx.lineTo(ctx.canvas.width, GROUND_Y_GRID * TILE_SIZE - cameraY); ctx.stroke();

    level.objects.forEach(obj => {
      const x = obj.x * TILE_SIZE - cameraX; const y = obj.y * TILE_SIZE - cameraY;
      if (x + TILE_SIZE < 0 || x > ctx.canvas.width || y + TILE_SIZE < 0 || y > ctx.canvas.height) return;
      if (obj.type === ObjectType.BLOCK) {
        ctx.fillStyle = COLORS.BLOCK; ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (obj.type === ObjectType.SPIKE) {
        ctx.fillStyle = COLORS.SPIKE; ctx.beginPath(); ctx.moveTo(x + TILE_SIZE / 2, y); ctx.lineTo(x, y + TILE_SIZE); ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
      } else if (obj.type === ObjectType.JUMP_PAD || obj.type === ObjectType.PAD_BLUE) {
        const color = obj.type === ObjectType.JUMP_PAD ? COLORS.JUMP_PAD : COLORS.PAD_BLUE;
        ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x + 5, y + TILE_SIZE - 10, TILE_SIZE - 10, 10, 5); ctx.fill(); ctx.strokeStyle = 'white'; ctx.stroke();
      } else if (obj.type === ObjectType.ORB || obj.type === ObjectType.ORB_YELLOW || obj.type === ObjectType.ORB_SPIDER) {
        const pulse = Math.sin(time * 10) * 5; 
        let color = COLORS.ORB;
        if (obj.type === ObjectType.ORB_YELLOW) color = COLORS.ORB_YELLOW;
        if (obj.type === ObjectType.ORB_SPIDER) color = COLORS.ORB_SPIDER;
        
        ctx.fillStyle = color; ctx.shadowBlur = 15; ctx.shadowColor = color;
        ctx.beginPath(); ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, (TILE_SIZE / 3) + pulse / 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
      } else if (obj.type.startsWith('SPEED_')) {
        let color = COLORS.SPEED['1X']; let arrows = 1;
        if (obj.type === ObjectType.SPEED_0_5X) { color = COLORS.SPEED['0_5X']; arrows = 1; }
        else if (obj.type === ObjectType.SPEED_1X) { color = COLORS.SPEED['1X']; arrows = 1; }
        else if (obj.type === ObjectType.SPEED_2X) { color = COLORS.SPEED['2X']; arrows = 2; }
        else if (obj.type === ObjectType.SPEED_3X) { color = COLORS.SPEED['3X']; arrows = 3; }
        else if (obj.type === ObjectType.SPEED_4X) { color = COLORS.SPEED['4X']; arrows = 4; }
        else if (obj.type === ObjectType.SPEED_5X) { color = COLORS.SPEED['5X']; arrows = 5; }
        drawSpeedChanger(ctx, x, y, color, arrows);
      } else if (obj.type.startsWith('PORTAL_')) {
        let color = COLORS.PORTAL_CUBE;
        if (obj.type === ObjectType.PORTAL_SHIP) color = COLORS.PORTAL_SHIP;
        else if (obj.type === ObjectType.PORTAL_BALL) color = COLORS.PORTAL_BALL;
        else if (obj.type === ObjectType.PORTAL_UFO) color = COLORS.PORTAL_UFO;
        else if (obj.type === ObjectType.PORTAL_WAVE) color = COLORS.PORTAL_WAVE;
        else if (obj.type === ObjectType.PORTAL_ROBOT) color = COLORS.PORTAL_ROBOT;
        else if (obj.type === ObjectType.PORTAL_SPIDER) color = COLORS.PORTAL_SPIDER;
        else if (obj.type === ObjectType.PORTAL_SWING) color = COLORS.PORTAL_SWING;
        else if (obj.type === ObjectType.PORTAL_GRAVITY_NORMAL) color = COLORS.PORTAL_GRAVITY_NORMAL;
        else if (obj.type === ObjectType.PORTAL_GRAVITY_INVERTED) color = COLORS.PORTAL_GRAVITY_INVERTED;
        else if (obj.type === ObjectType.PORTAL_SIZE_SMALL) color = COLORS.PORTAL_SIZE_SMALL;
        else if (obj.type === ObjectType.PORTAL_SIZE_BIG) color = COLORS.PORTAL_SIZE_BIG;
        ctx.fillStyle = color; ctx.shadowBlur = 10; ctx.shadowColor = color;
        ctx.beginPath(); ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE * 0.4, TILE_SIZE * 0.9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
      }
    });

    if (isPractice) {
        checkpoints.forEach(cp => {
            const cx = cp.player.x - cameraX;
            const cy = cp.player.y - cameraY;
            ctx.fillStyle = '#10b981';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#10b981';
            ctx.beginPath();
            ctx.arc(cx + TILE_SIZE/2, cy + TILE_SIZE/2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
    }

    // Draw Remote Players (Multiplayer Ghosts)
    if (multiplayer) {
      remotePlayers.forEach((rp) => {
        if (rp.isDead) return;
        const rpSize = TILE_SIZE * rp.scale;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.translate(rp.x - cameraX + rpSize / 2, rp.y - cameraY + rpSize / 2);
        ctx.rotate((rp.rotation * Math.PI) / 180);
        if (rp.gravityDir === -1) ctx.scale(1, -1);
        
        // Name Tag
        ctx.save();
        ctx.rotate((-rp.rotation * Math.PI) / 180); // Keep text upright
        if (rp.gravityDir === -1) ctx.scale(1, -1);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(rp.id.toUpperCase(), 0, -rpSize);
        ctx.restore();

        drawPlayerIcon(ctx, rpSize, rp.mode, 0, rp.primaryColor, rp.secondaryColor);
        ctx.restore();
      });
    }

    const playerSize = TILE_SIZE * player.scale;
    ctx.save(); ctx.translate(player.x - cameraX + playerSize / 2, player.y - cameraY + playerSize / 2);
    ctx.rotate((player.rotation * Math.PI) / 180);
    if (player.gravityDir === -1) ctx.scale(1, -1);
    if (level.isPlatformer && player.vx < -0.1) ctx.scale(-1, 1);
    ctx.shadowBlur = 15; ctx.shadowColor = settings.playerColor;
    
    let skinId = settings.iconId;
    if (player.mode === 'SHIP') skinId = settings.shipId;
    else if (player.mode === 'BALL') skinId = settings.ballId;
    else if (player.mode === 'WAVE') skinId = settings.waveId;
    else if (player.mode === 'UFO') skinId = settings.ufoId;
    else if (player.mode === 'ROBOT') skinId = settings.robotId;
    else if (player.mode === 'SPIDER') skinId = settings.spiderId;
    else if (player.mode === 'SWING') skinId = settings.swingId;

    drawPlayerIcon(ctx, playerSize, player.mode, skinId, settings.playerColor, settings.playerColorSecondary);
    ctx.restore();

    if (player.isDead || isPaused || isFinished) { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); }
  }, [level.objects, settings, isPaused, isFinished, level.isPlatformer, isPractice, checkpoints, multiplayer, remotePlayers]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    update(); draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [loop]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 touch-none select-none overflow-hidden">
      <canvas ref={canvasRef} width={window.innerWidth} height={600} className="max-w-full shadow-2xl border-y border-zinc-800" />
      
      {/* HUD Multiplayer Info */}
      {multiplayer && (
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
           <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex flex-col gap-1 min-w-[150px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
                 <span className="text-[10px] font-black text-emerald-400">MULTIPLAYER</span>
                 <span className="text-[8px] font-bold text-zinc-500">{remotePlayers.size + 1} ONLINE</span>
              </div>
              <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto">
                 <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-cyan-400">YOU</span>
                    <span>{progress}%</span>
                 </div>
                 {/* Fix: Added explicit typing for p to avoid 'unknown' type errors */}
                 {Array.from(remotePlayers.values()).map((p: RemotePlayer) => (
                   <div key={p.id} className="flex justify-between text-[10px] font-bold text-zinc-400">
                      <span>{p.id.toUpperCase()}</span>
                      <span>{p.progress}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Platformer Mobile Controls */}
      {level.isPlatformer && !isPaused && !isDead && !isFinished && (
        <div 
          data-control-area="movement"
          className="absolute bottom-6 left-6 flex gap-4 z-50 pointer-events-auto"
        >
          <button 
            onPointerDown={() => { inputRef.current.left = true; }}
            onPointerUp={() => { inputRef.current.left = false; }}
            onPointerLeave={() => { inputRef.current.left = false; }}
            className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center active:bg-cyan-500/30 transition-colors shadow-2xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </button>
          <button 
            onPointerDown={() => { inputRef.current.right = true; }}
            onPointerUp={() => { inputRef.current.right = false; }}
            onPointerLeave={() => { inputRef.current.right = false; }}
            className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center active:bg-cyan-500/30 transition-colors shadow-2xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
            </svg>
          </button>
        </div>
      )}

      {/* HUD Progress & Mode */}
      <div className="absolute top-0 left-0 w-full p-6 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-1/2 h-4 bg-black/40 border border-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,204,255,0.5)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-4">
            <span className="text-[10px] font-black tracking-widest text-cyan-400 drop-shadow-md uppercase">{level.isPlatformer ? 'PLATFORMER' : `${progress}%`}</span>
            {isPractice && <span className="text-[10px] font-black tracking-widest text-emerald-400 drop-shadow-md uppercase animate-pulse">PRACTICE MODE</span>}
        </div>
      </div>

      {/* Practice Mode Controls Bar - Shifted to accommodate Platformer arrows if needed */}
      <div className={`absolute ${level.isPlatformer ? 'bottom-32 left-6' : 'bottom-6 left-6'} flex flex-col gap-3 pointer-events-auto transition-all`}>
          <div className="flex gap-2">
            <button 
                onClick={() => setIsPractice(p => !p)} 
                className={`px-5 py-3 rounded-2xl font-black text-xs border transition-all ${isPractice ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10 text-zinc-500'}`}
            >
                PRACTICE
            </button>
            {isPractice && (
                <button 
                    onClick={() => setAutoCheckpoint(!autoCheckpoint)} 
                    className={`px-5 py-3 rounded-2xl font-black text-xs border transition-all ${autoCheckpoint ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                >
                    AUTO: {autoCheckpoint ? 'ON' : 'OFF'}
                </button>
            )}
          </div>
          {isPractice && (
              <div className="flex gap-2">
                  <button onClick={placeCheckpoint} className="px-5 py-3 bg-zinc-800 hover:bg-emerald-600 active:scale-95 text-white font-black text-[10px] rounded-2xl border border-white/10 transition-all">ADD CP</button>
                  <button onClick={removeLastCheckpoint} className="px-5 py-3 bg-zinc-800 hover:bg-red-600 active:scale-95 text-white font-black text-[10px] rounded-2xl border border-white/10 transition-all">DEL CP</button>
              </div>
          )}
      </div>

      {isDead && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 animate-in zoom-in duration-300 z-[100]">
          <h2 className="text-6xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">TRY AGAIN</h2>
          <div className="flex gap-4">
            <button onClick={isPractice && checkpoints.length > 0 ? respawnAtCheckpoint : resetGame} className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-zinc-200 active:scale-90 transition-all shadow-xl">
                {isPractice && checkpoints.length > 0 ? 'RESPAWN' : 'RESTART'}
            </button>
            <button onClick={onExit} className="px-10 py-4 bg-zinc-800 text-white font-black rounded-full hover:bg-zinc-700 active:scale-90 transition-all">QUIT</button>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 animate-in zoom-in duration-500 z-[100]">
          <h2 className="text-6xl font-black text-cyan-400 drop-shadow-[0_0_20px_rgba(34,204,255,0.5)]">LEVEL COMPLETE!</h2>
          <div className="flex items-center gap-4 bg-black/50 px-8 py-4 rounded-2xl border border-cyan-400/30">
             <div className="w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]" />
             <span className="text-2xl font-black text-white">+150 MANA ORBS</span>
          </div>
          <button onClick={onExit} className="px-14 py-5 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 active:scale-95 transition-all shadow-2xl">CONTINUE</button>
        </div>
      )}

      {isPaused && !isDead && !isFinished && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 animate-in zoom-in duration-200 z-[100]">
          <h2 className="text-6xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">PAUSED</h2>
          
          <div className="flex items-center gap-6">
            <button onClick={togglePause} className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-2xl">
              <div className="w-0 h-0 border-t-[18px] border-t-transparent border-l-[30px] border-l-black border-b-[18px] border-b-transparent ml-2" />
            </button>
            <div className="flex flex-col gap-4">
               <button onClick={resetGame} className="w-16 h-16 bg-zinc-800 border-2 border-zinc-700 rounded-2xl flex items-center justify-center hover:bg-zinc-700 hover:border-cyan-500 active:scale-90 transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" className="group-hover:rotate-180 transition-transform duration-500"><path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>
               </button>
               <button onClick={onExit} className="w-16 h-16 bg-zinc-800 border-2 border-zinc-700 rounded-2xl flex items-center justify-center hover:bg-zinc-700 hover:border-red-500 active:scale-90 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>
               </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 bg-black/60 p-8 rounded-3xl border border-white/5 backdrop-blur-xl max-w-sm w-full">
             <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex justify-between w-full">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Music Volume</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{settings.musicVolume}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.musicVolume} 
                    onChange={(e) => onUpdateSettings({...settings, musicVolume: parseInt(e.target.value)})}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
             </div>
             <div className="h-px w-full bg-white/5" />
             <div className="grid grid-cols-1 gap-y-3 w-full text-[10px] font-bold text-zinc-400">
                <div className="flex justify-between gap-4 uppercase"><span>Jump:</span><span className="text-white">TAP / SPACE</span></div>
                <div className="flex justify-between gap-4 uppercase"><span>Practice:</span><span className="text-emerald-400">P / BUTTON</span></div>
                <div className="flex justify-between gap-4 uppercase"><span>Platformer:</span><span className="text-blue-400">ARROWS / WASD</span></div>
             </div>
          </div>

          <div className="flex flex-col items-center gap-1">
             <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{level.name}</span>
             <div className="px-5 py-2 bg-white/5 rounded-full border border-white/5 text-cyan-400 font-mono text-[10px] uppercase">{level.isPlatformer ? 'PLATFORMER MODE' : `${progress}% COMPLETE`}</div>
          </div>
        </div>
      )}

      {/* Top Left Menu Button */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 z-[60]">
        <div className="flex gap-4 items-center">
          <button onClick={togglePause} className="p-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10 shadow-xl">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A.5.5 0 0 1 6 4v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/></svg>
          </button>
          <div className="px-5 py-3 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/5 text-cyan-400 font-mono text-sm uppercase tracking-tight hidden sm:block">{level.name}</div>
        </div>
      </div>
    </div>
  );
};

export default GameView;
