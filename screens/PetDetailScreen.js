// SearchScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../data/colors.json';

// Datos de ejemplo
const DUMMY_PETS = [
  {
    id: '1',
    name: 'Toby',
    type: 'Perro',
    breed: 'Border Collie',
    status: 'Perdido',
    photo: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRMK8GaChF2dz3dkMQTW9kpEqg7jtAPjZ51Z3CzDuu0lOyun24QtJBcMthXW5fgO8MIeWIpc-4zeElVPUkaxw-QPCTlfaFH0YcxlL1ZWa6Y',
  },
  {
    id: '2',
    name: 'Milo',
    type: 'Gato',
    breed: 'Siamés',
    status: 'Encontrado',
    photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9lGju3R8oPqx9Wr22qFgZNuTpmtu4O861p-2stgpd2iGAFl9wsBboT5YC8cJkY_5wbx3d6krnU_4LsiGD51Ok4q2jBFz4HGRGOdArpZAXlw',
  },
  {
    id: '3',
    name: 'Buddy',
    type: 'Perro',
    breed: 'Bulldog',
    status: 'Perdido',
    photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIr3PrvUHNTIOoqS1zvJpXci3DcShAFrKEgXRNQt_94E6nSAtfi69c1QHK_TfN7WHjkoJCQT-eX6kF42kPSdquyIx5vOsOH4U6YWBkTkDn',
  },
  // {
  //   id: '4',
  //   name: 'Fufi',
  //   type: 'Gato',
  //   breed: 'Blanco',
  //   status: 'Perdido',
  //   photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9lGju3R8oPqx9Wr22qFgZNuTpmtu4O861p-2stgpd2iGAFl9wsBboT5YC8cJkY_5wbx3d6krnU_4LsiGD51Ok4q2jBFz4HGRGOdArpZAXlw',
    
  // },
];

const SearchScreen = ({ navigation }) => {
  const [filterType, setFilterType] = useState('perdidas');
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [animalTypeFilter, setAnimalTypeFilter] = useState('');
  const [breedFilter, setBreedFilter] = useState('');

  const filteredPets = DUMMY_PETS.filter(pet => {
    // Lógica para filtrar por estado (Perdido/Encontrado)
    const matchesStatus = (filterType === 'perdidas' && pet.status === 'Perdido') || (filterType === 'encontradas' && pet.status === 'Encontrado');

    // Lógica para el mini formulario de filtro
    const matchesAnimalType = animalTypeFilter ? pet.type === animalTypeFilter : true;
    const matchesBreed = breedFilter ? pet.breed.toLowerCase().includes(breedFilter.toLowerCase()) : true;

    // Solo aplica el filtro avanzado si el formulario está visible
    if (showFilterForm) {
      return matchesAnimalType && matchesBreed;
    }

    return matchesStatus;
  });

  const renderItem = ({ item }) => {
    const isFound = item.status === 'Encontrado';
    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => { /* Navegar a la pantalla de detalles */ }}
      >
        <Image source={{ uri: item.photo }} style={styles.petImage} />
        <View style={styles.petInfoContainer}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.type} - {item.breed}</Text>
          <Text style={[styles.petStatus, isFound ? styles.foundStatus : styles.lostStatus]}>
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mascotas Cerca</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentedButton, filterType === 'perdidas' && styles.segmentedButtonActive]}
            onPress={() => {
              setFilterType('perdidas');
              setShowFilterForm(false);
            }}
          >
            <Text style={[styles.segmentedText, filterType === 'perdidas' && styles.segmentedTextActive]}>Perdidas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentedButton, filterType === 'encontradas' && styles.segmentedButtonActive]}
            onPress={() => {
              setFilterType('encontradas');
              setShowFilterForm(false);
            }}
          >
            <Text style={[styles.segmentedText, filterType === 'encontradas' && styles.segmentedTextActive]}>Encontradas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentedButton, showFilterForm && styles.segmentedButtonActive]}
            onPress={() => {
              setShowFilterForm(!showFilterForm); // Toggles the state
              setFilterType('filtro');
            }}
          >
            <Text style={[styles.segmentedText, showFilterForm && styles.segmentedTextActive]}>Filtros</Text>
          </TouchableOpacity>
        </View>
        
        {/* Mini-formulario de filtro condicional */}
        {showFilterForm && (
          <View style={styles.filterForm}>
            <Text style={styles.filterTitle}>Filtrar por tipo y raza</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, animalTypeFilter === 'Perro' && styles.filterButtonActive]}
                onPress={() => setAnimalTypeFilter(animalTypeFilter === 'Perro' ? '' : 'Perro')}
              >
                <Text style={[styles.filterText, animalTypeFilter === 'Perro' && styles.filterTextActive]}>Perro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, animalTypeFilter === 'Gato' && styles.filterButtonActive]}
                onPress={() => setAnimalTypeFilter(animalTypeFilter === 'Gato' ? '' : 'Gato')}
              >
                <Text style={[styles.filterText, animalTypeFilter === 'Gato' && styles.filterTextActive]}>Gato</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.filterInput}
              placeholder="Raza"
              value={breedFilter}
              onChangeText={setBreedFilter}
            />
          </View>
        )}

      </View>

      <FlatList
        data={filteredPets}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  header: {
    backgroundColor: colors.primarios.indigo,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  controls: {
    padding: 15,
    backgroundColor: colors.fondo.app,
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 10,
    marginBottom: 15,
    padding: 5,
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentedButtonActive: {
    backgroundColor: colors.primarios.indigo,
  },
  segmentedText: {
    fontWeight: 'bold',
    color: colors.primarios.indigo,
  },
  segmentedTextActive: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  petInfoContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.texto.primario,
  },
  petBreed: {
    fontSize: 14,
    color: colors.texto.secundario,
  },
  petStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  lostStatus: {
    color: colors.estado.perdido.base,
  },
  foundStatus: {
    color: colors.estado.encontrado.base,
  },
  filterForm: {
    backgroundColor: colors.fondo.componentes,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.texto.primario,
    textAlign: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  filterButtonActive: {
    backgroundColor: colors.primarios.indigo,
  },
  filterText: {
    color: '#666',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: 'white',
  },
  filterInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});

export default SearchScreen;