// ProfileScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../data/colors.json';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation, onLogout }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>

        {/* Botón: Mis Mascotas */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('MisMascotas')}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="dog" size={24} color={colors.primarios.indigo} />
            <Text style={styles.profileButtonText}>Mis Mascotas</Text>
          </View>
        </TouchableOpacity>

        {/* Botón: Cerrar Sesión */}
        <TouchableOpacity
          style={[styles.profileButton, styles.logoutButton]}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={colors.estado.perdido.base}
            />
            <Text style={[styles.profileButtonText, styles.logoutButtonText]}>
              Cerrar Sesión
            </Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.botones.textoPrimario,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.fondo.componentes,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 17,
    marginLeft: 12,
    color: colors.texto.primario,
    fontWeight: '400',
  },
  logoutButton: {
    marginTop: 20,
    borderColor: colors.estado.perdido.base,
  },
  logoutButtonText: {
    color: colors.estado.perdido.base,
    fontWeight: '600',
  },
});

export default ProfileScreen;
