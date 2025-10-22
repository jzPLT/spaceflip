export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Enemy {
  x: number;
  y: number;
  id: number;
  isFast?: boolean;
  isMeteor?: boolean;
  age?: number;
  rotation?: number;
  rotationSpeed?: number;
  meteorSpeed?: number;
}

export interface Bullet {
  x: number;
  y: number;
  id: number;
  direction: number;
}

export interface Ship {
  type: 1 | 2 | 3;
  color: 'blue' | 'green' | 'orange' | 'red';
}

export interface WavePattern {
  spawnChance: number;
  enemyCount: number;
  meteorChance: number;
  fastChance: number;
}

export interface GameState {
  playerPos: Position;
  enemies: Enemy[];
  bullets: Bullet[];
  gameStarted: boolean;
  timeLeft: number;
  gameOver: boolean;
  gameCleared: boolean;
  score: number;
  isFlipped: boolean;
  selectedShip: Ship;
  showShipSelector: boolean;
  shipSelected: boolean;
  waveTimer: number;
}
