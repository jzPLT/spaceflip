import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Enemy, Bullet, Position, Ship } from '../types';
import { SHIP_ASSETS, GAME_ASSETS } from '../assets';
import { GAME_CONSTANTS } from '../constants';

interface GameEntitiesProps {
  playerPos: Position;
  selectedShip: Ship;
  isFlipped: boolean;
  enemies: Enemy[];
  bullets: Bullet[];
  shipSelected: boolean;
}

export const GameEntities: React.FC<GameEntitiesProps> = ({
  playerPos,
  selectedShip,
  isFlipped,
  enemies,
  bullets,
  shipSelected
}) => {
  return (
    <>
      {shipSelected && (
        <Image 
          source={SHIP_ASSETS[selectedShip.type][selectedShip.color]}
          style={[
            styles.player as any,
            {
              left: playerPos.x,
              top: playerPos.y,
              transform: [{ scaleY: isFlipped ? -1 : 1 }],
            }
          ] as any}
        />
      )}
      
      {enemies.map((enemy) => (
        <Image
          key={enemy.id}
          source={enemy.isMeteor 
            ? GAME_ASSETS.enemies.meteor
            : enemy.isFast 
              ? GAME_ASSETS.enemies.fast
              : GAME_ASSETS.enemies.regular
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
          source={GAME_ASSETS.bullet}
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
    </>
  );
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: GAME_CONSTANTS.PLAYER_SIZE,
    height: GAME_CONSTANTS.PLAYER_SIZE,
    resizeMode: 'contain',
  },
  enemy: {
    position: 'absolute',
    width: GAME_CONSTANTS.ENEMY_SIZE,
    height: GAME_CONSTANTS.ENEMY_SIZE,
    resizeMode: 'contain',
  },
  bullet: {
    position: 'absolute',
    width: GAME_CONSTANTS.BULLET_SIZE * 2,
    height: GAME_CONSTANTS.BULLET_SIZE,
    resizeMode: 'contain',
  },
});
