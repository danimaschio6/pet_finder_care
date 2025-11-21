import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../data/colors.json';

const PetListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>PANTALLA DE LISTA DE MASCOTAS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fondo.app,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.texto.primario,
  },
});

export default PetListScreen;