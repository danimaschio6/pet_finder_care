import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../data/colors.json';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../supabase/client/supabaseClient';
import { uploadAvatar, deleteAvatar } from '../supabase/services/uploadAvatarService';

const ProfileScreen = ({ navigation, onLogout }) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);

  // ✅ Cargar perfil
  const loadProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      setProfile(data);
    } catch (err) {
      console.log("❌ Error cargando perfil:", err.message);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ✅ Opciones de avatar
  const handleAvatarOptions = () => {
    if (profile?.avatar_url) {
      Alert.alert(
        "Foto de perfil",
        "¿Qué querés hacer?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Cambiar", onPress: handleChangeAvatar },
          { text: "Eliminar", style: "destructive", onPress: handleDeleteAvatar },
        ]
      );
    } else {
      handleChangeAvatar();
    }
  };

  // ✅ Cambiar avatar
  const handleChangeAvatar = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user.id;

      const avatarUrl = await uploadAvatar(userId);
      if (!avatarUrl) return;

      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      loadProfile();
    } catch (err) {
      console.log("❌ Error cambiando avatar:", err.message);
      Alert.alert("Error", "No se pudo cambiar la imagen.");
    }
  };

  // ✅ Eliminar avatar
  const handleDeleteAvatar = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user.id;

      await deleteAvatar(userId);
      loadProfile();
    } catch (err) {
      console.log("❌ Error eliminando avatar:", err.message);
      Alert.alert("Error", "No se pudo eliminar la imagen.");
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <View style={styles.content}>

        {/* AVATAR */}
        <View style={styles.avatarWrapper}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }}  // ✅ FIX DEFINITIVO DE CACHÉ
              style={styles.avatar}
            />
          ) : (
            <MaterialCommunityIcons
              name="account-circle"
              size={110}
              color={colors.texto.secundario}
            />
          )}

          {/* LÁPIZ */}
          <TouchableOpacity style={styles.editAvatarBtn} onPress={handleAvatarOptions}>
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* DATOS */}
        {profile && (
          <View style={styles.userDataBox}>
            <Text style={styles.userText}>
              {profile.first_name} {profile.last_name}
            </Text>
            <Text style={styles.userSubText}>{profile.email}</Text>
            <Text style={styles.userSubText}>{profile.city}</Text>
          </View>
        )}

        {/* MIS MASCOTAS */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('MisMascotas')}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="dog" size={24} color={colors.primarios.indigo} />
            <Text style={styles.profileButtonText}>Mis Mascotas</Text>
          </View>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={[styles.profileButton, styles.logoutButton]}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="logout" size={24} color={colors.estado.perdido.base} />
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
  container: { flex: 1, backgroundColor: colors.fondo.app },

  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.botones.textoPrimario,
    textAlign: 'center'
  },

  content: { flex: 1, paddingTop: 24, paddingHorizontal: 20 },

  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative"
  },

  avatar: { width: 110, height: 110, borderRadius: 55 },

  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: colors.primarios.indigo,
    borderRadius: 20,
    padding: 6
  },

  userDataBox: { alignItems: "center", marginBottom: 24 },
  userText: { fontSize: 20, fontWeight: "700", color: colors.texto.primario },
  userSubText: { color: colors.texto.secundario },

  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.fondo.componentes,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
    marginBottom: 12
  },

  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  profileButtonText: { fontSize: 17, marginLeft: 12, color: colors.texto.primario },

  logoutButton: { marginTop: 20, borderColor: colors.estado.perdido.base },
  logoutButtonText: { color: colors.estado.perdido.base, fontWeight: '600' }
});

export default ProfileScreen;

