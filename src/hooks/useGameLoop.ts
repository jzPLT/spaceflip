import { useEffect, useRef } from 'react';
import { GAME_CONSTANTS } from '../constants';
import { Enemy, Bullet } from '../types';
import { getWavePattern, moveEnemy, isEnemyOffScreen, moveBullet, isBulletOffScreen, createEnemies, checkCollision } from '../gameLogic';

interface UseGameLoopProps {
  gameStarted: boolean;
  gamePaused: boolean;
  gameOver: boolean;
  gameCleared: boolean;
  setTimeLeft: (fn: (prev: number) => number) => void;
  setGameCleared: (cleared: boolean) => void;
  setWaveTimer: (fn: (prev: number) => number) => void;
  setEnemies: (fn: (prev: Enemy[]) => Enemy[]) => void;
  setBullets: (fn: (prev: Bullet[]) => Bullet[]) => void;
  setScore: (fn: (prev: number) => number) => void;
  nextId: React.RefObject<number>;
}

export const useGameLoop = ({
  gameStarted, gamePaused, gameOver, gameCleared,
  setTimeLeft, setGameCleared, setWaveTimer, setEnemies, setBullets, setScore, nextId
}: UseGameLoopProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const enemyMoveRef = useRef<NodeJS.Timeout | null>(null);
  const bulletMoveRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearIntervals = () => {
    [intervalRef, enemyMoveRef, bulletMoveRef, timerRef].forEach(ref => {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    });
  };

  // Clear intervals when paused, restart when unpaused
  useEffect(() => {
    if (gamePaused) {
      clearIntervals();
    }
  }, [gamePaused]);

  // Timer countdown
  useEffect(() => {
    if (gameStarted && !gamePaused && !gameOver && !gameCleared && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameCleared(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStarted, gamePaused, gameOver, gameCleared]);

  // Main game loop
  useEffect(() => {
    if (gameStarted && !gamePaused && !gameOver && !gameCleared && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setWaveTimer(prev => {
          const newTimer = prev + 1;
          
          setEnemies(currentEnemies => {
            const pattern = getWavePattern(newTimer);
            const newEnemies = createEnemies(currentEnemies, pattern, nextId);
            return [...currentEnemies, ...newEnemies];
          });
          
          return newTimer;
        });
      }, 200);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameStarted, gamePaused, gameOver, gameCleared]);

  // Enemy movement
  useEffect(() => {
    if (gameStarted && !gamePaused && !gameOver && !gameCleared && !enemyMoveRef.current) {
      enemyMoveRef.current = setInterval(() => {
        setEnemies(prev => prev.map(moveEnemy).filter(enemy => !isEnemyOffScreen(enemy)));
      }, 16);
    }

    return () => {
      if (enemyMoveRef.current) {
        clearInterval(enemyMoveRef.current);
        enemyMoveRef.current = null;
      }
    };
  }, [gameStarted, gamePaused, gameOver, gameCleared]);

  // Bullet movement
  useEffect(() => {
    if (gameStarted && !gamePaused && !gameOver && !gameCleared && !bulletMoveRef.current) {
      bulletMoveRef.current = setInterval(() => {
        setBullets(prev => prev.map(moveBullet).filter(bullet => !isBulletOffScreen(bullet)));
      }, 16);
    }

    return () => {
      if (bulletMoveRef.current) {
        clearInterval(bulletMoveRef.current);
        bulletMoveRef.current = null;
      }
    };
  }, [gameStarted, gamePaused, gameOver, gameCleared]);

  // Collision detection
  useEffect(() => {
    if (gameStarted && !gamePaused && !gameOver && !gameCleared) {
      const collisionInterval = setInterval(() => {
        let hitBulletIds = new Set<number>();
        
        setBullets(prevBullets => {
          setEnemies(prevEnemies => {
            const hitEnemyIds = new Set<number>();
            hitBulletIds = new Set<number>();

            prevBullets.forEach(bullet => {
              prevEnemies.forEach(enemy => {
                if (checkCollision(bullet.x, bullet.y, GAME_CONSTANTS.BULLET_SIZE, enemy.x, enemy.y, GAME_CONSTANTS.ENEMY_SIZE)) {
                  hitEnemyIds.add(enemy.id);
                  hitBulletIds.add(bullet.id);
                }
              });
            });

            if (hitEnemyIds.size > 0) {
              let totalScore = 0;
              hitEnemyIds.forEach(enemyId => {
                const enemy = prevEnemies.find(e => e.id === enemyId);
                if (enemy) {
                  totalScore += enemy.isFast ? 5 : 1;
                }
              });
              setScore(prev => prev + totalScore);
            }

            return prevEnemies.filter(enemy => !hitEnemyIds.has(enemy.id));
          });

          return prevBullets.filter(bullet => !hitBulletIds.has(bullet.id));
        });
      }, 32);

      return () => clearInterval(collisionInterval);
    }
  }, [gameStarted, gamePaused, gameOver, gameCleared]);

  return { clearIntervals };
};
