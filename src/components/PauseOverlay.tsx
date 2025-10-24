import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PauseOverlayProps {
  visible: boolean;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>PAUSED</Text>
        <Text style={styles.instruction}>Press CENTER to resume</Text>
        <Text style={styles.instruction}>or say "Alexa, resume game"</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff00',
    alignItems: 'center',
  },
  title: {
    color: '#00ff00',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instruction: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
});
