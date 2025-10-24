import { useState, useRef, useEffect } from 'react';
import { GAME_CONSTANTS } from '../constants';
import { Position, Velocity, Enemy, Bullet, Ship } from '../types';
import { PaymentService } from '../services/paymentService';

export const useGameState = () => {
  const [playerPos, setPlayerPos] = useState<Position>({
    x: GAME_CONSTANTS.SCREEN_WIDTH / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2,
    y: GAME_CONSTANTS.SCREEN_HEIGHT / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_CONSTANTS.GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [gameCleared, setGameCleared] = useState(false);
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedShip, setSelectedShip] = useState<Ship>({ type: 1, color: 'blue' });
  const [showShipSelector, setShowShipSelector] = useState(true);
  const [waveTimer, setWaveTimer] = useState(0);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);
  
  const shipSelectedRef = useRef(false);
  const velocity = useRef<Velocity>({ x: 0, y: 0 });
  const nextId = useRef(0);
  const playerPosRef = useRef(playerPos);

  const resetGame = () => {
    setPlayerPos({
      x: GAME_CONSTANTS.SCREEN_WIDTH / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2,
      y: GAME_CONSTANTS.SCREEN_HEIGHT / 2 - GAME_CONSTANTS.PLAYER_SIZE / 2
    });
    setEnemies([]);
    setBullets([]);
    setGameStarted(false);
    setGamePaused(false);
    shipSelectedRef.current = false;
    setShowShipSelector(true);
    setTimeLeft(GAME_CONSTANTS.GAME_DURATION);
    setGameOver(false);
    setGameCleared(false);
    setScore(0);
    setIsFlipped(false);
    setWaveTimer(0);
    velocity.current = { x: 0, y: 0 };
  };

  // Load payment status on app start
  useEffect(() => {
    PaymentService.checkPaymentStatus().then(paid => {
      setIsPaidUser(paid);
      setPaymentLoading(false);
    });
  }, []);

  return {
    // State
    playerPos, setPlayerPos,
    enemies, setEnemies,
    bullets, setBullets,
    gameStarted, setGameStarted,
    gamePaused, setGamePaused,
    timeLeft, setTimeLeft,
    gameOver, setGameOver,
    gameCleared, setGameCleared,
    score, setScore,
    isFlipped, setIsFlipped,
    selectedShip, setSelectedShip,
    showShipSelector, setShowShipSelector,
    waveTimer, setWaveTimer,
    isPaidUser, setIsPaidUser,
    paymentLoading,
    
    // Refs
    shipSelectedRef,
    velocity,
    nextId,
    playerPosRef,
    
    // Actions
    resetGame
  };
};
