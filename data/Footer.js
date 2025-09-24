import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../data/colors.json'; // Ajusta la ruta si es necesario

// Acepta las props de navegación de App.js
const Footer = ({ onHomePress, onReportPetPress, onViewPetList }) => {
  return (
    <View style={styles.container}>
      {/* Botón de Inicio */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onHomePress}
      >
        <Ionicons name="home" size={24} color={colors.varios.indigo} />
        <Text style={[styles.navText, { color: colors.varios.indigo }]}>Inicio</Text>
      </TouchableOpacity>

      {/* Botón de Listado de Mascotas */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onViewPetList}
      >
        <Ionicons name="search-outline" size={24} color={colors.texto.secundario} />
        <Text style={styles.navText}>Buscar</Text>
      </TouchableOpacity>

      {/* Botón de Reportar Mascota */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onReportPetPress}
      >
        <Ionicons name="add-circle-outline" size={24} color={colors.texto.secundario} />
        <Text style={styles.navText}>Reportar</Text>
      </TouchableOpacity>

      {/* Botón de Perfil */}
      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="person-outline" size={24} color={colors.texto.secundario} />
        <Text style={styles.navText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.fondo.componentes,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.bordes.primario,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: colors.texto.secundario,
    marginTop: 4,
  },
});

export default Footer;