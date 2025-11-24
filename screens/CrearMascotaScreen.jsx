// screens/CrearMascotaScreen.jsx

import React, { useState } from "react";
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
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";

import colors from "../data/colors.json";
import { supabase } from "../supabase/client/supabaseClient";
import { createPet } from "../supabase/services/userPetsService";

// --------------------------------------------------------------
// VALIDACIÓN — compatible con los CHECK CONSTRAINT de Supabase
// --------------------------------------------------------------
const petSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es obligatorio"),
  especie: Yup.string().required("La especie es obligatoria"),
  raza: Yup.string().nullable(),
  edad_numero: Yup.number()
    .typeError("Debe ser un número")
    .nullable()
    .min(0, "No puede ser negativo"),
  edad_unidad: Yup.string().oneOf(["mes", "año"], "Selecciona mes o año"),
  pelaje: Yup.string().nullable(),
  sexo: Yup.string().oneOf(["macho", "hembra"], "Selecciona un sexo"),
  estado_reproductivo: Yup.string().oneOf(
    ["castrado", "entero"],
    "Selecciona castrado o entero"
  ),
});

const CrearMascotaScreen = ({ navigation }) => {
  const [uploading, setUploading] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);

  // --------------------------------------------------------------
  // ELEGIR IMAGEN (compatible con Expo Go)
  // --------------------------------------------------------------
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // 👈 AQUÍ EL CAMBIO
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      setPickedImage({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        extension: (asset.mimeType ?? "image/jpeg").split("/")[1],
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  // --------------------------------------------------------------
  // SUBIR IMAGEN a Supabase Storage (usando fetch → Blob)
  // --------------------------------------------------------------
  const uploadImage = async (userId) => {
    if (!pickedImage) return null;

    try {
      setUploading(true);

      const filePath = `${userId}/${Date.now()}.${pickedImage.extension}`;

      // fetch convierte la URI local en un Blob compatible
      const response = await fetch(pickedImage.uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("user_pets")
        .upload(filePath, blob, {
          contentType: pickedImage.mimeType,
          upsert: false,
        });

      if (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo subir la imagen.");
        return null;
      }

      const { data } = supabase.storage
        .from("user_pets")
        .getPublicUrl(filePath);

      return data.publicUrl; // URL pública que se guarda en foto_url
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------------------
  // SUBMIT — CREAR MASCOTA
  // --------------------------------------------------------------
  const handleSubmitForm = async (values, { resetForm }) => {
    try {
      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "No se pudo obtener el usuario.");
        return;
      }

      const userId = user.id;

      let fotoUrl = null;
      if (pickedImage) fotoUrl = await uploadImage(userId);

      const newPet = {
        user_id: userId,
        nombre: values.nombre.trim(),
        especie: values.especie.trim(),
        raza: values.raza?.trim() || null,
        edad_numero:
          values.edad_numero === "" ? null : Number(values.edad_numero),
        edad_unidad: values.edad_unidad,
        pelaje: values.pelaje?.trim() || null,
        sexo: values.sexo,
        estado_reproductivo: values.estado_reproductivo,
        foto_url: fotoUrl, // solo la URL, tal como define tu tabla
      };

      await createPet(newPet);

      resetForm();
      setPickedImage(null);

      Alert.alert("Listo", "Mascota creada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Hubo un problema al crear la mascota.");
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------------------
  // UI
  // --------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.botones.textoPrimario}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Añadir Mascota</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Formik
          initialValues={{
            nombre: "",
            especie: "",
            raza: "",
            edad_numero: "",
            edad_unidad: "",
            pelaje: "",
            sexo: "",
            estado_reproductivo: "",
          }}
          validationSchema={petSchema}
          onSubmit={handleSubmitForm}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <View style={styles.card}>
              {/* FOTO */}
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={handlePickImage}
              >
                {pickedImage ? (
                  <Image
                    source={{ uri: pickedImage.uri }}
                    style={styles.petPhoto}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons
                      name="camera"
                      size={28}
                      color={colors.secundarios.gris}
                    />
                    <Text style={styles.photoText}>Añadir foto</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* NOMBRE */}
              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                style={styles.input}
                value={values.nombre}
                onChangeText={handleChange("nombre")}
              />
              {touched.nombre && errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre}</Text>
              )}

              {/* ESPECIE */}
              <Text style={styles.label}>Especie*</Text>
              <TextInput
                style={styles.input}
                value={values.especie}
                onChangeText={handleChange("especie")}
                placeholder="Perro, Gato..."
              />
              {touched.especie && errors.especie && (
                <Text style={styles.errorText}>{errors.especie}</Text>
              )}

              {/* RAZA */}
              <Text style={styles.label}>Raza</Text>
              <TextInput
                style={styles.input}
                value={values.raza}
                onChangeText={handleChange("raza")}
                placeholder="Ej: Labrador, Mestizo..."
              />

              {/* EDAD */}
              <Text style={styles.label}>Edad*</Text>
              <View style={styles.ageRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="Número"
                  keyboardType="numeric"
                  value={values.edad_numero}
                  onChangeText={handleChange("edad_numero")}
                />

                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.chipSmall,
                      values.edad_unidad === "mes" && styles.chipSelected,
                    ]}
                    onPress={() => setFieldValue("edad_unidad", "mes")}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        values.edad_unidad === "mes" &&
                          styles.chipTextSelected,
                      ]}
                    >
                      Meses
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.chipSmall,
                      values.edad_unidad === "año" && styles.chipSelected,
                    ]}
                    onPress={() => setFieldValue("edad_unidad", "año")}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        values.edad_unidad === "año" &&
                          styles.chipTextSelected,
                      ]}
                    >
                      Años
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* SEXO */}
              <Text style={styles.label}>Sexo*</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.sexo === "macho" && styles.chipSelected,
                  ]}
                  onPress={() => setFieldValue("sexo", "macho")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      values.sexo === "macho" && styles.chipTextSelected,
                    ]}
                  >
                    Macho
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.sexo === "hembra" && styles.chipSelected,
                  ]}
                  onPress={() => setFieldValue("sexo", "hembra")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      values.sexo === "hembra" && styles.chipTextSelected,
                    ]}
                  >
                    Hembra
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ESTADO REPRODUCTIVO */}
              <Text style={styles.label}>Estado reproductivo*</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.estado_reproductivo === "castrado" &&
                      styles.chipSelected,
                  ]}
                  onPress={() =>
                    setFieldValue("estado_reproductivo", "castrado")
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      values.estado_reproductivo === "castrado" &&
                        styles.chipTextSelected,
                    ]}
                  >
                    Castrado
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.estado_reproductivo === "entero" &&
                      styles.chipSelected,
                  ]}
                  onPress={() =>
                    setFieldValue("estado_reproductivo", "entero")
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      values.estado_reproductivo === "entero" &&
                        styles.chipTextSelected,
                    ]}
                  >
                    Entero
                  </Text>
                </TouchableOpacity>
              </View>

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

// --------------------------------------------------------------
// ESTILOS
// --------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.primarios.indigo,
    justifyContent: "space-between",
  },
  headerTitle: {
    color: colors.botones.textoPrimario,
    fontSize: 18,
    fontWeight: "bold",
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
    alignItems: "center",
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
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.texto.secundario,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
    backgroundColor: "#F9FAFB",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 6,
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    borderRadius: 50,
    paddingVertical: 8,
    alignItems: "center",
  },
  chipSmall: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
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
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.botones.primario,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.botones.textoPrimario,
    fontSize: 16,
    fontWeight: "bold",
  },
});
