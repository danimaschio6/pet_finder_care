// ProfileScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../data/colors.json';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../supabase/client/supabaseClient';

const ProfileScreen = ({ navigation, onLogout }) => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Cargar información del perfil desde BD
  useEffect(() => {
    loadProfile();
  }, []);

  // Recargar cuando la pantalla vuelve a enfocarse
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Obtener usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setUserEmail(user.email || '');

      // Obtener perfil completo desde BD (todos los campos disponibles)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email, first_name, last_name, phone, city, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        // Si no hay perfil, usar datos básicos
        setProfile({
          first_name: '',
          last_name: '',
          phone: '',
          city: '',
          username: '',
          avatar_url: null,
          email: user.email || '',
        });
      } else {
        setProfile(profileData || {
          first_name: '',
          last_name: '',
          phone: '',
          city: '',
          username: '',
          avatar_url: null,
          email: user.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            if (onLogout) {
              onLogout();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile?.username) {
      return profile.username.charAt(0).toUpperCase();
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.username) {
      return profile.username;
    }
    return 'Usuario';
  };

  const getDisplayEmail = () => {
    return profile?.email || userEmail || '';
  };

  return (
    <View style={styles.container}>
      {/* HEADER - Estilo iOS mejorado */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      {/* CONTENT */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 68 + Math.max(insets.bottom, 8) + 40 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfile(true)}
            tintColor={colors.primarios.indigo}
            colors={[colors.primarios.indigo]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primarios.indigo} />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
          </View>
        ) : (
          <>
            {/* Avatar/Info Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.profileName}>{getFullName()}</Text>
              {profile?.username && (
                <Text style={styles.profileUsername}>@{profile.username}</Text>
              )}
              {getDisplayEmail() && (
                <Text style={styles.profileEmail}>{getDisplayEmail()}</Text>
              )}
            </View>

            {/* Información del Perfil */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>INFORMACIÓN</Text>
              
              {profile?.city && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color={colors.texto.secundario} />
                  <Text style={styles.infoText}>{profile.city}</Text>
                </View>
              )}
              
              {profile?.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color={colors.texto.secundario} />
                  <Text style={styles.infoText}>{profile.phone}</Text>
                </View>
              )}

              {profile?.created_at && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color={colors.texto.secundario} />
                  <Text style={styles.infoText}>
                    Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </Text>
                </View>
              )}

              {(!profile?.city && !profile?.phone && !profile?.created_at) && (
                <Text style={styles.noInfoText}>No hay información adicional</Text>
              )}
            </View>

            {/* Opciones */}
            <View style={styles.optionsSection}>
              <Text style={styles.sectionTitle}>OPCIONES</Text>
              
              {/* Botón: Mis Mascotas */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => navigation.navigate('MisMascotas')}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIconContainer, { backgroundColor: colors.primarios.indigo + '15' }]}>
                    <MaterialCommunityIcons name="dog" size={24} color={colors.primarios.indigo} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Mis Mascotas</Text>
                    <Text style={styles.optionSubtitle}>Gestiona tus mascotas registradas</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.texto.secundario} />
              </TouchableOpacity>

              {/* Separador */}
              <View style={styles.separator} />

              {/* Botón: Configuración (placeholder) */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIconContainer, { backgroundColor: colors.texto.secundario + '15' }]}>
                    <Ionicons name="settings-outline" size={24} color={colors.texto.secundario} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Configuración</Text>
                    <Text style={styles.optionSubtitle}>Ajustes de la aplicación</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.texto.secundario} />
              </TouchableOpacity>
            </View>

            {/* Botón: Cerrar Sesión */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.estado.perdido.base} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  header: {
    paddingBottom: 20,
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
    fontSize: 34,
    fontWeight: '700',
    color: colors.botones.textoPrimario,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.texto.secundario,
    fontWeight: '400',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarios.indigo,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.fondo.componentes,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.fondo.componentes,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.botones.textoPrimario,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.texto.primario,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: colors.primarios.indigo,
    fontWeight: '500',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: colors.texto.secundario,
    fontWeight: '400',
  },
  infoCard: {
    backgroundColor: colors.fondo.componentes,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.texto.secundario,
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    fontSize: 15,
    color: colors.texto.primario,
    marginLeft: 12,
    fontWeight: '400',
  },
  noInfoText: {
    fontSize: 15,
    color: colors.texto.secundario,
    fontStyle: 'italic',
    marginTop: 8,
  },
  optionsSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.fondo.componentes,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.texto.primario,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: colors.texto.secundario,
    fontWeight: '400',
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.bordes.primario,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fondo.componentes,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.estado.perdido.base,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.estado.perdido.base,
    marginLeft: 8,
  },
});

export default ProfileScreen;
