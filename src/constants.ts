import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const GAME_CONSTANTS = {
  PLAYER_SIZE: 40,
  ENEMY_SIZE: 30,
  BULLET_SIZE: 16,
  MAX_SPEED: 10,
  ACCELERATION: 0.2,
  DECELERATION: 0.9,
  BULLET_SPEED: 288,
  GAME_DURATION: 30,
  MAX_ENEMIES: 35,
  MIN_ENEMY_SPACING: 45, // ENEMY_SIZE + 15
  SCREEN_WIDTH: width,
  SCREEN_HEIGHT: height,
};

export const KEY_CODES = {
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  CENTER: 23,
  PLAY_PAUSE: 85,
  REWIND: 89,
  FAST_FORWARD: 90,
};

export const WAVE_PATTERNS = [
  { spawnChance: 0.15, enemyCount: 3, meteorChance: 0.2, fastChance: 0.15 }, // Light
  { spawnChance: 0.18, enemyCount: 4, meteorChance: 0.3, fastChance: 0.25 }, // Medium
  { spawnChance: 0.22, enemyCount: 5, meteorChance: 0.4, fastChance: 0.35 }, // Heavy
  { spawnChance: 0.25, enemyCount: 6, meteorChance: 0.5, fastChance: 0.4 },  // Chaos
];
