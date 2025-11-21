import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../data/colors.json';

const RegisterScreen = ({ onLoginPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Registro</Text>
      <Text>Aquí se registraría un nuevo usuario.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onLoginPress}
      >
        <Text style={styles.buttonText}>Volver a Iniciar Sesión</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.texto.primario,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.botones.primario,
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;