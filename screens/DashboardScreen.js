import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, BackHandler } from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native'; // Importa este hook para navegar
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
  const navigation = useNavigation();

const handleComingSoon = () => {
  Alert.alert('Función en Desarrollo', 'Esta función se implementará pronto. ¡Gracias por tu paciencia!');
  };



  const petsNearYou = [
    { id: 1, name: 'Max', status: '(Perdido)', breed: 'Golden Retriever', gender: 'macho', time: 'Hace 2 horas', distance: '1.2 km', image: 'https://placehold.co/100x100/AEC6CF/white?text=Max' },
    { id: 2, name: 'Bella', status: '(Encontrada)', breed: 'Mestiza', gender: 'hembra', time: 'Ayer', distance: '3.5 km', image: 'https://placehold.co/100x100/FFD700/black?text=Bella' },
  ];

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

      {/* Contenido de la Pantalla */}
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
          <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#E8F1FF' }]} onPress={() => navigation.navigate('Reportar')}>
            <AntDesign name="pluscircle" size={24} color="#4A90E2" />
            <Text style={styles.quickAccessText}>Reportar Mascota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#E6FFF2' }]} onPress={() => navigation.navigate('misMascotas')}>
            <MaterialCommunityIcons name="dog-side" size={24} color="#50E3C2" />
            <Text style={styles.quickAccessText}>Mis Mascotas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#F6E6FF' }]} onPress={() => handleComingSoon()}>
            <MaterialCommunityIcons name="map-marker-radius" size={24} color="#BD10E0" />
            <Text style={styles.quickAccessText}>Refugios Cercanos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: '#FFFEE6' }]} onPress={() => navigation.navigate('Mensajes')}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#F8E71C" />
            <Text style={styles.quickAccessText}>Mensajes</Text>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: colors.varios,
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
    shadowColor: colors.varios,
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
    shadowColor: colors.varios,
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
    shadowColor: colors.varios,
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