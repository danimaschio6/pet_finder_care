import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native'; // Importa este hook para navegar
import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient';

const { width } = Dimensions.get('window');

// Función para calcular tiempo relativo
const getTimeAgo = (dateString) => {
  if (!dateString) return 'Recientemente';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Hace unos momentos';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
};

// Componente para la Tarjeta de Mascota
const PetCard = ({ pet }) => {
  const imageUrl = pet.image_url && (pet.image_url.startsWith('http://') || pet.image_url.startsWith('https://')) 
    ? pet.image_url 
    : null;

  return (
    <View style={styles.petCard}>
      {/* Foto de la Mascota o Placeholder */}
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.petImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.petImagePlaceholder}>
          <Text style={styles.petImagePlaceholderText}>🐾</Text>
        </View>
      )}
      {/* Información de la Mascota */}
      <View style={styles.petInfo}>
        <Text style={styles.petName}>
          {pet.name}
          <Text style={{
            color: pet.status === 'perdida' || pet.status === '(Perdido)' ? colors.estado.perdido.base : colors.estado.encontrado.base,
            fontWeight: '600',
          }}> {pet.status === 'perdida' ? '(Perdido)' : pet.status === 'encontrada' ? '(Encontrado)' : pet.status}</Text>
        </Text>
        <Text style={styles.petDetails}>{pet.breed || 'Sin raza'}</Text>
        <View style={styles.petLocation}>
          <Ionicons name="location" size={14} color={colors.texto.secundario} />
          <Text style={styles.petLocationText}>{pet.time} - {pet.location || 'Ubicación no disponible'}</Text>
        </View>
      </View>
    </View>
  );
};

const DashboardScreen = ({ onLogout }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 68 + Math.max(insets.bottom, 8);
  const [petsNearYou, setPetsNearYou] = useState([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  const handleComingSoon = () => {
    Alert.alert('Función en Desarrollo', 'Esta función se implementará pronto. ¡Gracias por tu paciencia!');
  };

  // Cargar las últimas 2 mascotas desde la base de datos
  const loadRecentPets = async () => {
    try {
      setIsLoadingPets(true);
      
      const { data: petsData, error } = await supabase
        .from('pets')
        .select('id, name, species, breed, description, location, image_url, status, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) {
        console.error('Error al cargar mascotas:', error);
        setPetsNearYou([]);
        return;
      }

      // Mapear los datos de Supabase al formato que espera el componente
      const mappedPets = (petsData || []).map((pet) => ({
        id: pet.id,
        name: pet.name || 'Sin nombre',
        breed: pet.breed || 'Sin raza',
        species: pet.species || 'perro',
        status: pet.status === 'perdida' ? 'perdida' : pet.status === 'encontrada' ? 'encontrada' : 'desconocido',
        location: pet.location || 'Ubicación no disponible',
        image_url: pet.image_url || null,
        time: getTimeAgo(pet.created_at),
      }));

      setPetsNearYou(mappedPets);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setPetsNearYou([]);
    } finally {
      setIsLoadingPets(false);
    }
  };

  // Cargar mascotas al montar el componente y cuando se enfoca la pantalla
  useEffect(() => {
    loadRecentPets();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentPets();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Barra Superior */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Inicio</Text>
      </View>

      {/* Tarjeta de Notificación Flotante
      <View style={styles.notificationCard}>
        <AntDesign name="star" size={20} color={colors.primarios.indigo} />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>Nueva mascota encontrada cerca de tu ubicación!</Text>
          <Text style={styles.notificationSubtitle}>Hace 15 min - Av. Libertador 123</Text>
        </View>
      </View> */}

      {/* Contenido de la Pantalla */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
        <Text style={styles.sectionTitle}>Mascotas Cerca de Ti</Text>
        <View style={styles.petCardsContainer}>
          {isLoadingPets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primarios.indigo} />
              <Text style={styles.loadingText}>Cargando mascotas...</Text>
            </View>
          ) : petsNearYou.length > 0 ? (
            petsNearYou.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay mascotas recientes</Text>
            </View>
          )}
        </View>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={[styles.quickAccessButton, { backgroundColor: '#E3F2FD' }]} 
            onPress={() => navigation.navigate('Reportar')}
            activeOpacity={0.7}
          >
            <AntDesign name="pluscircle" size={28} color={colors.primarios.indigo} />
            <Text style={styles.quickAccessText}>Reportar Mascota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#E6FFF2' }]} onPress={() => navigation.getParent()?.navigate('MisMascotas')}>
            <MaterialCommunityIcons name="dog-side" size={24} color="#50E3C2" />
            <Text style={styles.quickAccessText}>Mis Mascotas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickAccessButton, { backgroundColor: '#F3E5F5' }]} 
            onPress={() => navigation.navigate("Refugios")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="map-marker-radius" size={28} color="#9C27B0" />
            <Text style={styles.quickAccessText}>Refugios Cercanos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#FFFEE6' }]} onPress={() => navigation.navigate('BandejaEntrada')}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#F8E71C" />
            <Text style={styles.quickAccessText}>Mensajes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#6ac1ffff' }]} onPress={() => navigation.navigate('Noticias')}>
            <MaterialCommunityIcons name="newspaper" size={24} color="#0400e4ff"/>
            <Text style={styles.quickAccessText}>Noticias</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.botones.textoPrimario,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 24,
    color: colors.texto.primario,
    paddingHorizontal: 20,
    marginTop: 24,
    letterSpacing: -0.5,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.texto.primario,
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 13,
    color: colors.texto.secundario,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.texto.primario,
    paddingHorizontal: 20,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  petCardsContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
    alignItems: 'center',
  },
  petImagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: colors.fondo.app,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  petImagePlaceholderText: {
    fontSize: 32,
  },
  petImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.texto.secundario,
    fontWeight: '400',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.texto.secundario,
    fontWeight: '400',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.texto.primario,
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 15,
    color: colors.texto.secundario,
    marginBottom: 4,
  },
  petLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  petLocationText: {
    fontSize: 13,
    marginLeft: 6,
    color: colors.texto.secundario,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickAccessButton: {
    width: '48%',
    height: 130,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
  },
  quickAccessText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.texto.primario,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: colors.fondo.componentes,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 70,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: colors.varios,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    paddingBottom: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 3,
    color: colors.secundarios.gris,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: colors.estado.perdido.base,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;