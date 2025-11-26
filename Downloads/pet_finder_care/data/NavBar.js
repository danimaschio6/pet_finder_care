import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../data/colors.json';

const NavBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.title}>Pet Finder & Care</Text>
        <Text style={styles.subtitle}>¡Uniendo mascotas y familias!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.fondo.app,
    paddingTop: 50, // Ajusta este valor si es necesario para el iOS notch
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    color: colors.botones.textoSecundario,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.texto.primario,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.texto.secundario,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default NavBar;