import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../data/colors.json';

const PetCard = ({ pet, onEdit, onAddReminder, onDelete }) => {
  return (
    <View style={styles.PetCard}>
      {pet.photo ? (
        <Image source={pet.photo} style={styles.petPhoto} />
      ) : (
        <View style={[styles.petPhoto, { backgroundColor:'#ddd', justifyContent:'center', alignItems:'center' }]}>
          <Text style={{ color:'#666' }}>Foto</Text>
        </View>
      )}
      <Text style={styles.petName}>{pet.name}</Text>
      <Text style={styles.petDetails}>{pet.type} - {pet.breed}, {pet.age}</Text>

      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>

      {/* 🔹 Botón eliminar */}
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recordatorios:</Text>
      {pet.reminders.length === 0 ? (
        <Text style={styles.noReminders}>No hay recordatorios</Text>
      ) : (
        pet.reminders.map(r => <Text key={r.id} style={styles.reminderText}>{r.title} - {r.date}</Text>)
      )}

      <TouchableOpacity style={styles.button} onPress={onAddReminder}>
        <Text style={styles.buttonText}>Añadir Cita</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Historial de Salud:</Text>
      {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
        pet.medicalHistory.map((item, idx) => (
          <View key={idx} style={{ marginBottom: 5 }}>
            <Text style={styles.reminderText}>{item.type}: {item.date}</Text>
            <Text style={styles.reminderText}>Detalle: {item.detail}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noReminders}>No hay historial</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  PetCard: { backgroundColor: colors.fondo.componentes, borderRadius:16, padding:16, marginBottom:20, shadowColor: colors.texto.primario||'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.1, shadowRadius:10, elevation:8 },
  petPhoto: { width:80, height:80, borderRadius:40, marginBottom:10, alignSelf:'center' },
  petName: { fontSize:18, fontWeight:'bold', color:colors.texto.primario, textAlign:'center' },
  petDetails: { fontSize:14, color:colors.texto.secundario, marginBottom:10, textAlign:'center' },
  sectionTitle: { fontSize:16, fontWeight:'600', marginTop:10, marginBottom:5 },
  noReminders: { fontSize:14, color:colors.texto.secundario, fontStyle:'italic' },
  reminderText: { fontSize:14, color:colors.texto.primario },
  button: { backgroundColor: colors.botones.primario, padding:8, borderRadius:10, alignSelf:'center', marginTop:10 },
  buttonText: { color: colors.botones.textoPrimario, fontWeight:'bold' },
  editButton: { backgroundColor: colors.botones.primario, padding:8, borderRadius:10, alignSelf:'center', marginBottom:10 },
  editButtonText: { color: colors.botones.textoPrimario, fontWeight:'bold' },
 deleteButton: {
    backgroundColor: colors.estado.perdido.base, // 🔹 rojo de tu paleta
    padding: 8,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  deleteButtonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
  },
});


export default PetCard;