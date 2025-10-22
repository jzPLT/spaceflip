import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ImageBackground, Text } from 'react-native';
import KeyEvent from 'react-native-keyevent';
import { GAME_CONSTANTS, KEY_CODES } from './src/constants';
import { Position, Velocity, Enemy, Bullet, Ship } from './src/types';
import { GAME_ASSETS } from './src/assets';
import { ShipSelector, GameUI, GameEntities } from './src/components';
import {
  getWavePattern,
  moveEnemy,
  isEnemyOffScreen,
  checkCollision,
  handleShipNavigation,
  moveBullet,
  isBulletOffScreen,
  createBullet,
  updatePlayerPosition,
  createEnemies
} from './src/gameLogic';

export default function App() {
  const [playerPos, setPlayerPos] = useState<Position>({
    x: GAME_CONSTANTS.SCREEN_WIDTH / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2,
    y: GAME_CONSTANTS.SCREEN_HEIGHT / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_CONSTANTS.GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [gameCleared, setGameCleared] = useState(false);
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedShip, setSelectedShip] = useState<Ship>({ type: 1, color: 'blue' });
  const [showShipSelector, setShowShipSelector] = useState(true);
  const [shipSelected, setShipSelected] = useState(false);
  const [waveTimer, setWaveTimer] = useState(0);
  
  const shipSelectedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const enemyMoveRef = useRef<NodeJS.Timeout | null>(null);
  const bulletMoveRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressed = useRef<Set<number>>(new Set());
  const velocity = useRef<Velocity>({ x: 0, y: 0 });
  const nextId = useRef(0);
  const shootInterval = useRef<NodeJS.Timeout | null>(null);
  const playerPosRef = useRef(playerPos);

  const resetGame = () => {
    setPlayerPos({
      x: GAME_CONSTANTS.SCREEN_WIDTH / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2,
      y: GAME_CONSTANTS.SCREEN_HEIGHT / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2
    });
    setEnemies([]);
    setBullets([]);
    setGameStarted(false);
    setShipSelected(false);
    shipSelectedRef.current = false;
    setShowShipSelector(true);
    setTimeLeft(GAME_CONSTANTS.GAME_DURATION);
    setGameOver(false);
    setGameCleared(false);
    setScore(0);
    setIsFlipped(false);
    setWaveTimer(0);
    velocity.current = { x: 0, y: 0 };
    keysPressed.current.clear();
    
    [intervalRef, enemyMoveRef, bulletMoveRef, timerRef, shootInterval].forEach(ref => {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    });
  };

  // Timer countdown
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared && !timerRef.current) {
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
  }, [gameStarted, gameOver, gameCleared]);

  // Main game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared && !intervalRef.current) {
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
  }, [gameStarted, gameOver, gameCleared]);

  // Enemy movement
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared && !enemyMoveRef.current) {
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
  }, [gameStarted, gameOver, gameCleared]);

  // Bullet movement
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared && !bulletMoveRef.current) {
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
  }, [gameStarted, gameOver, gameCleared]);

  // Collision detection
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared) {
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
  }, [gameStarted, gameOver, gameCleared]);

  // Update position ref
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  // Key event handling
  useEffect(() => {
    const handleKeyDown = (keyEvent: { keyCode: number }) => {
      if (gameOver || gameCleared) {
        if (keyEvent.keyCode === KEY_CODES.CENTER) {
          resetGame();
        }
        return;
      }

      if (!shipSelectedRef.current) {
        handleShipNavigation(keyEvent.keyCode, selectedShip, setSelectedShip, shipSelectedRef, setShipSelected, setShowShipSelector);
        return;
      }

      keysPressed.current.add(keyEvent.keyCode);
      
      if (!gameStarted) {
        setGameStarted(true);
      }

      if (keyEvent.keyCode === KEY_CODES.PLAY_PAUSE && !shootInterval.current) {
        const shootBullet = () => {
          setBullets(prevBullets => [...prevBullets, createBullet(playerPosRef.current, isFlipped, nextId)]);
        };

        shootBullet();
        shootInterval.current = setInterval(shootBullet, 100);
      }

      if (keyEvent.keyCode === KEY_CODES.REWIND) {
        setIsFlipped(true);
      }

      if (keyEvent.keyCode === KEY_CODES.FAST_FORWARD) {
        setIsFlipped(false);
      }
    };

    const handleKeyUp = (keyEvent: { keyCode: number }) => {
      keysPressed.current.delete(keyEvent.keyCode);

      if (keyEvent.keyCode === KEY_CODES.PLAY_PAUSE && shootInterval.current) {
        clearInterval(shootInterval.current);
        shootInterval.current = null;
      }
    };

    KeyEvent.onKeyDownListener(handleKeyDown);
    KeyEvent.onKeyUpListener(handleKeyUp);
    
    return () => {
      KeyEvent.removeKeyDownListener();
      KeyEvent.removeKeyUpListener();
      if (shootInterval.current) {
        clearInterval(shootInterval.current);
        shootInterval.current = null;
      }
    };
  }, [gameStarted, gameOver, gameCleared, isFlipped, selectedShip]);

  // Player movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (!gameOver && !gameCleared) {
        setPlayerPos(prev => {
          const result = updatePlayerPosition(prev, velocity.current, keysPressed.current);
          velocity.current = result.velocity;
          return result.position;
        });
      }
    }, 16);

    return () => clearInterval(moveInterval);
  }, [gameOver, gameCleared]);

  // Player-enemy collision
  useEffect(() => {
    const collision = enemies.some(enemy => 
      checkCollision(playerPos.x, playerPos.y, GAME_CONSTANTS.PLAYER_SIZE, enemy.x, enemy.y, GAME_CONSTANTS.ENEMY_SIZE)
    );
    
    if (collision) {
      resetGame();
    }
  }, [enemies, playerPos]);

  return (
    <ImageBackground 
      source={GAME_ASSETS.background}
      style={styles.container}
      resizeMode="repeat"
    >
      <GameUI 
        timeLeft={timeLeft}
        score={score}
        gameOver={gameOver}
        gameCleared={gameCleared}
        gameStarted={gameStarted}
        shipSelected={shipSelected}
      />
      
      <ShipSelector 
        selectedShip={selectedShip}
        visible={!gameStarted && !shipSelected && showShipSelector}
      />

      {!gameStarted && !shipSelected && (
        <Text style={styles.rotateInstruction}>Rotate remote sideways</Text>
      )}
      
      <GameEntities 
        playerPos={playerPos}
        selectedShip={selectedShip}
        isFlipped={isFlipped}
        enemies={enemies}
        bullets={bullets}
        shipSelected={shipSelected}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  rotateInstruction: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    color: '#00ff00',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
