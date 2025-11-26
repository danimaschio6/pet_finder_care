import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../data/colors.json';

import PetCard from './components/PetCard';
import PetFormModal from './components/PetFormModal';
import ReminderModal from './components/ReminderModal';

const MisMascotasScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [pets, setPets] = useState([
    {
      id: 1,
      name: 'Max',
      breed: 'Golden Retriever',
      type: 'Perro',
      age: '3 años',
      photo: { uri: 'https://e7.pngegg.com/pngimages/1016/887/png-clipart-puppy-pet-golden-retriever-dog-training-collar-puppy-animals-carnivoran-thumbnail.png' },
      reminders: [{ id: 1, title: 'Vacuna Antirrábica', date: '01/10/25' }],
      medicalHistory: [
        { type: 'Vacunación', date: '01/03/25', detail: 'Vacuna séxtuple aplicada por Dr.Perez' },
        { type: 'Desparasitación', date: '10/09/2025', detail: 'Pastilla de amplio espectro' },
      ],
    },
  ]);

  const [modalPetVisible, setModalPetVisible] = useState(false);
  const [modalReminderVisible, setModalReminderVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [editingPet, setEditingPet] = useState(null);

  const handleDeletePet = (petId) => {
    setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
  };

  const navigateToScreen = (screenName) => {
    // Navegar al Dashboard (que contiene el TabNavigator)
    // El TabNavigator manejará la navegación a la pantalla específica
    navigation.navigate('Dashboard', { 
      screen: screenName === 'Dashboard' ? 'Inicio' : screenName 
    });
  };


  return (
    <View style={styles.container}>
      {/* Barra Superior */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Mis Mascotas</Text>
      </View>

      {/* Contenido de la Pantalla */}
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { 
          paddingBottom: 68 + Math.max(insets.bottom, 8) + 20 
        }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subTitle}>Gestioná a tus compañeros</Text>

        {pets.map(pet => (
          <PetCard
            key={pet.id}
            pet={pet}
            onEdit={() => {
              setEditingPet(pet);
              setModalPetVisible(true);
            }}
            onAddReminder={() => {
              setSelectedPetId(pet.id);
              setModalReminderVisible(true);
            }}
            onDelete={() => handleDeletePet(pet.id)}
          />
        ))}

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setModalPetVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Añadir Mascota</Text>
        </TouchableOpacity>
      </ScrollView>

      <PetFormModal
        visible={modalPetVisible}
        onClose={() => { setModalPetVisible(false); setEditingPet(null); }}
        pets={pets}
        setPets={setPets}
        editingPet={editingPet}
        setEditingPet={setEditingPet}
      />

      <ReminderModal
        visible={modalReminderVisible}
        onClose={() => setModalReminderVisible(false)}
        pets={pets}
        setPets={setPets}
        selectedPetId={selectedPetId}
      />

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { 
        paddingBottom: Math.max(insets.bottom, 8),
        height: 68 + Math.max(insets.bottom, 8),
      }]}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigateToScreen('Dashboard')}
          activeOpacity={0.6}
        >
          <Ionicons name="home-outline" size={28} color={colors.texto.secundario} />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigateToScreen('Buscar')}
          activeOpacity={0.6}
        >
          <Ionicons name="search-outline" size={28} color={colors.texto.secundario} />
          <Text style={styles.navText}>Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigateToScreen('Reportar')}
          activeOpacity={0.6}
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.texto.secundario} />
          <Text style={styles.navText}>Reportar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigateToScreen('Perfil')}
          activeOpacity={0.6}
        >
          <Ionicons name="person-outline" size={28} color={colors.texto.secundario} />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.fondo.app 
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
  scrollContent: {
    paddingBottom: 0,
  },
  subTitle: { 
    fontSize: 17, 
    color: colors.texto.secundario, 
    marginBottom: 24,
    paddingHorizontal: 20,
    marginTop: 24,
    fontWeight: '400',
  },
  button: { 
    backgroundColor: colors.botones.primario, 
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10, 
    marginTop: 12, 
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: { 
    color: colors.botones.textoPrimario, 
    fontWeight: '600',
    fontSize: 17,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.fondo.componentes,
    borderTopWidth: 0.5,
    borderTopColor: colors.bordes.primario,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 60,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    color: colors.texto.secundario,
  },
});

export default MisMascotasScreen;