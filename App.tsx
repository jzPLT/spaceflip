import { StyleSheet, View, Dimensions, Text, Image, ImageBackground } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import KeyEvent from 'react-native-keyevent';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 40;
const ENEMY_SIZE = 30;
const BULLET_SIZE = 16; // Increased from 8 to 16 (2x)
const MAX_SPEED = 10; // Increased from 8 to 10
const ACCELERATION = 0.2;

const SHIP_ASSETS = {
  1: {
    blue: require('./assets/sprites/player/playerShip1_blue.png'),
    green: require('./assets/sprites/player/playerShip1_green.png'),
    orange: require('./assets/sprites/player/playerShip1_orange.png'),
    red: require('./assets/sprites/player/playerShip1_red.png'),
  },
  2: {
    blue: require('./assets/sprites/player/playerShip2_blue.png'),
    green: require('./assets/sprites/player/playerShip2_green.png'),
    orange: require('./assets/sprites/player/playerShip2_orange.png'),
    red: require('./assets/sprites/player/playerShip2_red.png'),
  },
  3: {
    blue: require('./assets/sprites/player/playerShip3_blue.png'),
    green: require('./assets/sprites/player/playerShip3_green.png'),
    orange: require('./assets/sprites/player/playerShip3_orange.png'),
    red: require('./assets/sprites/player/playerShip3_red.png'),
  },
};
const DECELERATION = 0.9;
const BULLET_SPEED = 288; // Increased from 96 to 288 (3x faster)

