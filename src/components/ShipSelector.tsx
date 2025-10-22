import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ship } from '../types';
import { SHIP_ASSETS } from '../assets';

interface ShipSelectorProps {
  selectedShip: Ship;
  visible: boolean;
}

export const ShipSelector: React.FC<ShipSelectorProps> = ({ selectedShip, visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Ship</Text>
      <View style={styles.grid}>
        {[1, 2, 3].map(type => (
          <View key={type} style={styles.typeRow}>
            {['blue', 'green', 'orange', 'red'].map(color => (
              <View 
                key={`${type}-${color}`} 
                style={[
                  styles.option,
                  selectedShip.type === type && selectedShip.color === color && styles.selected
                ]}
              >
                <Image 
                  source={SHIP_ASSETS[type][color]}
                  style={styles.preview as any}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -150 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    width: 400,
    height: 300,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flex: 1,
    justifyContent: 'space-around',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  option: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#00ff00',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  preview: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
