import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../data/colors.json';

const HomeScreen = ({ onReportPetPress, onViewPetList }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Inicio</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={onReportPetPress}
      >
        <Text style={styles.buttonText}>Reportar Mascota</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={onViewPetList}
      >
        <Text style={styles.secondaryButtonText}>Lista de Mascotas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fondo.app,
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.texto.primario,
    marginBottom: 40,
  },
  button: {
    width: 300,
    height: 50,
    backgroundColor: colors.botones.primario,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.varios.sombra,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: colors.botones.secundario,
    borderColor: colors.botones.textoSecundario,
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: colors.botones.textoSecundario,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default HomeScreen;