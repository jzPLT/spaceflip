import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LockOverlay: React.FC = () => {
  return (
    <View style={styles.overlay}>
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.text}>PRO</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    zIndex: 1,
  },
  lockIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
