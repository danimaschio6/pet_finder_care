import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import colors from '../data/colors.json';

const DUMMY_PETS = [
  {
    id: '1',
    name: 'Toby',
    type: 'Perro',
    breed: 'Labrador',
    status: 'Perdido',
    photo: 'https://images.pexels.com/photos/16601458/pexels-photo-16601458/free-photo-of-dog-puppy-pet-cute.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '2',
    name: 'Milo',
    type: 'Gato',
    breed: 'Siamés',
    status: 'Encontrado',
    photo: 'https://images.pexels.com/photos/1741549/pexels-photo-1741549.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '3',
    name: 'Buddy',
    type: 'Perro',
    breed: 'Bulldog',
    status: 'Perdido',
    photo: 'https://images.pexels.com/photos/33287/bulldog-english-dog-spooky-animal-world.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

const PetListScreen = ({ onViewPetDetail }) => {
  const renderItem = ({ item }) => {
    const isFound = item.status === 'Encontrado';
    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => onViewPetDetail(item)}
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
      <Text style={styles.title}>Mascotas Reportadas</Text>
      <FlatList
        data={DUMMY_PETS}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.texto.primario,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
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
});

export default PetListScreen;