export default function App() {
  const [playerPos, setPlayerPos] = useState({
    x: width / 2 - PLAYER_SIZE / 2,
    y: height / 2 - PLAYER_SIZE / 2
  });
  
  const [enemies, setEnemies] = useState<Array<{x: number, y: number, id: number, isFast?: boolean, isMeteor?: boolean, age?: number, rotation?: number, rotationSpeed?: number, meteorSpeed?: number}>>([]);
  const [bullets, setBullets] = useState<Array<{x: number, y: number, id: number, direction: number}>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [gameCleared, setGameCleared] = useState(false);
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false); // Track if game is flipped
  const [selectedShip, setSelectedShip] = useState({ type: 1, color: 'blue' });
  const [showShipSelector, setShowShipSelector] = useState(true);
  const [shipSelected, setShipSelected] = useState(false);
  const shipSelectedRef = useRef(false);
  const [waveTimer, setWaveTimer] = useState(0);
  const [currentWave, setCurrentWave] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const enemyMoveRef = useRef<NodeJS.Timeout | null>(null);
  const bulletMoveRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressed = useRef<Set<number>>(new Set());
  const velocity = useRef({ x: 0, y: 0 });
  const nextId = useRef(0);
  const shootInterval = useRef<NodeJS.Timeout | null>(null);
  const playerPosRef = useRef(playerPos);

  const resetGame = () => {
    setPlayerPos({
      x: width / 2 - PLAYER_SIZE / 2,
      y: height / 2 - PLAYER_SIZE / 2
    });
    setEnemies([]);
    setBullets([]);
    setGameStarted(false);
    setShipSelected(false);
    shipSelectedRef.current = false;
    setShowShipSelector(true);
    setTimeLeft(30);
    setGameOver(false);
    setGameCleared(false);
    setScore(0);
    setIsFlipped(false);
    velocity.current = { x: 0, y: 0 };
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (enemyMoveRef.current) {
      clearInterval(enemyMoveRef.current);
      enemyMoveRef.current = null;
    }
    if (bulletMoveRef.current) {
      clearInterval(bulletMoveRef.current);
      bulletMoveRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (shootInterval.current) {
      clearInterval(shootInterval.current);
      shootInterval.current = null;
    }
  };

  const checkBulletPath = (bulletX: number, bulletY: number, nextBulletY: number, enemyX: number, enemyY: number) => {
    // Check if bullet path intersects with enemy rectangle
    const bulletLeft = bulletX;
    const bulletRight = bulletX + BULLET_SIZE;
    const enemyLeft = enemyX;
    const enemyRight = enemyX + ENEMY_SIZE;
    const enemyTop = enemyY;
    const enemyBottom = enemyY + ENEMY_SIZE;
    
    // Check horizontal overlap
    if (bulletRight < enemyLeft || bulletLeft > enemyRight) {
      return false;
    }
    
    // Check if bullet path crosses enemy vertically
    const bulletTop = Math.min(bulletY, nextBulletY);
    const bulletBottom = Math.max(bulletY, nextBulletY) + BULLET_SIZE;
    
    return bulletBottom >= enemyTop && bulletTop <= enemyBottom;
  };

  const checkCollision = (x1: number, y1: number, size1: number, x2: number, y2: number, size2: number) => {
    return x1 < x2 + size2 &&
           x1 + size1 > x2 &&
           y1 < y2 + size2 &&
           y1 + size1 > y2;
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

  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared && !intervalRef.current) {
      // Main game loop for spawning and collision detection
      intervalRef.current = setInterval(() => {
        // Wave-based enemy spawning
        setWaveTimer(prev => prev + 1);
        
        setEnemies(prev => {
          const currentEnemies = [...prev];
          
          // Wave patterns based on timer
          const wavePhase = Math.floor(waveTimer / 180) % 4; // Change wave every 3 seconds
          let spawnChance = 0.1;
          let enemyCount = 2;
          let enemyType = 'normal';
          
          switch(wavePhase) {
            case 0: // Normal wave
              spawnChance = 0.12;
              enemyCount = 3;
              enemyType = 'normal';
              break;
            case 1: // Fast wave  
              spawnChance = 0.08;
              enemyCount = 2;
              enemyType = 'fast';
              break;
            case 2: // Meteor wave
              spawnChance = 0.15;
              enemyCount = 4;
              enemyType = 'meteor';
              break;
            case 3: // Mixed chaos wave
              spawnChance = 0.18;
              enemyCount = 5;
              enemyType = 'mixed';
              break;
          }
          
          if (Math.random() < spawnChance && currentEnemies.length < 35) {
            const newEnemies = [];
            const numEnemies = Math.floor(Math.random() * 2) + enemyCount;
            const MIN_SPACING = ENEMY_SIZE + 15;
            
            for (let i = 0; i < numEnemies; i++) {
              let attempts = 0;
              let validPosition = false;
              let x, y;
              
              while (!validPosition && attempts < 100) {
                x = Math.random() * (width - ENEMY_SIZE);
                
                // Wave-based enemy type determination
                let isMeteor = false;
                if (enemyType === 'meteor') {
                  isMeteor = true;
                  y = height;
                } else if (enemyType === 'mixed') {
                  isMeteor = Math.random() < 0.5;
                  y = isMeteor ? height : -ENEMY_SIZE;
                } else {
                  y = -ENEMY_SIZE;
                }
                
                const allEnemies = [...currentEnemies, ...newEnemies];
                validPosition = true;
                for (const enemy of allEnemies) {
                  const distance = Math.abs(x - enemy.x) + Math.abs(y - enemy.y);
                  if (distance < MIN_SPACING) {
                    validPosition = false;
                    break;
                  }
                }
                
                attempts++;
              }
              
              if (validPosition) {
                const isFast = enemyType === 'fast' || (enemyType === 'mixed' && Math.random() < 0.4);
                const isMeteor = y === height;
                
                // Meteor-specific properties
                const rotation = isMeteor ? Math.random() * 360 : 0;
                const rotationSpeed = isMeteor ? (Math.random() * 4 - 2) : 0; // -2 to +2 degrees per frame
                const meteorSpeed = isMeteor ? 6 + Math.random() * 12 : 0; // Adjusted from 5-15 to 6-18
                
                newEnemies.push({
                  x: x!,
                  y: y!,
                  id: nextId.current++,
                  isFast,
                  isMeteor,
                  age: 0, // Start with age 0 for warp effect
                  rotation,
                  rotationSpeed,
                  meteorSpeed
                });
              }
            }
            
            currentEnemies.push(...newEnemies);
          }
          
          return currentEnemies;
        });

        // No bullet collision handling here - moved to separate loop
        setBullets(prevBullets => {
          return prevBullets; // No changes to bullets in this loop
        });
      }, 200); // Slower spawn/collision loop
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameStarted, gameOver, gameCleared]);

  // Separate smooth enemy movement loop
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared && !enemyMoveRef.current) {
      enemyMoveRef.current = setInterval(() => {
        setEnemies(prev => {
          return prev.map(enemy => {
            const newAge = (enemy.age || 0) + 1;
            // Warp-in effect: slower movement for first few frames
            const warpFactor = newAge < 10 ? Math.min(newAge / 10, 1) : 1;
            
            if (enemy.isMeteor) {
              // Meteors move upward with varying speeds and rotation
              const speed = (enemy.meteorSpeed || 7) * 0.4; // Balanced speed
              return {
                ...enemy,
                y: enemy.y - speed * warpFactor,
                age: newAge,
                rotation: (enemy.rotation || 0) + (enemy.rotationSpeed || 1) * 0.3
              };
            } else {
              // Regular enemies move downward with smooth movement
              const speed = (enemy.isFast ? 22 : 10) * 0.4; // Balanced speed
              return {
                ...enemy,
                y: enemy.y + speed * warpFactor,
                age: newAge
              };
            }
          }).filter(enemy => {
            // Remove enemies that go off screen
            if (enemy.isMeteor) {
              return enemy.y > -ENEMY_SIZE; // Meteors disappear at top
            } else {
              return enemy.y < height; // Regular enemies disappear at bottom
            }
          });
        });
      }, 16); // 60fps smooth movement
    }

    return () => {
      if (enemyMoveRef.current) {
        clearInterval(enemyMoveRef.current);
        enemyMoveRef.current = null;
      }
    };
  }, [gameStarted, gameOver, gameCleared]);

  // Separate smooth bullet movement loop
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared && !bulletMoveRef.current) {
      bulletMoveRef.current = setInterval(() => {
        setBullets(prevBullets => {
          // Just move bullets, collision detection handled separately
          return prevBullets.map(bullet => ({
            ...bullet,
            y: bullet.y + (BULLET_SPEED * bullet.direction * 0.08)
          })).filter(bullet => bullet.direction === 1 ? bullet.y < height + BULLET_SIZE : bullet.y > -BULLET_SIZE);
        });
      }, 16); // 60fps smooth movement
    }

    return () => {
      if (bulletMoveRef.current) {
        clearInterval(bulletMoveRef.current);
        bulletMoveRef.current = null;
      }
    };
  }, [gameStarted, gameOver, gameCleared]);

  // Separate collision detection loop to avoid state conflicts
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCleared) {
      const collisionInterval = setInterval(() => {
        let hitBulletIds = new Set<number>();
        
        setBullets(prevBullets => {
          setEnemies(prevEnemies => {
            const hitEnemyIds = new Set<number>();
            hitBulletIds = new Set<number>(); // Reset for this collision check

            prevBullets.forEach(bullet => {
              prevEnemies.forEach(enemy => {
                // Simple overlap collision detection
                if (bullet.x < enemy.x + ENEMY_SIZE &&
                    bullet.x + BULLET_SIZE > enemy.x &&
                    bullet.y < enemy.y + ENEMY_SIZE &&
                    bullet.y + BULLET_SIZE > enemy.y) {
                  hitEnemyIds.add(enemy.id);
                  hitBulletIds.add(bullet.id);
                }
              });
            });

            // Update score
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

          // Return bullets with hits removed
          return prevBullets.filter(bullet => !hitBulletIds.has(bullet.id));
        });
      }, 32); // 30fps collision detection

      return () => clearInterval(collisionInterval);
    }
  }, [gameStarted, gameOver, gameCleared]);

  // Update position ref
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos, gameStarted, gameOver, gameCleared, shipSelected]);

  useEffect(() => {
    const handleKeyDown = (keyEvent: { keyCode: number }) => {
      // If game is over or cleared, restart only on center button press (keyCode 23)
      if (gameOver || gameCleared) {
        if (keyEvent.keyCode === 23) { // D-pad center/select button
          resetGame();
        }
        return;
      }

      // Ship selector navigation (rotated 90 degrees left like game controls)
      if (!shipSelectedRef.current) {
        if (keyEvent.keyCode === 22) { // Right -> Up (ship type)
          setSelectedShip(current => {
            const types = [1, 2, 3];
            const currentTypeIndex = types.indexOf(current.type);
            const newTypeIndex = currentTypeIndex === 0 ? types.length - 1 : currentTypeIndex - 1;
            return { type: types[newTypeIndex], color: current.color };
          });
        } else if (keyEvent.keyCode === 21) { // Left -> Down (ship type)
          setSelectedShip(current => {
            const types = [1, 2, 3];
            const currentTypeIndex = types.indexOf(current.type);
            const newTypeIndex = currentTypeIndex === types.length - 1 ? 0 : currentTypeIndex + 1;
            return { type: types[newTypeIndex], color: current.color };
          });
        } else if (keyEvent.keyCode === 19) { // Up -> Left (color)
          setSelectedShip(current => {
            const colors = ['blue', 'green', 'orange', 'red'];
            const currentColorIndex = colors.indexOf(current.color);
            const newColorIndex = currentColorIndex === 0 ? colors.length - 1 : currentColorIndex - 1;
            return { type: current.type, color: colors[newColorIndex] };
          });
        } else if (keyEvent.keyCode === 20) { // Down -> Right (color)
          setSelectedShip(current => {
            const colors = ['blue', 'green', 'orange', 'red'];
            const currentColorIndex = colors.indexOf(current.color);
            const newColorIndex = currentColorIndex === colors.length - 1 ? 0 : currentColorIndex + 1;
            return { type: current.type, color: colors[newColorIndex] };
          });
        } else if (keyEvent.keyCode === 23) { // Center - Select ship
          shipSelectedRef.current = true;
          setShipSelected(true);
          setShowShipSelector(false);
        }
        return;
      }

      keysPressed.current.add(keyEvent.keyCode);
      
      if (!gameStarted) {
        setGameStarted(true);
      }
      
      if (!gameStarted) {
        setGameStarted(true);
      }

      // Start continuous shooting on play/pause button (keyCode 85)
      if (keyEvent.keyCode === 85 && !shootInterval.current) {
        // Shoot immediately from tip of sprite
        const createBullet = () => {
          const bulletX = playerPosRef.current.x + PLAYER_SIZE / 2 - (BULLET_SIZE * 2) / 2;
          const bulletY = isFlipped ? playerPosRef.current.y + PLAYER_SIZE : playerPosRef.current.y - BULLET_SIZE;
          const bulletDirection = isFlipped ? 1 : -1;
          
          setBullets(prevBullets => [...prevBullets, {
            x: bulletX,
            y: bulletY,
            id: nextId.current++,
            direction: bulletDirection
          }]);
        };

        createBullet(); // Shoot immediately

        // Start continuous shooting with functional updates
        shootInterval.current = setInterval(() => {
          createBullet();
        }, 100); // Reduced from 150ms to 100ms for more consistent stream
      }

      // Flip game on rewind button (keyCode 89)
      if (keyEvent.keyCode === 89) {
        setIsFlipped(true);
      }

      // Unflip game on fast forward button (keyCode 90)
      if (keyEvent.keyCode === 90) {
        setIsFlipped(false);
      }
    };

    const handleKeyUp = (keyEvent: { keyCode: number }) => {
      keysPressed.current.delete(keyEvent.keyCode);

      // Stop shooting when play/pause button is released
      if (keyEvent.keyCode === 85 && shootInterval.current) {
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
  }, [gameStarted, gameOver, gameCleared, isFlipped]);

  // Movement with acceleration/deceleration
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (!gameOver && !gameCleared) {
        setPlayerPos(prev => {
          let targetVelX = 0;
          let targetVelY = 0;
          
          // Remapped for 90-degree left rotation: up->left, right->up, down->right, left->down
          if (keysPressed.current.has(19)) targetVelX -= MAX_SPEED; // Up becomes Left
          if (keysPressed.current.has(20)) targetVelX += MAX_SPEED; // Down becomes Right  
          if (keysPressed.current.has(21)) targetVelY += MAX_SPEED; // Left becomes Down
          if (keysPressed.current.has(22)) targetVelY -= MAX_SPEED; // Right becomes Up
          
          if (targetVelX !== 0) {
            velocity.current.x += (targetVelX - velocity.current.x) * ACCELERATION;
          } else {
            velocity.current.x *= DECELERATION;
          }
          
          if (targetVelY !== 0) {
            velocity.current.y += (targetVelY - velocity.current.y) * ACCELERATION;
          } else {
            velocity.current.y *= DECELERATION;
          }
          
          if (Math.abs(velocity.current.x) < 0.1) velocity.current.x = 0;
          if (Math.abs(velocity.current.y) < 0.1) velocity.current.y = 0;
          
          const newX = Math.max(0, Math.min(width - PLAYER_SIZE, prev.x + velocity.current.x));
          const newY = Math.max(0, Math.min(height - PLAYER_SIZE, prev.y + velocity.current.y));
          
          return { x: newX, y: newY };
        });
      }
    }, 16);

    return () => clearInterval(moveInterval);
  }, [gameOver, gameCleared]);

  // Check player-enemy collisions
  useEffect(() => {
    const collision = enemies.some(enemy => 
      checkCollision(playerPos.x, playerPos.y, PLAYER_SIZE, enemy.x, enemy.y, ENEMY_SIZE)
    );
    
    if (collision) {
      resetGame();
    }
  }, [enemies, playerPos]);

  return (
    <ImageBackground 
      source={require('./assets/sprites/environment/blue.png')}
      style={styles.container}
      resizeMode="repeat"
    >
      {shipSelected && <Text style={styles.timer}>{timeLeft}s</Text>}
      {shipSelected && <Text style={styles.scoreCounter}>Score: {score}</Text>}
      
      {!gameStarted && !shipSelected && showShipSelector && (
        <View style={styles.shipSelectorContainer}>
          <Text style={styles.shipSelectorTitle}>Choose Your Ship</Text>
          <View style={styles.shipGrid}>
            {[1, 2, 3].map(type => (
              <View key={type} style={styles.shipTypeRow}>
                {['blue', 'green', 'orange', 'red'].map(color => (
                  <View 
                    key={`${type}-${color}`} 
                    style={[
                      styles.shipOption,
                      selectedShip.type === type && selectedShip.color === color && styles.selectedShip
                    ]}
                  >
                    <Image 
                      source={SHIP_ASSETS[type][color]}
                      style={styles.shipPreview as any}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}

      {!gameStarted && !shipSelected && (
        <Text style={styles.rotateInstruction}>Rotate remote sideways</Text>
      )}

      {!gameStarted && shipSelected && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>↑↓←→ Move around</Text>
          <Text style={styles.instructionsText}>⏯ Shoot</Text>
          <Text style={styles.instructionsText}>⏪ Flip ship down</Text>
          <Text style={styles.instructionsText}>⏩ Flip ship up</Text>
          <Text style={styles.startText}>Rotate remote sideways - Press any button to start!</Text>
        </View>
      )}
      
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.instructionText}>Press center button to restart</Text>
        </View>
      )}

      {gameCleared && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameClearedText}>GAME CLEARED!</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
          <Text style={styles.instructionText}>Press center button to restart</Text>
        </View>
      )}
      
      {/* Player ship - only show after ship selection */}
      {shipSelected && (
        <Image 
          source={SHIP_ASSETS[selectedShip.type][selectedShip.color]}
          style={[
            styles.player as any,
            {
              left: playerPos.x,
              top: playerPos.y,
              transform: [{ scaleY: isFlipped ? -1 : 1 }], // Flip player sprite
            }
          ] as any}
        />
      )}
      
      {enemies.map((enemy) => (
        <Image
          key={enemy.id}
          source={enemy.isMeteor 
            ? require('./assets/sprites/enemy/meteorBrown_med3.png')
            : enemy.isFast 
              ? require('./assets/sprites/enemy/enemyGreen2.png')
              : require('./assets/sprites/enemy/enemyRed1.png')
          }
          style={[
            styles.enemy as any,
            {
              left: enemy.x,
              top: enemy.y,
              transform: enemy.isMeteor ? [{ rotate: `${enemy.rotation || 0}deg` }] : undefined
            }
          ] as any}
        />
      ))}

      {bullets.map((bullet) => (
        <Image
          key={bullet.id}
          source={require('./assets/sprites/player/laserBlue01.png')}
          style={[
            styles.bullet as any,
            {
              left: bullet.x,
              top: bullet.y,
              transform: bullet.direction === 1 ? [{ rotate: '180deg' }] : undefined
            }
          ] as any}
        />
      ))}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  timer: {
    position: 'absolute',
    top: 20,
    left: 20,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    zIndex: 100,
  },
  scoreCounter: {
    position: 'absolute',
    top: 20,
    right: 20,
    color: '#ffff00',
    fontSize: 24,
    fontWeight: 'bold',
    zIndex: 100,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 200,
  },
  gameOverText: {
    color: '#ff0000',
    fontSize: 48,
    fontWeight: 'bold',
  },
  gameClearedText: {
    color: '#00ff00',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  finalScoreText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  instructionText: {
    color: '#ccc',
    fontSize: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructionsText: {
    color: '#ccc',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  startText: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  shipSelectorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -150 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    width: 400,
    height: 300,
  },
  shipSelectorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  shipGrid: {
    flex: 1,
    justifyContent: 'space-around',
  },
  shipTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  shipOption: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedShip: {
    borderColor: '#00ff00',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  shipPreview: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  shipSelectorInstructions: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
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
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    resizeMode: 'contain',
  },
  enemy: {
    position: 'absolute',
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    resizeMode: 'contain',
  },
  bullet: {
    position: 'absolute',
    width: BULLET_SIZE * 2, // Width is 2x (32)
    height: BULLET_SIZE, // Height stays original (16)
    resizeMode: 'contain',
  },
});
