// screens/CrearMascotaScreen.jsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';

import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient';

// 🔥 SERVICES
import { createPet } from '../supabase/services/userPetsService';

// --------------------------------------------------------
// VALIDACIÓN FORM
// --------------------------------------------------------
const petSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es obligatorio'),
  especie: Yup.string().required('La especie es obligatoria'),
  raza: Yup.string().nullable(),
  edad_numero: Yup.number()
    .typeError('Debe ser un número')
    .nullable()
    .min(0, 'No puede ser negativo'),
  edad_unidad: Yup.string().oneOf(['mes', 'año', ''], 'Valor inválido'),
  pelaje: Yup.string().nullable(),
  sexo: Yup.string().oneOf(['macho', 'hembra', ''], 'Valor inválido'),
  estado_reproductivo: Yup.string().nullable(),
});

const CrearMascotaScreen = ({ navigation }) => {
  const [uploading, setUploading] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);

  // --------------------------------------------------------
  // PICKER IMAGEN
  // --------------------------------------------------------
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setPickedImage({
          uri: asset.uri,
          fileName: asset.fileName || `photo-${Date.now()}.jpg`,
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  // --------------------------------------------------------
  // SUBIR IMAGEN A STORAGE (service internal)
  // --------------------------------------------------------
  const uploadImage = async (userId) => {
    if (!pickedImage) return null;

    try {
      setUploading(true);

      const response = await fetch(pickedImage.uri);
      const blob = await response.blob();

      const extension = pickedImage.fileName.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('user_pets')
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        Alert.alert('Error', 'No se pudo subir la foto.');
        setUploading(false);
        return null;
      }

      const { data } =
        supabase.storage.from('user_pets').getPublicUrl(filePath);

      setUploading(false);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      setUploading(false);
      return null;
    }
  };

  // --------------------------------------------------------
  // GUARDAR MASCOTA USANDO EL SERVICE
  // --------------------------------------------------------
  const handleSubmitForm = async (values, { resetForm }) => {
    try {
      setUploading(true);

      // Obtener usuario autenticado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'No se pudo obtener el usuario.');
        setUploading(false);
        return;
      }

      const userId = user.id;

      // Subir imagen si existe
      let fotoUrl = null;
      if (pickedImage) fotoUrl = await uploadImage(userId);

      // --------📌 FIX APLICADO ACÁ --------
      const newPet = {
        user_id: userId,
        nombre: values.nombre.trim(),
        especie: values.especie.trim(),
        raza: values.raza?.trim() || null,
        edad_numero:
          values.edad_numero === "" ? null : Number(values.edad_numero),
        edad_unidad:
          values.edad_unidad === "" ? null : values.edad_unidad,
        pelaje: values.pelaje?.trim() || null,
        sexo: values.sexo || null,
        estado_reproductivo: values.estado_reproductivo?.trim() || null,
        foto_url: fotoUrl,
      };
      // -------------------------------------

      await createPet(newPet);

      setUploading(false);
      resetForm();
      setPickedImage(null);

      Alert.alert('Listo', 'Mascota creada correctamente.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setUploading(false);
      Alert.alert('Error', 'Ocurrió un problema al guardar.');
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.botones.textoPrimario} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Añadir Mascota</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Formik
          initialValues={{
            nombre: '',
            especie: '',
            raza: '',
            edad_numero: '',
            edad_unidad: '',
            pelaje: '',
            sexo: '',
            estado_reproductivo: '',
          }}
          validationSchema={petSchema}
          onSubmit={handleSubmitForm}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View style={styles.card}>
              {/* FOTO */}
              <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
                {pickedImage ? (
                  <Image source={{ uri: pickedImage.uri }} style={styles.petPhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera" size={28} color={colors.secundarios.gris} />
                    <Text style={styles.photoText}>Añadir foto</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* NOMBRE */}
              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Max"
                value={values.nombre}
                onChangeText={handleChange('nombre')}
                onBlur={handleBlur('nombre')}
              />
              {touched.nombre && errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre}</Text>
              )}

              {/* ESPECIE */}
              <Text style={styles.label}>Especie*</Text>
              <TextInput
                style={styles.input}
                placeholder="Perro, Gato..."
                value={values.especie}
                onChangeText={handleChange('especie')}
                onBlur={handleBlur('especie')}
              />
              {touched.especie && errors.especie && (
                <Text style={styles.errorText}>{errors.especie}</Text>
              )}

              {/* RAZA */}
              <Text style={styles.label}>Raza</Text>
              <TextInput
                style={styles.input}
                placeholder="Raza"
                value={values.raza}
                onChangeText={handleChange('raza')}
              />

              {/* EDAD */}
              <Text style={styles.label}>Edad</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Número"
                  keyboardType="numeric"
                  value={values.edad_numero}
                  onChangeText={handleChange('edad_numero')}
                />

                <TouchableOpacity
                  style={styles.chipContainer}
                  onPress={() => {
                    const next =
                      values.edad_unidad === 'mes'
                        ? 'año'
                        : 'mes';

                    setFieldValue('edad_unidad', next);
                  }}
                >
                  <Text style={styles.chipText}>
                    {values.edad_unidad === 'mes'
                      ? 'Mes(es)'
                      : values.edad_unidad === 'año'
                        ? 'Año(s)'
                        : 'Unidad'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* PELAJE */}
              <Text style={styles.label}>Pelaje</Text>
              <TextInput
                style={styles.input}
                value={values.pelaje}
                onChangeText={handleChange('pelaje')}
              />

              {/* SEXO */}
              <Text style={styles.label}>Sexo</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.chip, values.sexo === 'macho' && styles.chipSelected]}
                  onPress={() => handleChange('sexo')('macho')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      values.sexo === 'macho' && styles.chipTextSelected,
                    ]}
                  >
                    Macho
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chip, values.sexo === 'hembra' && styles.chipSelected]}
                  onPress={() => handleChange('sexo')('hembra')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      values.sexo === 'hembra' && styles.chipTextSelected,
                    ]}
                  >
                    Hembra
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ESTADO REPRODUCTIVO */}
              <Text style={styles.label}>Estado reproductivo</Text>
              <TextInput
                style={styles.input}
                placeholder="Castrado, entero..."
                value={values.estado_reproductivo}
                onChangeText={handleChange('estado_reproductivo')}
              />

              {/* BOTÓN GUARDAR */}
              <TouchableOpacity
                style={[styles.saveButton, uploading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={colors.botones.textoPrimario} />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar Mascota</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default CrearMascotaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.primarios.indigo,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.botones.textoPrimario,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.fondo.componentes,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  petPhoto: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.texto.secundario,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.texto.primario,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chipContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primarios.indigo,
    borderColor: colors.primarios.indigo,
  },
  chipText: {
    fontSize: 14,
    color: colors.texto.primario,
  },
  chipTextSelected: {
    color: colors.botones.textoPrimario,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.botones.primario,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.botones.textoPrimario,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.estado.perdido.base,
    fontSize: 12,
    marginTop: 2,
  },
});
