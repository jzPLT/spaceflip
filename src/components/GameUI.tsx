import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameUIProps {
  timeLeft: number;
  score: number;
  gameOver: boolean;
  gameCleared: boolean;
  gameStarted: boolean;
  shipSelected: boolean;
}

export const GameUI: React.FC<GameUIProps> = ({ 
  timeLeft, 
  score, 
  gameOver, 
  gameCleared, 
  gameStarted, 
  shipSelected 
}) => {
  return (
    <>
      {shipSelected && (
        <>
          <Text style={styles.timer}>{timeLeft}s</Text>
          <Text style={styles.score}>Score: {score}</Text>
        </>
      )}
      
      {!gameStarted && shipSelected && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>↑↓←→ Move around</Text>
          <Text style={styles.instructionText}>⏯ Shoot</Text>
          <Text style={styles.instructionText}>⏪ Flip ship down</Text>
          <Text style={styles.instructionText}>⏩ Flip ship up</Text>
          <Text style={styles.startText}>Rotate remote sideways - Press any button to start!</Text>
        </View>
      )}
      
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.restartText}>Press center button to restart</Text>
        </View>
      )}

      {gameCleared && (
        <View style={styles.overlay}>
          <Text style={styles.gameClearedText}>GAME CLEARED!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <Text style={styles.restartText}>Press center button to restart</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  timer: {
    position: 'absolute',
    top: 20,
    left: 20,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    zIndex: 100,
  },
  score: {
    position: 'absolute',
    top: 20,
    right: 20,
    color: '#ffff00',
    fontSize: 24,
    fontWeight: 'bold',
    zIndex: 100,
  },
  instructions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  instructionText: {
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
  overlay: {
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
  finalScore: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  restartText: {
    color: '#ccc',
    fontSize: 20,
    marginTop: 20,
    textAlign: 'center',
  },
});
