
import React, { useEffect, useRef } from 'react';
import { PlayerMode } from '../types';

interface PlayerIconProps {
  mode: PlayerMode;
  id: number;
  primaryColor: string;
  secondaryColor: string;
  size?: number;
  className?: string;
  gravityDir?: number;
}

const PlayerIcon: React.FC<PlayerIconProps> = ({ mode, id, primaryColor, secondaryColor, size = 40, className = "", gravityDir = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = size;
    const half = s / 2;
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.translate(half, half);
    if (gravityDir === -1) ctx.scale(1, -1);

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = Math.max(2, s / 15);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const drawCube = () => {
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
    };

    const drawShip = () => {
      ctx.beginPath();
      if (id === 1) {
        ctx.moveTo(-half, 0); ctx.quadraticCurveTo(-half, -half, half, -half/4); ctx.lineTo(half, half/4); ctx.quadraticCurveTo(-half, half, -half, 0);
      } else if (id === 2) {
        ctx.moveTo(-half, half/2); ctx.lineTo(-half, -half/2); ctx.lineTo(half, -half/2); ctx.lineTo(half, half/2); ctx.closePath();
      } else {
        ctx.moveTo(-half, 0); ctx.lineTo(half, -half/2); ctx.lineTo(half, half/2); ctx.closePath();
      }
      ctx.fill(); ctx.stroke();
    };

    const drawBall = () => {
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
    };

    const drawWave = () => {
        ctx.beginPath();
        if (id === 1) {
            ctx.moveTo(-half, 0); ctx.lineTo(half, -half/2); ctx.lineTo(half, half/2); ctx.closePath();
        } else if (id === 2) {
            ctx.moveTo(-half, 0); ctx.lineTo(half, -half); ctx.lineTo(half, half); ctx.closePath();
        } else {
            ctx.moveTo(-half, 0); ctx.lineTo(half, 0); ctx.lineTo(0, -half/2); ctx.closePath();
        }
        ctx.fill(); ctx.stroke();
    };

    const drawUfo = () => {
      ctx.beginPath(); ctx.ellipse(0, 4, half, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -4, half/1.5, Math.PI, 0); ctx.fill(); ctx.stroke();
      if (id === 1) {
        ctx.fillStyle = secondaryColor; ctx.beginPath(); ctx.arc(0, -4, 3, 0, Math.PI*2); ctx.fill();
      } else if (id === 2) {
        ctx.beginPath(); ctx.moveTo(-half/2, 4); ctx.lineTo(half/2, 4); ctx.stroke();
      }
    };

    const drawRobot = () => {
      ctx.fillRect(-half+6, -half, s-12, half); ctx.strokeRect(-half+6, -half, s-12, half);
      ctx.fillRect(-half+2, 0, s-4, half); ctx.strokeRect(-half+2, 0, s-4, half);
      if (id === 1) {
        ctx.fillStyle = secondaryColor; ctx.fillRect(-half+10, -half+4, s-20, 4);
      } else if (id === 2) {
        ctx.beginPath(); ctx.moveTo(-half+6, -half/2); ctx.lineTo(half-6, -half/2); ctx.stroke();
      }
    };

    const drawSpider = () => {
      ctx.fillRect(-half/2, -half/2, half, half); ctx.strokeRect(-half/2, -half/2, half, half);
      const leg = (a: number) => {
        ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(half/4, 0); ctx.lineTo(half, -half/2); ctx.stroke(); ctx.restore();
      };
      leg(0.5); leg(-0.5); leg(Math.PI - 0.5); leg(Math.PI + 0.5);
      if (id === 1) {
        ctx.fillStyle = secondaryColor; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
      }
    };

    const drawSwing = () => {
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
    };

    switch(mode) {
      case 'CUBE': drawCube(); break;
      case 'SHIP': drawShip(); break;
      case 'BALL': drawBall(); break;
      case 'WAVE': drawWave(); break;
      case 'UFO': drawUfo(); break;
      case 'ROBOT': drawRobot(); break;
      case 'SPIDER': drawSpider(); break;
      case 'SWING': drawSwing(); break;
    }

    ctx.restore();
  }, [mode, id, primaryColor, secondaryColor, size, gravityDir]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className={`select-none pointer-events-none ${className}`} 
    />
  );
};

export default PlayerIcon;
