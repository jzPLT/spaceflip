import React from 'react';
import { StyleSheet, ImageBackground, Text } from 'react-native';
import { GAME_ASSETS } from './src/assets';
import { ShipSelector, GameUI, GameEntities } from './src/components';
import { useGameState, useGameLoop, useKeyboardInput, useCollisionDetection } from './src/hooks';

export default function App() {
  const gameState = useGameState();
  
  const { clearIntervals } = useGameLoop({
    gameStarted: gameState.gameStarted,
    gameOver: gameState.gameOver,
    gameCleared: gameState.gameCleared,
    setTimeLeft: gameState.setTimeLeft,
    setGameCleared: gameState.setGameCleared,
    setWaveTimer: gameState.setWaveTimer,
    setEnemies: gameState.setEnemies,
    setBullets: gameState.setBullets,
    setScore: gameState.setScore,
    nextId: gameState.nextId
  });

  const resetGameWithCleanup = () => {
    clearIntervals();
    gameState.resetGame();
  };

  useKeyboardInput({
    gameStarted: gameState.gameStarted,
    gameOver: gameState.gameOver,
    gameCleared: gameState.gameCleared,
    isFlipped: gameState.isFlipped,
    selectedShip: gameState.selectedShip,
    isPaidUser: gameState.isPaidUser,
    shipSelectedRef: gameState.shipSelectedRef,
    playerPosRef: gameState.playerPosRef,
    velocity: gameState.velocity,
    nextId: gameState.nextId,
    resetGame: resetGameWithCleanup,
    setSelectedShip: gameState.setSelectedShip,
    setShipSelected: gameState.setShipSelected,
    setShowShipSelector: gameState.setShowShipSelector,
    setGameStarted: gameState.setGameStarted,
    setIsFlipped: gameState.setIsFlipped,
    setBullets: gameState.setBullets,
    setPlayerPos: gameState.setPlayerPos
  });

  useCollisionDetection({
    playerPos: gameState.playerPos,
    enemies: gameState.enemies,
    resetGame: resetGameWithCleanup,
    playerPosRef: gameState.playerPosRef
  });

  return (
    <ImageBackground 
      source={GAME_ASSETS.background}
      style={styles.container}
      resizeMode="repeat"
    >
      <GameUI 
        timeLeft={gameState.timeLeft}
        score={gameState.score}
        gameOver={gameState.gameOver}
        gameCleared={gameState.gameCleared}
        gameStarted={gameState.gameStarted}
        shipSelected={gameState.shipSelected}
      />
      
      <ShipSelector 
        selectedShip={gameState.selectedShip}
        visible={!gameState.gameStarted && !gameState.shipSelected && gameState.showShipSelector}
        isPaidUser={gameState.isPaidUser}
      />

      {!gameState.gameStarted && !gameState.shipSelected && (
        <Text style={styles.rotateInstruction}>Rotate remote sideways</Text>
      )}
      
      <GameEntities 
        playerPos={gameState.playerPos}
        selectedShip={gameState.selectedShip}
        isFlipped={gameState.isFlipped}
        enemies={gameState.enemies}
        bullets={gameState.bullets}
        shipSelected={gameState.shipSelected}
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
