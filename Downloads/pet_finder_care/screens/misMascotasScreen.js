import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../data/colors.json';

import PetCard from './components/PetCard';
import PetFormModal from './components/PetFormModal';
import ReminderModal from './components/ReminderModal';

const MisMascotasScreen = () => {
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


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Mis Mascotas</Text>
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
            onDelete={() => handleDeletePet(pet.id)}  // 🔹 nuevo
        />
      ))}

      <TouchableOpacity style={[styles.button, { marginBottom: 10 }]} onPress={() => setModalPetVisible(true)}>
        <Text style={styles.buttonText}>Añadir Mascota</Text>
      </TouchableOpacity>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow:1, padding:20, paddingTop: 60, backgroundColor: colors.fondo.app },
  headerTitle: { fontSize:24, fontWeight:'bold', color:colors.texto.primario, marginBottom:5 },
  subTitle: { fontSize:16, color:colors.texto.secundario, marginBottom:20 },
  button: { backgroundColor: colors.botones.primario, padding:12, borderRadius:12, marginTop:10, alignItems:'center' },
  buttonText: { color: colors.botones.textoPrimario, fontWeight:'bold' },
});

export default MisMascotasScreen;