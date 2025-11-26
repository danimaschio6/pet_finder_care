// ProfileScreen.jsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../data/colors.json';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../supabase/client/supabaseClient';
import { uploadAvatar } from '../supabase/services/uploadAvatarService';

const ProfileScreen = ({ navigation, onLogout }) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);

  // ✅ Cargar perfil del usuario
  const loadProfile = async () => {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.user.id)
      .single();

    setProfile(data);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ✅ Cambiar avatar
  const handleChangeAvatar = async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data.user.id;

    const avatarUrl = await uploadAvatar(userId);

    if (avatarUrl) {
      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      loadProfile();
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>

        {/* AVATAR */}
        <TouchableOpacity style={styles.avatarBox} onPress={handleChangeAvatar}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons
              name="account-circle"
              size={100}
              color={colors.texto.secundario}
            />
          )}
          <Text style={styles.changePhotoText}>Cambiar foto</Text>
        </TouchableOpacity>

        {/* DATOS USUARIO */}
        {profile && (
          <View style={styles.userDataBox}>
            <Text style={styles.userText}>
              {profile.first_name} {profile.last_name}
            </Text>
            <Text style={styles.userSubText}>{profile.email}</Text>
            <Text style={styles.userSubText}>{profile.city}</Text>
          </View>
        )}

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

  avatarBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  changePhotoText: {
    marginTop: 8,
    color: colors.primarios.indigo,
    fontWeight: "600",
  },

  userDataBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  userText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.texto.primario,
  },
  userSubText: {
    color: colors.texto.secundario,
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
