import { useEffect } from 'react';
import { GAME_CONSTANTS } from '../constants';
import { Position, Enemy } from '../types';
import { checkCollision } from '../gameLogic';

interface UseCollisionDetectionProps {
  playerPos: Position;
  enemies: Enemy[];
  resetGame: () => void;
  playerPosRef: React.RefObject<Position>;
}

export const useCollisionDetection = ({
  playerPos,
  enemies,
  resetGame,
  playerPosRef
}: UseCollisionDetectionProps) => {
  // Update position ref
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  // Player-enemy collision
  useEffect(() => {
    const collision = enemies.some(enemy => 
      checkCollision(playerPos.x, playerPos.y, GAME_CONSTANTS.PLAYER_SIZE, enemy.x, enemy.y, GAME_CONSTANTS.ENEMY_SIZE)
    );
    
    if (collision) {
      resetGame();
    }
  }, [enemies, playerPos]);
};
