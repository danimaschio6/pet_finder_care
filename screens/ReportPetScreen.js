import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../data/colors.json';

const ReportPetScreen = ({ onBackPress }) => {
  const [reportType, setReportType] = useState('perdida');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('perro');
  const [petBreed, setPetBreed] = useState('');
  const [description, setDescription] = useState('');
  const [lastLocation, setLastLocation] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  const handleImagePicker = () => {
    Alert.alert(
      "Subir Foto",
      "Esto simula la selección de una foto. En una app real, aquí aparecería la galería o la cámara.",
      [
        {
          text: "OK",
          onPress: () => {
            const placeholderImage = 'https://reactnative.dev/img/tiny_logo.png';
            setPhotoUri(placeholderImage);
            Alert.alert("Foto seleccionada", "Se ha cargado una imagen de ejemplo.");
          },
        },
      ]
    );
  };

  const handlePublish = () => {
    if (!petName || !petBreed || !description || !lastLocation) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
      return;
    }
    console.log('Publicar aviso:', {
      reportType,
      petName,
      petType,
      petBreed,
      description,
      lastLocation,
      photoUri,
    });
    alert('Aviso publicado (simulado)!');
    if (onBackPress) {
      onBackPress();
    }
  };

  return (
    <ScrollView style={styles.fullScreen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportar Mascota</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>¿Mascota Perdida o Encontrada?</Text>
        <View style={styles.segmentedControlContainer}>
          <TouchableOpacity
            style={[styles.segmentedButton, reportType === 'perdida' && styles.segmentedButtonActive]}
            onPress={() => setReportType('perdida')}
          >
            <Text style={[styles.segmentedButtonText, reportType === 'perdida' && styles.segmentedButtonTextActive]}>Perdida</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentedButton, reportType === 'encontrada' && styles.segmentedButtonActive]}
            onPress={() => setReportType('encontrada')}
          >
            <Text style={[styles.segmentedButtonText, reportType === 'encontrada' && styles.segmentedButtonTextActive]}>Encontrada</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nombre de la Mascota (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Max, Firulais"
          value={petName}
          onChangeText={setPetName}
        />

        <Text style={styles.label}>Tipo de Mascota</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={petType}
            onValueChange={(itemValue) => setPetType(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Perro" value="perro" />
            <Picker.Item label="Gato" value="gato" />
            <Picker.Item label="Otro" value="otro" />
          </Picker>
        </View>

        <Text style={styles.label}>Raza (si aplica)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Labrador, Siames"
          value={petBreed}
          onChangeText={setPetBreed}
        />

        <Text style={styles.label}>Descripción (colores, tamaño, particularidades)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: Perro negro, tamaño mediano, con collar rojo..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Última Ubicación Conocida</Text>
        <View style={styles.locationInputContainer}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            placeholder="Arrastra el pin en el mapa o busca..."
            value={lastLocation}
            onChangeText={setLastLocation}
          />
          <MaterialCommunityIcons name="map-marker" size={24} color={colors.primarios.indigo} style={styles.locationIcon} />
        </View>

        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Mapa de Ubicación</Text>
        </View>

        <Text style={styles.label}>Fotos de la Mascota</Text>
        <View style={styles.photoButtonsContainer}>
          <TouchableOpacity style={styles.photoIconButton} onPress={handleImagePicker}>
            <MaterialCommunityIcons name="camera" size={36} color={colors.primarios.indigo} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoIconButton} onPress={handleImagePicker}>
            <MaterialCommunityIcons name="image-multiple" size={36} color={colors.primarios.indigo} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>Publicar Aviso</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  container: {
    padding: 0,
    alignItems: 'center',
    paddingBottom: 100,
  },
  header: {
    width: '100%',
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
  card: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: colors.fondo.componentes,
    padding: 24,
    borderRadius: 16,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'normal',
    color: colors.texto.primario,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: colors.bordes.primario,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.fondo.componentes,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  pickerContainer: {
    marginBottom: 16,
    backgroundColor: colors.fondo.componentes,
  },
  picker: {
    width: '100%',
    height: 50,
    borderColor: colors.bordes.primario,
    borderWidth: 1,
    borderRadius: 8,
  },
  pickerItem: {
    color: colors.texto.primario,
    fontSize: 16,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
    paddingHorizontal: 0
  },
  segmentedButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.botones.secundario,
  },
  segmentedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.texto.primario,
    marginBottom: 10,
  },
  segmentedButtonActive: {
    backgroundColor: colors.primarios.indigo,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentedButtonText: {
    color: colors.primarios.indigo,
    fontWeight: 'bold',
  },
  segmentedButtonTextActive: {
    color: colors.botones.textoPrimario,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.bordes.primario,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.fondo.componentes,
  },
  locationInput: {
    flex: 1,
    height: 50,
    borderWidth: 0,
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  locationIcon: {
    marginRight: 16,
    color: colors.primarios.indigo,
  },
  mapPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: colors.fondo.app,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapText: {
    fontSize: 18,
    color: colors.primarios.indigo,
    fontWeight: 'bold',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  photoIconButton: {
    width: 80,
    height: 80,
    backgroundColor: colors.fondo.app,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButton: {
    width: '100%',
    backgroundColor: colors.primarios.indigo,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  publishButtonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ReportPetScreen;