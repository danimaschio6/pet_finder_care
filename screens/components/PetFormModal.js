import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import colors from '../../data/colors.json';

const PetFormModal = ({ visible, onClose, pets, setPets, editingPet, setEditingPet }) => {
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetType, setNewPetType] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetPhoto, setNewPetPhoto] = useState('');
  const [newPetHistory, setNewPetHistory] = useState([]);
  const [newHistoryType, setNewHistoryType] = useState('');
  const [newHistoryDate, setNewHistoryDate] = useState('');
  const [newHistoryDetail, setNewHistoryDetail] = useState('');

  useEffect(() => {
    if (editingPet) {
      setNewPetName(editingPet.name);
      setNewPetBreed(editingPet.breed);
      setNewPetType(editingPet.type);
      setNewPetAge(editingPet.age);
      setNewPetPhoto(editingPet.photo?.uri || '');
      setNewPetHistory(editingPet.medicalHistory);
    }
  }, [editingPet]);

  const handleAddHistoryEntry = () => {
    if (!newHistoryType || !newHistoryDate || !newHistoryDetail) {
      Alert.alert('Error', 'Completa todos los campos del historial');
      return;
    }
    setNewPetHistory([...newPetHistory, { type: newHistoryType, date: newHistoryDate, detail: newHistoryDetail }]);
    setNewHistoryType(''); setNewHistoryDate(''); setNewHistoryDetail('');
  };

  const handleAddOrEditPet = () => {
    if (!newPetName || !newPetBreed || !newPetAge || !newPetType) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    const petData = {
      id: editingPet ? editingPet.id : pets.length + 1,
      name: newPetName,
      breed: newPetBreed,
      type: newPetType,
      age: newPetAge,
      photo: newPetPhoto ? { uri: newPetPhoto } : null,
      reminders: editingPet ? editingPet.reminders : [],
      medicalHistory: newPetHistory,
    };
    if (editingPet) {
      setPets(pets.map(p => p.id === editingPet.id ? petData : p));
      setEditingPet(null);
    } else setPets([...pets, petData]);

    setNewPetName(''); setNewPetBreed(''); setNewPetType(''); setNewPetAge('');
    setNewPetPhoto(''); setNewPetHistory([]); setNewHistoryType(''); setNewHistoryDate(''); setNewHistoryDetail('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingPet ? "Editar Mascota" : "Nueva Mascota"}</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={newPetName} onChangeText={setNewPetName} />
          <TextInput style={styles.input} placeholder="Raza" value={newPetBreed} onChangeText={setNewPetBreed} />
          <TextInput style={styles.input} placeholder="Tipo (Perro, Gato...)" value={newPetType} onChangeText={setNewPetType} />
          <TextInput style={styles.input} placeholder="Edad" value={newPetAge} onChangeText={setNewPetAge} />
          <TextInput style={styles.input} placeholder="URL Foto (opcional)" value={newPetPhoto} onChangeText={setNewPetPhoto} />

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Agregar entrada al Historial</Text>
          <TextInput style={styles.input} placeholder="Tipo" value={newHistoryType} onChangeText={setNewHistoryType} />
          <TextInput style={styles.input} placeholder="Fecha" value={newHistoryDate} onChangeText={setNewHistoryDate} />
          <TextInput style={styles.input} placeholder="Detalle" value={newHistoryDetail} onChangeText={setNewHistoryDetail} />
          <Button title="Agregar al Historial" onPress={handleAddHistoryEntry} />

          {newPetHistory.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>Entradas agregadas:</Text>
              {newPetHistory.map((item, index) => (
                <View key={index} style={{ marginBottom: 5, padding:5, backgroundColor:'#f0f0f0', borderRadius:8 }}>
                  <Text style={styles.reminderText}>{item.type}: {item.date}</Text>
                  <Text style={styles.reminderText}>Detalle: {item.detail}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ marginTop: 10 }}>
            <Button title={editingPet ? "Guardar Cambios" : "Agregar Mascota"} onPress={handleAddOrEditPet} />
            <Button title="Cancelar" onPress={onClose} color="red" />
          </View>
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
  sectionTitle: { fontSize:16, fontWeight:'600', marginTop:10, marginBottom:5 },
  reminderText: { fontSize:14, color:colors.texto.primario },
});

export default PetFormModal;