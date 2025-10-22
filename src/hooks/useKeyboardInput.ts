import { useEffect, useRef } from 'react';
import KeyEvent from 'react-native-keyevent';
import { KEY_CODES } from '../constants';
import { Ship, Position } from '../types';
import { handleShipNavigation, createBullet, updatePlayerPosition } from '../gameLogic';

interface UseKeyboardInputProps {
  gameStarted: boolean;
  gameOver: boolean;
  gameCleared: boolean;
  isFlipped: boolean;
  selectedShip: Ship;
  shipSelectedRef: React.MutableRefObject<boolean>;
  playerPosRef: React.MutableRefObject<Position>;
  velocity: React.MutableRefObject<{ x: number; y: number }>;
  nextId: React.MutableRefObject<number>;
  resetGame: () => void;
  setSelectedShip: (ship: Ship | ((prev: Ship) => Ship)) => void;
  setShipSelected: (selected: boolean) => void;
  setShowShipSelector: (show: boolean) => void;
  setGameStarted: (started: boolean) => void;
  setIsFlipped: (flipped: boolean) => void;
  setBullets: (fn: (prev: any[]) => any[]) => void;
  setPlayerPos: (fn: (prev: Position) => Position) => void;
}

export const useKeyboardInput = ({
  gameStarted, gameOver, gameCleared, isFlipped, selectedShip,
  shipSelectedRef, playerPosRef, velocity, nextId,
  resetGame, setSelectedShip, setShipSelected, setShowShipSelector,
  setGameStarted, setIsFlipped, setBullets, setPlayerPos
}: UseKeyboardInputProps) => {
  const keysPressed = useRef<Set<number>>(new Set());
  const shootInterval = useRef<NodeJS.Timeout | null>(null);

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

  return { keysPressed };
};
