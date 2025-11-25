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
  PetCard: { 
    backgroundColor: colors.fondo.componentes, 
    borderRadius: 14, 
    padding: 20, 
    marginBottom: 20, 
    marginHorizontal: 20,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  petPhoto: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 16, 
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  petName: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: colors.texto.primario, 
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  petDetails: { 
    fontSize: 17, 
    color: colors.texto.secundario, 
    marginBottom: 16, 
    textAlign: 'center',
    fontWeight: '400',
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '600', 
    marginTop: 16, 
    marginBottom: 8,
    color: colors.texto.primario,
  },
  noReminders: { 
    fontSize: 15, 
    color: colors.texto.secundario, 
    fontStyle: 'italic',
    fontWeight: '400',
  },
  reminderText: { 
    fontSize: 15, 
    color: colors.texto.primario,
    fontWeight: '400',
    marginBottom: 4,
  },
  button: { 
    backgroundColor: colors.botones.primario, 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10, 
    alignSelf: 'center', 
    marginTop: 12,
    minWidth: 120,
  },
  buttonText: { 
    color: colors.botones.textoPrimario, 
    fontWeight: '600',
    fontSize: 17,
  },
  editButton: { 
    backgroundColor: colors.botones.primario, 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10, 
    alignSelf: 'center', 
    marginBottom: 12,
    minWidth: 120,
  },
  editButtonText: { 
    color: colors.botones.textoPrimario, 
    fontWeight: '600',
    fontSize: 17,
  },
  deleteButton: {
    backgroundColor: colors.estado.perdido.base,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 12,
    minWidth: 120,
  },
  deleteButtonText: {
    color: colors.botones.textoPrimario,
    fontWeight: '600',
    fontSize: 17,
  },
});


export default PetCard;