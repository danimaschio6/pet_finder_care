import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import colors from '../../data/colors.json';

const ReminderModal = ({ visible, onClose, pets, setPets, selectedPetId }) => {
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');

  const handleAddReminder = () => {
    if (!newReminderTitle || !newReminderDate) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setPets(
      pets.map(pet => {
        if (pet.id === selectedPetId) {
          return {
            ...pet,
            reminders: [...pet.reminders, { id: pet.reminders.length + 1, title: newReminderTitle, date: newReminderDate }],
          };
        }
        return pet;
      })
    );
    setNewReminderTitle(''); setNewReminderDate('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nueva Cita</Text>
          <TextInput style={styles.input} placeholder="Título" value={newReminderTitle} onChangeText={setNewReminderTitle} />
          <TextInput style={styles.input} placeholder="Fecha" value={newReminderDate} onChangeText={setNewReminderDate} />
          <Button title="Agregar" onPress={handleAddReminder} />
          <Button title="Cancelar" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', padding:20 },
  modalContent: { backgroundColor: colors.fondo.componentes, borderRadius:16, padding:20 },
  modalTitle: { fontSize:20, fontWeight:'bold', marginBottom:12, color:colors.texto.primario },
  input: { borderWidth:1, borderColor: colors.bordes.primario, borderRadius:8, padding:12, marginBottom:12, fontSize:16 },
});

export default ReminderModal;