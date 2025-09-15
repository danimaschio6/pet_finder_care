import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, BackHandler } from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../data/colors.json';

const { width } = Dimensions.get('window');

// Componente para la Tarjeta de Mascota
const PetCard = ({ pet }) => (
  <View style={styles.petCard}>
    {/* Placeholder de Foto */}
    <View style={styles.petImagePlaceholder}>
      <Text>Foto</Text>
    </View>

    {/* Información de la Mascota */}
    <View style={styles.petInfo}>
      <Text style={styles.petName}>
        {pet.name} -
        <Text style={{
          color: pet.status === '(Perdido)' ? colors.estado.perdido.base : colors.estado.encontrado.base,
          fontWeight: 'bold',
        }}> {pet.status}</Text>
      </Text>
      <Text style={styles.petDetails}>{pet.breed}, {pet.gender}</Text>
      <View style={styles.petLocation}>
        <Ionicons name="location-sharp" size={14} color={colors.texto.primario} />
        <Text style={[styles.petLocationText, { color: colors.texto.primario }]}>{pet.time} - {pet.distance}</Text>
      </View>
    </View>
  </View>
);

const DashboardScreen = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');

  // Función para manejar el clic en los botones de acceso rápido
  const handleQuickAccessPress = () => {
    Alert.alert(
      "¡Ups! 😅",
      "Esta función aún no está disponible."
    );
  };

  // Hook para manejar el botón de retroceso del dispositivo
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Si el usuario está en la pestaña de inicio, muestra la alerta
        if (activeTab === 'home') {
          Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro que quieres cerrar sesión?",
            [
              {
                text: "No",
                onPress: () => null,
                style: "cancel"
              },
              { text: "Sí", onPress: () => onLogout() }
            ],
            { cancelable: false }
          );
          return true; // Retorna 'true' para indicar que hemos manejado el evento
        }
        return false; // Retorna 'false' para que el comportamiento por defecto (retroceder) ocurra
      };

      const BackHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.remove();
    }, [activeTab, onLogout])
  );

  const petsNearYou = [
    { id: 1, name: 'Max', status: '(Perdido)', breed: 'Golden Retriever', gender: 'macho', time: 'Hace 2 horas', distance: '1.2 km', image: 'https://placehold.co/100x100/AEC6CF/white?text=Max' },
    { id: 2, name: 'Bella', status: '(Encontrada)', breed: 'Mestiza', gender: 'hembra', time: 'Ayer', distance: '3.5 km', image: 'https://placehold.co/100x100/FFD700/black?text=Bella' },
  ];

  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.welcomeText}>¡Bienvenido, [Nombre de Usuario]!</Text>
      <Text style={styles.sectionTitle}>Mascotas Cerca de Ti</Text>
      <View style={styles.petCardsContainer}>
        {petsNearYou.map(pet => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </View>
      <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
      <View style={styles.quickAccessGrid}>
        <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#E8F1FF' }]} onPress={handleQuickAccessPress}>
          <AntDesign name="pluscircle" size={24} color="#4A90E2" />
          <Text style={styles.quickAccessText}>Reportar Mascota</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#E6FFF2' }]} onPress={handleQuickAccessPress}>
          <MaterialCommunityIcons name="dog-side" size={24} color="#50E3C2" />
          <Text style={styles.quickAccessText}>Mis Mascotas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#F6E6FF' }]} onPress={handleQuickAccessPress}>
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="#BD10E0" />
          <Text style={styles.quickAccessText}>Refugios Cercanos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#FFFEE6' }]} onPress={handleQuickAccessPress}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#F8E71C" />
          <Text style={styles.quickAccessText}>Mensajes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'search':
        return <View style={styles.contentContainer}><Text style={styles.heading}>Buscar Mascota</Text></View>;
      case 'report':
        return <View style={styles.contentContainer}><Text style={styles.heading}>Reportar</Text></View>;
      case 'profile':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.heading}>Mi Perfil</Text>
            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return renderHome();
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra Superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inicio</Text>
      </View>

      {/* Tarjeta de Notificación Flotante */}
      <View style={styles.notificationCard}>
        <AntDesign name="star" size={18} color={'#4A90E2'} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.notificationTitle}>Nueva mascota encontrada cerca de tu ubicación!</Text>
          <Text style={styles.notificationSubtitle}>Hace 15 min - Av. Libertador 123</Text>
        </View>
      </View>

      {/* Contenido Dinámico de la Pantalla */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.navButton}>
          <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={24} color={activeTab === 'home' ? colors.primarios.indigo : colors.secundarios.gris} />
          <Text style={[styles.navText, activeTab === 'home' && { color: colors.primarios.indigo }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('search')} style={styles.navButton}>
          <AntDesign name="search1" size={24} color={activeTab === 'search' ? colors.primarios.indigo : colors.secundarios.gris} />
          <Text style={[styles.navText, activeTab === 'search' && { color: colors.primarios.indigo }]}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('report')} style={styles.navButton}>
          <Ionicons name={'receipt-outline'} size={24} color={activeTab === 'report' ? colors.primarios.indigo : colors.secundarios.gris} />
          <Text style={[styles.navText, activeTab === 'report' && { color: colors.primarios.indigo }]}>Reportar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('profile')} style={styles.navButton}>
          <FontAwesome5 name="user-alt" size={24} color={activeTab === 'profile' ? colors.primarios.indigo : colors.secundarios.gris} />
          <Text style={[styles.navText, activeTab === 'profile' && { color: colors.primarios.indigo }]}>Perfil</Text>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.botones.textoPrimario,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9EEFF',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 25,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.texto.primario,
  },
  notificationSubtitle: {
    fontSize: 13,
    color: colors.texto.secundario,
    marginTop: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.texto.primario,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  petCardsContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.texto.primario,
  },
  petDetails: {
    fontSize: 14,
    color: colors.texto.secundario,
    marginTop: 2,
  },
  petLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  petLocationText: {
    fontSize: 13,
    marginLeft: 5,
    color: colors.texto.primario,
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
    height: 120,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAccessText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
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
    shadowColor: colors.varios.sombra,
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