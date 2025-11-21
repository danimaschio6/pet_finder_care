import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Necesita 'npx expo install expo-image-picker'
import 'react-native-get-random-values'; 
import { v4 as uuidv4 } from 'uuid'; // Necesita 'npm install uuid react-native-get-random-values'

import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient'; 

const ReportPetScreen = ({ onBackPress }) => {
  const [reportType, setReportType] = useState('perdida');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('perro');
  const [petBreed, setPetBreed] = useState('');
  const [description, setDescription] = useState('');
  const [lastLocation, setLastLocation] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoAsset, setPhotoAsset] = useState(null); // Guardar el asset completo para web
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedPetName, setPublishedPetName] = useState('');

  // Función para validar si todos los campos requeridos están completos
  const isFormValid = () => {
    return petName.trim() !== '' && 
           petBreed.trim() !== '' && 
           description.trim() !== '' && 
           lastLocation.trim() !== '' && 
           photoUri !== null;
  };

  // Función para limpiar todos los campos del formulario
  const clearForm = () => {
    setPetName('');
    setPetBreed('');
    setDescription('');
    setLastLocation('');
    setPhotoUri(null);
    setPhotoAsset(null);
    setIsUploading(false);
  };
    
  // -------------------------------------------------------------
  // LÓGICA DE SELECCIÓN Y SUBIDA DE IMAGEN
  // -------------------------------------------------------------
  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso Denegado", "Necesitamos permiso para acceder a la galería de imágenes.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!pickerResult.canceled) {
      const asset = pickerResult.assets[0];
      setPhotoUri(asset.uri);
      setPhotoAsset(asset); // Guardar el asset completo para usar el objeto File en web
    }
  };

  /**
   * Sube el archivo de imagen a Supabase Storage.
   * Maneja tanto web (usando File object) como móvil (usando fetch de URI).
   * Contiene logs de DEBUG para identificar dónde se queda colgada la app (generalmente en RLS).
   */
  const uploadImageToSupabase = async (uri, asset = null) => {
    setIsUploading(true);
    
    let fileToUpload;
    let fileExt;
    let contentType;
    
    try {
        // En web, usar el objeto File directamente para evitar problemas de CORB
        if (Platform.OS === 'web' && asset?.file) {
            console.log('DEBUG: Modo WEB - Usando objeto File directamente');
            fileToUpload = asset.file;
            fileExt = asset.fileName?.split('.').pop() || 'jpg';
            contentType = asset.mimeType || `image/${fileExt}`;
        } else {
            // En móvil, convertir URI a blob usando fetch
            console.log('DEBUG: Modo MÓVIL - Convirtiendo URI a blob');
            
            // Obtener extensión de la URI
            const uriParts = uri.split('.');
            fileExt = uriParts[uriParts.length - 1] || 'jpg';
            
            // Convertir URI local a blob
            console.log('DEBUG: Intentando FETCH de URI local...');
            const response = await fetch(uri);
            
            if (!response.ok) {
                throw new Error(`Error al obtener la imagen: ${response.statusText}`);
            }
            
            fileToUpload = await response.blob();
            contentType = `image/${fileExt}`;
            console.log('DEBUG: FETCH exitoso. Blob creado.');
        }

        // Generar nombre único para el archivo
        const fileName = `${uuidv4()}.${fileExt}`;
        console.log('DEBUG: Nombre de archivo generado:', fileName);

        // Subir el archivo al bucket 'pet-images'
        console.log('DEBUG: Intentando SUBIDA a Supabase...');
        const { data, error } = await supabase.storage
            .from('pet-images') // Debe coincidir con el nombre de tu Bucket
            .upload(fileName, fileToUpload, {
                cacheControl: '3600',
                upsert: false,
                contentType: contentType
            });
        
        console.log('DEBUG: Subida terminada. Analizando resultado...');

        if (error) {
            // Si hay un error aquí, es un fallo de Storage.
            throw new Error(`Fallo al subir imagen a Storage: ${error.message}.`);
        }

        // Obtener la URL pública del archivo
        const { data: publicUrlData } = supabase.storage
            .from('pet-images')
            .getPublicUrl(fileName);
        
        console.log('DEBUG: URL Pública obtenida:', publicUrlData.publicUrl);

        return publicUrlData.publicUrl;

    } catch (error) {
        // MUY IMPORTANTE: SI CAE AQUÍ, TE MOSTRARÁ EL ERROR EN CONSOLA
        setIsUploading(false); // Habilitamos el botón
        console.error('ERROR EN EL PROCESO DE SUBIDA:', error);
        throw new Error(`Fallo en el proceso de subida: ${error.message}.`);
    }
  };


  // -------------------------------------------------------------
  // LÓGICA DE PUBLICACIÓN FINAL
  // -------------------------------------------------------------
  const handlePublish = async () => {
    // 1. Validación de campos: Ahora la foto también es obligatoria
    if (!petName || !petBreed || !description || !lastLocation || !photoUri) {
      Alert.alert("Error", "¡Todos los campos, incluyendo la foto, son obligatorios!");
      return;
    }

    let imageUrl = null;
    
    try {
      // 2. Subir la imagen primero y obtener la URL (Aquí es donde se cuelga por RLS)
      Alert.alert("Subiendo Imagen", "Por favor, espera mientras se sube la foto...");
      imageUrl = await uploadImageToSupabase(photoUri, photoAsset);
      
      // 3. Construir el objeto de datos
      const datosAviso = {
        name: petName,
        species: petType,
        breed: petBreed,
        description: description,
        location: lastLocation,
        owner_id: null,
        image_url: imageUrl, // Columna de Supabase debe ser 'image_url' (text, nullable)
        status: reportType === 'perdida' ? 'perdida' : 'encontrada', // Guardar el estado del aviso
      };

      // 4. Insertar los datos en Supabase
      const { data, error } = await supabase
        .from('pets') 
        .insert([datosAviso])
        .select(); 

      if (error) {
        // Si hay un error aquí, es un fallo de la tabla 'pets' (generalmente RLS o NOT NULL)
        throw error;
      }
      
      // Éxito: Guardar nombre antes de limpiar para el mensaje
      const nombreMascota = petName;
      setIsUploading(false); // Desactivar estado de carga primero
      clearForm(); 
      
      // Mostrar modal de éxito
      setPublishedPetName(nombreMascota);
      setShowSuccessModal(true);

    } catch (error) {
      // Falla: Mostrar error detallado
      setIsUploading(false); // Aseguramos que el botón se habilite
      console.error('Error al publicar el aviso (Final):', error.message);
      
      Alert.alert(
        'Error de Publicación 🛑',
        `No se pudo guardar el aviso en la base de datos.\n\nError: ${error.message}\n\nPor favor, verifica tu conexión e intenta nuevamente.`,
        [{ text: 'Entendido' }],
        { cancelable: true }
      );
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
          </TouchableOpacity><TouchableOpacity // <-- CORREGIDO: Etiquetas unidas
            style={[styles.segmentedButton, reportType === 'encontrada' && styles.segmentedButtonActive]}
            onPress={() => setReportType('encontrada')}
          >
            <Text style={[styles.segmentedButtonText, reportType === 'encontrada' && styles.segmentedButtonTextActive]}>Encontrada</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nombre de la Mascota</Text>
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

        <Text style={styles.label}>Raza</Text>
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
          multiline={true}
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
          </TouchableOpacity><TouchableOpacity style={styles.photoIconButton} onPress={handleImagePicker}> 
            <MaterialCommunityIcons name="image-multiple" size={36} color={colors.primarios.indigo} />
          </TouchableOpacity>
          {photoUri && <Image source={{ uri: photoUri }} style={{ width: 80, height: 80, marginLeft: 10, borderRadius: 10 }} />}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.publishButton, 
            (!isFormValid() || isUploading) && styles.publishButtonDisabled
          ]} 
          onPress={handlePublish}
          disabled={!!(!isFormValid() || isUploading)}
        >
          <Text style={[
            styles.publishButtonText,
            (!isFormValid() || isUploading) && styles.publishButtonTextDisabled
          ]}>
            {isUploading ? 'Subiendo Foto...' : 'Publicar Aviso'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Éxito */}
      <Modal
        visible={!!showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={64} 
                color={colors.estado.encontrado.base} 
              />
            </View>
            <Text style={styles.modalTitle}>¡PUBLICACIÓN EXITOSA! 🎉</Text>
            <Text style={styles.modalMessage}>
              El aviso de <Text style={styles.modalPetName}>"{publishedPetName}"</Text> ha sido publicado correctamente en la base de datos.
            </Text>
            <View style={styles.modalChecklist}>
              <View style={styles.modalCheckItem}>
                <MaterialCommunityIcons name="check" size={20} color={colors.estado.encontrado.base} />
                <Text style={styles.modalCheckText}>La foto ha sido subida exitosamente</Text>
              </View>
              <View style={styles.modalCheckItem}>
                <MaterialCommunityIcons name="check" size={20} color={colors.estado.encontrado.base} />
                <Text style={styles.modalCheckText}>El aviso está disponible para otros usuarios</Text>
              </View>
              <View style={styles.modalCheckItem}>
                <MaterialCommunityIcons name="check" size={20} color={colors.estado.encontrado.base} />
                <Text style={styles.modalCheckText}>Los datos se guardaron correctamente</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                if (onBackPress) {
                  onBackPress();
                }
              }}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  publishButtonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
    fontSize: 18,
  },
  publishButtonDisabled: {
    backgroundColor: '#f3f4f6', // Gris claro para indicar desactivado
    borderWidth: 2,
    borderColor: colors.bordes.primario, // Borde gris para mantener estructura de botón
    borderStyle: 'solid',
    shadowColor: 'transparent', // Sin sombra cuando está desactivado
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  publishButtonTextDisabled: {
    color: colors.texto.secundario,
    fontWeight: '600', // Un poco menos bold pero aún visible
  },
  // Estilos del Modal de Éxito
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.fondo.componentes,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.texto.primario,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.texto.primario,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalPetName: {
    fontWeight: 'bold',
    color: colors.primarios.indigo,
  },
  modalChecklist: {
    width: '100%',
    marginBottom: 24,
  },
  modalCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  modalCheckText: {
    fontSize: 14,
    color: colors.texto.primario,
    marginLeft: 12,
    flex: 1,
  },
  modalButton: {
    backgroundColor: colors.primarios.indigo,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: colors.botones.textoPrimario,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReportPetScreen;