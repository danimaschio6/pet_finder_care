// ProfileScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../data/colors.json';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation, onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      {/* Botón para navegar a Mis Mascotas */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('MisMascotas')}
      >
        <MaterialCommunityIcons name="dog" size={24} color={colors.primarios.indigo} />
        <Text style={styles.profileButtonText}>Mis Mascotas</Text>
      </TouchableOpacity>

      {/* Botón para cerrar sesión */}
      <TouchableOpacity
        style={[styles.profileButton, { marginTop: 20, backgroundColor: colors.botones.rojo }]}
        onPress={() => onLogout()} // Llama a la función onLogout
      >
        <MaterialCommunityIcons name="logout" size={24} color="white" />
        <Text style={[styles.profileButtonText, { color: 'white' }]}>Cerrar Sesión</Text>
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
    marginBottom: 40,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.botones.secundario,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    marginBottom: 10,
  },
  profileButtonText: {
    fontSize: 18,
    marginLeft: 10,
    color: colors.texto.primario,
  },
});

export default ProfileScreen;