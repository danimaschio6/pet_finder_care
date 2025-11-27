import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Necesita 'npx expo install expo-image-picker'
import 'react-native-get-random-values'; 
import { v4 as uuidv4 } from 'uuid'; // Necesita 'npm install uuid react-native-get-random-values'
import * as FileSystem from "expo-file-system/legacy";
import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient'; 

//mapa ubicacion
import LocationSelectMap from "./components/LocationSelectMap";
import PetMap from "./components/PetMap";

//para subida alternativa imagen 
//import * as FileSystem from "expo-file-system/legacy";

const ReportPetScreen = ({ onBackPress }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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

  //mapa ubicacion
  const [selectedLatitude, setSelectedLatitude] = useState(null);
  const [selectedLongitude, setSelectedLongitude] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // Función para validar si todos los campos requeridos están completos
  const isFormValid = () => {
    return petName.trim() !== '' && 
    petBreed.trim() !== '' && 
    description.trim() !== '' && 
    lastLocation.trim() !== '' && 

    //mapa ubicacion
    selectedLatitude !== null && 
    selectedLongitude !== null && 

    photoUri !== null;
  };

  // Función para limpiar todos los campos del formulario
  const clearForm = () => {
    setPetName('');
    setPetBreed('');
    setDescription('');
    setLastLocation('');

    //mapa ubicacion
    setSelectedLatitude(null);
    setSelectedLongitude(null);

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
    function base64ToBytes(base64) {
    const binary = global.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  const uploadImageToSupabase = async (uri, asset = null) => {
    try {
      let fileToUpload;
      let fileName;
      let contentType;
      let fileExt;

      console.log("DEBUG: Iniciando subida…");

      // ------------------------------------
      // 1) MODO WEB → usar File directamente
      // ------------------------------------
      if (Platform.OS === "web" && asset?.file) {
        console.log("DEBUG: Web - usando File directamente");

        fileToUpload = asset.file;
        fileExt = asset.fileName?.split(".").pop() || "jpg";
        contentType = asset.mimeType || `image/${fileExt}`;
        fileName = `${uuidv4()}.${fileExt}`;
      }

      // ---------------------------------------------------------
      // 2) MODO MÓVIL → leer como base64 (fetch NO sirve en Expo)
      // ---------------------------------------------------------
      else {
        console.log("DEBUG: Móvil - leyendo archivo como base64…");

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });

        console.log("DEBUG: Base64 leído. Convirtiendo a bytes…");

        const fileBytes = base64ToBytes(base64);

        // Obtener extensión desde la URI
        fileExt = uri.split(".").pop() || "jpg";
        contentType = `image/${fileExt}`;
        fileName = `${uuidv4()}.${fileExt}`;
        fileToUpload = fileBytes;
      }

      console.log("DEBUG: Subiendo archivo a Supabase…");

      const { data, error } = await supabase.storage
        .from("pet-images")
        .upload(fileName, fileToUpload, {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error("ERROR SUPABASE:", error);
        throw new Error(error.message);
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("pet-images")
        .getPublicUrl(fileName);

      console.log("DEBUG: URL pública:", publicUrlData.publicUrl);

      return publicUrlData.publicUrl;

    } catch (error) {
      console.error("ERROR EN SUBIDA:", error);
      throw new Error(`Error subiendo imagen: ${error.message}`);
    }
  };
    
    

     

  /**
   * Sube el archivo de imagen a Supabase Storage.
   * Version alternativa dionisio, funcionando en expo go
   */
  /* 
  function base64ToBytes(base64) {
    const binary = global.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  async function uploadImageToSupabase(uri) {
    try {
      console.log("DEBUG: Leyendo archivo como base64 (modo literal)...");

      //Aca está la diferencia clave
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64", //esto funciona siempre
      });

      console.log("DEBUG: Convirtiendo base64 a bytes...");

      const fileBytes = base64ToBytes(base64);

      const fileName = `${uuidv4()}.jpg`;

      console.log("DEBUG: Subiendo imagen...");

      const { data, error } = await supabase.storage
        .from("pet-images")
        .upload(fileName, fileBytes, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.log("ERROR SUPABASE:", error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from("pet-images")
        .getPublicUrl(fileName);

      console.log("DEBUG: URL pública:", publicUrlData.publicUrl);

      return publicUrlData.publicUrl;

    } catch (err) {
      console.log("ERROR SUBIDA:", err);
      throw new Error(`Fallo al subir la imagen: ${err.message}`);
    }
  }
  */

  // -------------------------------------------------------------
  // LÓGICA DE PUBLICACIÓN FINAL
  // -------------------------------------------------------------
  const handlePublish = async () => {
    // 1. Validación de campos: Ahora la foto también es obligatoria
    if (!petName || !petBreed || !description || !lastLocation || !photoUri || !selectedLatitude || !selectedLongitude) {
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
        //agregados para mapa ubicacion
        latitude: selectedLatitude,
        longitude: selectedLongitude,
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
    <View style={styles.fullScreen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.botones.textoPrimario} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar Mascota</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { 
          paddingBottom: 68 + Math.max(insets.bottom, 8) + 20 
        }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
        <View style={styles.typeSection}>
          <Text style={styles.sectionLabel}>Tipo de Reporte</Text>
          <Text style={styles.sectionSubLabel}>¿La mascota está perdida o fue encontrada?</Text>
          <View style={styles.segmentedControlContainer}>
            <TouchableOpacity
              style={[styles.segmentedButton, reportType === 'perdida' && styles.segmentedButtonActive]}
              onPress={() => setReportType('perdida')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={18} 
                color={reportType === 'perdida' ? colors.botones.textoPrimario : colors.texto.secundario} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.segmentedButtonText, reportType === 'perdida' && styles.segmentedButtonTextActive]}>Perdida</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentedButton, reportType === 'encontrada' && styles.segmentedButtonActive]}
              onPress={() => setReportType('encontrada')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="check-circle" 
                size={18} 
                color={reportType === 'encontrada' ? colors.botones.textoPrimario : colors.texto.secundario} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.segmentedButtonText, reportType === 'encontrada' && styles.segmentedButtonTextActive]}>Encontrada</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Nombre de la Mascota</Text>
            <Text style={styles.requiredLabel}>*</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ej: Max, Firulais"
            placeholderTextColor={colors.texto.secundario}
            value={petName}
            onChangeText={setPetName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
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
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Raza</Text>
            <Text style={styles.requiredLabel}>*</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ej: Labrador, Siames"
            placeholderTextColor={colors.texto.secundario}
            value={petBreed}
            onChangeText={setPetBreed}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Descripción</Text>
            <Text style={styles.requiredLabel}>*</Text>
          </View>
          <Text style={styles.labelHint}>Colores, tamaño, particularidades que ayuden a identificarla</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Perro negro, tamaño mediano, con collar rojo..."
            placeholderTextColor={colors.texto.secundario}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            textAlignVertical="top"
            autoCorrect={false}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Última Ubicación Conocida</Text>
            <Text style={styles.requiredLabel}>*</Text>
          </View>
          <View style={styles.locationInputContainer}>
            <MaterialCommunityIcons name="map-marker" size={20} color={colors.primarios.indigo} style={styles.locationIconLeft} />
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="Ej: Av. Libertador 123, Palermo"
              placeholderTextColor={colors.texto.secundario}
              value={lastLocation}
              onChangeText={setLastLocation}
              autoCorrect={false}
            />
          </View>
        </View>

        {/* mapa ubicacion */}
        {/* 
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Elija la ubicacion en el mapa</Text>
            <Text style={styles.requiredLabel}>*</Text>

          </View>
        </View>
        */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Ubicación en mapa</Text>
            <Text style={styles.requiredLabel}>*</Text>
          </View>
          <View style={styles.mapSection}>
            {/* mapa lejano — si no hay ubicación seleccionada */}
            {selectedLatitude === null && selectedLongitude === null ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowMapModal(true)}
                style={{ height: 200, borderRadius: 10, overflow: "hidden" }}
              >
                <PetMap latitud={-38.4161} longitud={-63.6167} zoom={4} hideMarker />
              </TouchableOpacity>
            ) : (
              /* mapa con marcador — ubicación elegida */
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowMapModal(true)}
                style={{ height: 200, borderRadius: 12, overflow: "hidden" }}
              >
                <PetMap latitud={selectedLatitude} longitud={selectedLongitude} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Foto de la Mascota</Text>
            <Text style={styles.requiredLabel}>*</Text>
          </View>
          <Text style={styles.labelHint}>Una foto clara ayuda a identificar mejor a la mascota</Text>
          
          {photoUri ? (
            <View style={styles.photoPreviewContainer}>
              <Image 
                source={{ uri: photoUri }} 
                style={styles.photoPreviewLarge}
              />
              <TouchableOpacity 
                style={styles.removePhotoButton}
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoAsset(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color={colors.estado.perdido.base} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity 
                style={styles.photoIconButton} 
                onPress={handleImagePicker} 
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="camera" size={32} color={colors.primarios.indigo} />
                <Text style={styles.photoButtonText}>Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.photoIconButton} 
                onPress={handleImagePicker} 
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="image-multiple" size={32} color={colors.primarios.indigo} />
                <Text style={styles.photoButtonText}>Galería</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.publishButton, 
            (!isFormValid() || isUploading) && styles.publishButtonDisabled
          ]} 
          onPress={handlePublish}
          disabled={!!(!isFormValid() || isUploading)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.publishButtonText,
            (!isFormValid() || isUploading) && styles.publishButtonTextDisabled
          ]}>
            {isUploading ? 'Subiendo Foto...' : 'Publicar Aviso'}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

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

      {/* Modal mapa ubicacion */}
      <Modal visible={showMapModal} animationType="slide">
        <LocationSelectMap
          initialLat={selectedLatitude || -34.6037}
          initialLng={selectedLongitude || -58.3816}
          onLocationSelected={(lat, lng) => {
            setSelectedLatitude(lat);
            setSelectedLongitude(lng);
            //setLastLocation(`${lat}, ${lng}`); // guardás algo para Supabase - Pisa lo ingresado por usuario - usar geocode?
            setShowMapModal(false);
          }}
          onClose={() => setShowMapModal(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 0,
    alignItems: 'center',
    paddingBottom: 0,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarios.indigo,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.fondo.componentes,
    padding: 0,
    borderRadius: 0,
    marginTop: 0,
  },
  typeSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.texto.secundario,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.texto.secundario,
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requiredLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.estado.perdido.base,
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 13,
    color: colors.texto.secundario,
    textAlign: 'right',
    marginTop: 4,
  },
  inputGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.texto.primario,
    marginBottom: 8,
  },
  labelHint: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.texto.secundario,
    marginBottom: 8,
    marginTop: -4,
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: colors.bordes.primario,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 19,
    backgroundColor: colors.fondo.componentes,
    fontSize: 17,
    color: colors.texto.primario,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  pickerContainer: {
    marginBottom: 0,
    backgroundColor: colors.fondo.componentes,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  pickerItem: {
    color: colors.texto.primario,
    fontSize: 17,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 0,
    marginTop: 8,
    backgroundColor: colors.fondo.app,
    padding: 4,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  segmentedButtonActive: {
    backgroundColor: colors.primarios.indigo,
  },
  segmentedButtonText: {
    color: colors.texto.secundario,
    fontWeight: '600',
    fontSize: 15,
  },
  segmentedButtonTextActive: {
    color: colors.botones.textoPrimario,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.bordes.primario,
    borderWidth: 0.5,
    borderRadius: 10,
    backgroundColor: colors.fondo.componentes,
  },
  locationInput: {
    flex: 1,
    height: 44,
    borderWidth: 0,
    marginBottom: 0,
    paddingHorizontal: 12,
  },
  locationIconLeft: {
    marginLeft: 12,
    marginRight: 8,
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.fondo.app,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 17,
    color: colors.texto.primario,
    fontWeight: '600',
    marginTop: 12,
  },
  mapSubText: {
    fontSize: 13,
    color: colors.texto.secundario,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  photoIconButton: {
    width: 120,
    height: 120,
    backgroundColor: colors.fondo.app,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primarios.indigo,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 13,
    color: colors.primarios.indigo,
    fontWeight: '600',
    marginTop: 8,
  },
  photoPreviewContainer: {
    marginTop: 8,
    position: 'relative',
    alignItems: 'center',
  },
  photoPreviewLarge: {
    width: '100%',
    height: 250,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.fondo.componentes,
    borderRadius: 20,
    padding: 4,
  },
  publishButton: {
    width: '90%',
    backgroundColor: colors.primarios.indigo,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 20,
    marginBottom: 24,
    minHeight: 50,
    justifyContent: 'center',
  },
  publishButtonText: {
    color: colors.botones.textoPrimario,
    fontWeight: '600',
    fontSize: 17,
  },
  publishButtonDisabled: {
    backgroundColor: colors.fondo.app,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  publishButtonTextDisabled: {
    color: colors.texto.secundario,
    fontWeight: '600',
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