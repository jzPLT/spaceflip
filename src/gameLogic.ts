import { GAME_CONSTANTS, WAVE_PATTERNS, KEY_CODES } from './constants';
import { Enemy, Bullet, Position, Velocity, WavePattern, Ship } from './types';

export const getWavePattern = (waveTimer: number): WavePattern => {
  const wavePhase = Math.floor(waveTimer / 300) % 4;
  return WAVE_PATTERNS[wavePhase] || WAVE_PATTERNS[0];
};

export const moveEnemy = (enemy: Enemy): Enemy => {
  const newAge = (enemy.age || 0) + 1;
  const warpFactor = newAge < 10 ? Math.min(newAge / 10, 1) : 1;
  
  if (enemy.isMeteor) {
    const speed = (enemy.meteorSpeed || 7) * 0.4;
    return {
      ...enemy,
      y: enemy.y - speed * warpFactor,
      age: newAge,
      rotation: (enemy.rotation || 0) + (enemy.rotationSpeed || 1) * 0.3
    };
  } else {
    const speed = (enemy.isFast ? 22 : 10) * 0.4;
    return {
      ...enemy,
      y: enemy.y + speed * warpFactor,
      age: newAge
    };
  }
};

export const isEnemyOffScreen = (enemy: Enemy): boolean => {
  if (enemy.isMeteor) {
    return enemy.y <= -GAME_CONSTANTS.ENEMY_SIZE;
  } else {
    return enemy.y >= GAME_CONSTANTS.SCREEN_HEIGHT;
  }
};

export const checkCollision = (x1: number, y1: number, size1: number, x2: number, y2: number, size2: number): boolean => {
  return x1 < x2 + size2 &&
         x1 + size1 > x2 &&
         y1 < y2 + size2 &&
         y1 + size1 > y2;
};

export const handleShipNavigation = (
  keyCode: number, 
  selectedShip: Ship, 
  setSelectedShip: (ship: Ship | ((prev: Ship) => Ship)) => void,
  shipSelectedRef: React.MutableRefObject<boolean>,
  setShipSelected: (selected: boolean) => void,
  setShowShipSelector: (show: boolean) => void
): void => {
  if (keyCode === KEY_CODES.RIGHT) { // Right -> Up (ship type)
    setSelectedShip((current: Ship) => {
      const types = [1, 2, 3] as const;
      const currentTypeIndex = types.indexOf(current.type);
      const newTypeIndex = currentTypeIndex === 0 ? types.length - 1 : currentTypeIndex - 1;
      return { type: types[newTypeIndex], color: current.color };
    });
  } else if (keyCode === KEY_CODES.LEFT) { // Left -> Down (ship type)
    setSelectedShip((current: Ship) => {
      const types = [1, 2, 3] as const;
      const currentTypeIndex = types.indexOf(current.type);
      const newTypeIndex = currentTypeIndex === types.length - 1 ? 0 : currentTypeIndex + 1;
      return { type: types[newTypeIndex], color: current.color };
    });
  } else if (keyCode === KEY_CODES.UP) { // Up -> Left (color)
    setSelectedShip((current: Ship) => {
      const colors = ['blue', 'green', 'orange', 'red'] as const;
      const currentColorIndex = colors.indexOf(current.color);
      const newColorIndex = currentColorIndex === 0 ? colors.length - 1 : currentColorIndex - 1;
      return { type: current.type, color: colors[newColorIndex] };
    });
  } else if (keyCode === KEY_CODES.DOWN) { // Down -> Right (color)
    setSelectedShip((current: Ship) => {
      const colors = ['blue', 'green', 'orange', 'red'] as const;
      const currentColorIndex = colors.indexOf(current.color);
      const newColorIndex = currentColorIndex === colors.length - 1 ? 0 : currentColorIndex + 1;
      return { type: current.type, color: colors[newColorIndex] };
    });
  } else if (keyCode === KEY_CODES.CENTER) { // Center - Select ship
    shipSelectedRef.current = true;
    setShipSelected(true);
    setShowShipSelector(false);
  }
};

export const moveBullet = (bullet: Bullet): Bullet => {
  return {
    ...bullet,
    y: bullet.y + (GAME_CONSTANTS.BULLET_SPEED * bullet.direction * 0.08)
  };
};

export const isBulletOffScreen = (bullet: Bullet): boolean => {
  return bullet.y < -GAME_CONSTANTS.BULLET_SIZE || bullet.y > GAME_CONSTANTS.SCREEN_HEIGHT;
};

export const createBullet = (playerPos: Position, isFlipped: boolean, nextId: React.MutableRefObject<number>): Bullet => {
  const bulletX = playerPos.x + GAME_CONSTANTS.PLAYER_SIZE / 2 - (GAME_CONSTANTS.BULLET_SIZE * 2) / 2;
  const bulletY = isFlipped ? playerPos.y + GAME_CONSTANTS.PLAYER_SIZE : playerPos.y - GAME_CONSTANTS.BULLET_SIZE;
  const bulletDirection = isFlipped ? 1 : -1;
  
  return {
    x: bulletX,
    y: bulletY,
    id: nextId.current++,
    direction: bulletDirection
  };
};

export const updatePlayerPosition = (
  playerPos: Position, 
  velocity: Velocity, 
  keysPressed: Set<number>
): { position: Position; velocity: Velocity } => {
  let targetVelX = 0;
  let targetVelY = 0;
  
  // Remapped for 90-degree left rotation
  if (keysPressed.has(KEY_CODES.UP)) targetVelX -= GAME_CONSTANTS.MAX_SPEED;
  if (keysPressed.has(KEY_CODES.DOWN)) targetVelX += GAME_CONSTANTS.MAX_SPEED;
  if (keysPressed.has(KEY_CODES.LEFT)) targetVelY += GAME_CONSTANTS.MAX_SPEED;
  if (keysPressed.has(KEY_CODES.RIGHT)) targetVelY -= GAME_CONSTANTS.MAX_SPEED;
  
  // Apply acceleration/deceleration
  let newVelocity = { ...velocity };
  
  if (targetVelX !== 0) {
    newVelocity.x += (targetVelX - velocity.x) * GAME_CONSTANTS.ACCELERATION;
  } else {
    newVelocity.x *= GAME_CONSTANTS.DECELERATION;
  }
  
  if (targetVelY !== 0) {
    newVelocity.y += (targetVelY - velocity.y) * GAME_CONSTANTS.ACCELERATION;
  } else {
    newVelocity.y *= GAME_CONSTANTS.DECELERATION;
  }
  
  // Clean up tiny velocities
  if (Math.abs(newVelocity.x) < 0.1) newVelocity.x = 0;
  if (Math.abs(newVelocity.y) < 0.1) newVelocity.y = 0;
  
  // Update position with boundaries
  const newPos = {
    x: Math.max(0, Math.min(GAME_CONSTANTS.SCREEN_WIDTH - GAME_CONSTANTS.PLAYER_SIZE, playerPos.x + newVelocity.x)),
    y: Math.max(0, Math.min(GAME_CONSTANTS.SCREEN_HEIGHT - GAME_CONSTANTS.PLAYER_SIZE, playerPos.y + newVelocity.y))
  };
  
  return { position: newPos, velocity: newVelocity };
};

export const createEnemies = (currentEnemies: Enemy[], pattern: WavePattern, nextId: React.MutableRefObject<number>): Enemy[] => {
  if (Math.random() >= pattern.spawnChance || currentEnemies.length >= GAME_CONSTANTS.MAX_ENEMIES) {
    return [];
  }

  const newEnemies: Enemy[] = [];
  const numEnemies = Math.floor(Math.random() * 2) + pattern.enemyCount;
  
  for (let i = 0; i < numEnemies; i++) {
    let attempts = 0;
    let validPosition = false;
    let x: number, y: number;
    
    while (!validPosition && attempts < 100) {
      x = Math.random() * (GAME_CONSTANTS.SCREEN_WIDTH - GAME_CONSTANTS.ENEMY_SIZE);
      
      const isMeteor = Math.random() < pattern.meteorChance;
      y = isMeteor ? GAME_CONSTANTS.SCREEN_HEIGHT : -GAME_CONSTANTS.ENEMY_SIZE;
      
      const allEnemies = [...currentEnemies, ...newEnemies];
      validPosition = true;
      for (const enemy of allEnemies) {
        const distance = Math.abs(x - enemy.x) + Math.abs(y - enemy.y);
        if (distance < GAME_CONSTANTS.MIN_ENEMY_SPACING) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    }
    
    if (validPosition) {
      const isMeteor = y! === GAME_CONSTANTS.SCREEN_HEIGHT;
      const isFast = !isMeteor && Math.random() < pattern.fastChance;
      
      const rotation = isMeteor ? Math.random() * 360 : 0;
      const rotationSpeed = isMeteor ? (Math.random() * 4 - 2) : 0;
      const meteorSpeed = isMeteor ? 6 + Math.random() * 12 : 0;
      
      newEnemies.push({
        x: x!,
        y: y!,
        id: nextId.current++,
        isFast,
        isMeteor,
        age: 0,
        rotation,
        rotationSpeed,
        meteorSpeed
      });
    }
  }
  
  return newEnemies;
};
