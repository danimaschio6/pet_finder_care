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
<<<<<<< HEAD
import * as FileSystem from "expo-file-system";
import { decode as atob } from "base64-js";

=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";

import colors from "../data/colors.json";
import { supabase } from "../supabase/client/supabaseClient";
import { createPet } from "../supabase/services/userPetsService";
<<<<<<< HEAD

// --------------------------------------------------------------
// VALIDACIÓN — compatible con los CHECK CONSTRAINT de Supabase
// --------------------------------------------------------------
=======
import { decode as atob } from "base-64";

// -------------------------------------------------------------
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
const petSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es obligatorio"),
  especie: Yup.string().required("La especie es obligatoria"),
  raza: Yup.string().nullable(),
  edad_numero: Yup.number()
<<<<<<< HEAD
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
=======
    .nullable()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
  edad_unidad: Yup.string().oneOf(["mes", "año"]).required(),
  pelaje: Yup.string().nullable(),
  sexo: Yup.string().oneOf(["macho", "hembra"]).required(),
  estado_reproductivo: Yup.string()
    .oneOf(["castrado", "entero"])
    .required(),
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
});

const CrearMascotaScreen = ({ navigation }) => {
  const [uploading, setUploading] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);

<<<<<<< HEAD
  // --------------------------------------------------------------
  // ELEGIR IMAGEN
  // --------------------------------------------------------------
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
=======
  // -------------------------------------------------------------
  // PICKER SDK 54 → mediaTypes: ['images']
  // -------------------------------------------------------------
  const handlePickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
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
<<<<<<< HEAD
      console.error(err);
=======
      console.error("PICKER ERROR:", err);
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

<<<<<<< HEAD
  // --------------------------------------------------------------
  // SUBIR IMAGEN A SUPABASE STORAGE — versión FIJA para Android/iOS
  // --------------------------------------------------------------
  const uploadImage = async (userId) => {
    if (!pickedImage) return null;
=======
  // -------------------------------------------------------------
  // SUBIDA DE IMAGEN A SUPABASE (DIRECTO BASE64)
  // -------------------------------------------------------------
  
const uploadImage = async (userId) => {
  if (!pickedImage?.base64) return null;
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78

    try {
      setUploading(true);

<<<<<<< HEAD
      const base64 = await FileSystem.readAsStringAsync(pickedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileBytes = atob(base64);
      const extension = pickedImage.fileName.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("user_pets")
        .upload(filePath, fileBytes, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        Alert.alert("Error", "No se pudo subir la imagen.");
        return null;
      }

      const { data } = supabase.storage
        .from("user_pets")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error(err);
=======
    const filePath = `${userId}/${Date.now()}.${pickedImage.extension}`;

    // 1. Convertir base64 a bytes (archivo)
    const binary = atob(pickedImage.base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // 2. Subir archivo binario REAL a Supabase
    const { error } = await supabase.storage
      .from("user_pets")
      .upload(filePath, bytes, {
        contentType: pickedImage.mimeType,
      });

    if (error) {
      console.error("Storage error:", error);
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
      return null;
    }
  };

<<<<<<< HEAD
  // --------------------------------------------------------------
  // SUBMIT — CREAR MASCOTA
  // --------------------------------------------------------------
=======
    // 3. Obtener URL pública
    const { data } = supabase.storage
      .from("user_pets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("uploadImage ERROR:", err);
    return null;
  } finally {
    setUploading(false);
  }
};


  // -------------------------------------------------------------
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  const handleSubmitForm = async (values, { resetForm }) => {
    try {
      setUploading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

<<<<<<< HEAD
      if (userError || !user) {
=======
      if (!user) {
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
        Alert.alert("Error", "No se pudo obtener el usuario.");
        return;
      }

      const userId = user.id;

      let fotoUrl = null;
      if (pickedImage) fotoUrl = await uploadImage(userId);

<<<<<<< HEAD
      // Payload compatible con tu esquema exacto
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
      const newPet = {
        user_id: userId,
        nombre: values.nombre.trim(),
        especie: values.especie.trim(),
        raza: values.raza?.trim() || null,
<<<<<<< HEAD
        edad_numero:
          values.edad_numero === "" ? null : Number(values.edad_numero),
=======
        edad_numero: values.edad_numero
          ? Number(values.edad_numero)
          : null,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
        edad_unidad: values.edad_unidad,
        pelaje: values.pelaje?.trim() || null,
        sexo: values.sexo,
        estado_reproductivo: values.estado_reproductivo,
        foto_url: fotoUrl,
      };

      await createPet(newPet);

      resetForm();
      setPickedImage(null);

      Alert.alert("Listo", "Mascota creada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
<<<<<<< HEAD
      console.error(err);
      Alert.alert("Error", "Hubo un problema al crear la mascota.");
=======
      console.log("ERROR SUPABASE:", err);
      Alert.alert("Error", err.message ?? "Hubo un problema.");
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
    } finally {
      setUploading(false);
    }
  };

<<<<<<< HEAD
  // --------------------------------------------------------------
  // UI
  // --------------------------------------------------------------
=======
  // -------------------------------------------------------------
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
<<<<<<< HEAD
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.botones.textoPrimario}
          />
=======
          <Ionicons name="arrow-back" size={24} color="white" />
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
            handleBlur,
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
                    <Ionicons
                      name="camera"
                      size={28}
                      color={colors.secundarios.gris}
                    />
=======
                    <Ionicons name="camera" size={30} color="#888" />
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
                onChangeText={handleChange("nombre")}
<<<<<<< HEAD
                onBlur={handleBlur("nombre")}
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
                onChangeText={handleChange("especie")}
<<<<<<< HEAD
                onBlur={handleBlur("especie")}
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
              />
              {touched.especie && errors.especie && (
                <Text style={styles.errorText}>{errors.especie}</Text>
              )}

<<<<<<< HEAD
              {/* EDAD */}
              <Text style={styles.label}>Edad*</Text>
              <View style={styles.ageRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="Número"
=======
              <Text style={styles.label}>Raza</Text>
              <TextInput
                style={styles.input}
                value={values.raza}
                onChangeText={handleChange("raza")}
              />

              <Text style={styles.label}>Pelaje</Text>
              <TextInput
                style={styles.input}
                value={values.pelaje}
                onChangeText={handleChange("pelaje")}
              />

              <Text style={styles.label}>Edad*</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
                  keyboardType="numeric"
                  value={values.edad_numero}
                  onChangeText={handleChange("edad_numero")}
                />

<<<<<<< HEAD
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
=======
                <TouchableOpacity
                  style={[
                    styles.chipSmall,
                    values.edad_unidad === "mes" && styles.chipSelected,
                  ]}
                  onPress={() => setFieldValue("edad_unidad", "mes")}
                >
                  <Text
                    style={
                      values.edad_unidad === "mes" &&
                      styles.chipTextSelected
                    }
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
                    style={
                      values.edad_unidad === "año" &&
                      styles.chipTextSelected
                    }
                  >
                    Años
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Sexo*</Text>
              <View style={{ flexDirection: "row" }}>
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.sexo === "macho" && styles.chipSelected,
                  ]}
                  onPress={() => setFieldValue("sexo", "macho")}
                >
                  <Text
<<<<<<< HEAD
                    style={[
                      styles.chipText,
                      values.sexo === "macho" && styles.chipTextSelected,
                    ]}
=======
                    style={
                      values.sexo === "macho" && styles.chipTextSelected
                    }
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
                    style={[
                      styles.chipText,
                      values.sexo === "hembra" && styles.chipTextSelected,
                    ]}
=======
                    style={
                      values.sexo === "hembra" && styles.chipTextSelected
                    }
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
                  >
                    Hembra
                  </Text>
                </TouchableOpacity>
              </View>

<<<<<<< HEAD
              {/* ESTADO REPRODUCTIVO */}
              <Text style={styles.label}>Estado reproductivo*</Text>
              <View style={styles.row}>
=======
              <Text style={styles.label}>Estado reproductivo*</Text>
              <View style={{ flexDirection: "row" }}>
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.estado_reproductivo === "castrado" &&
                      styles.chipSelected,
                  ]}
<<<<<<< HEAD
                  onPress={() => setFieldValue("estado_reproductivo", "castrado")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      values.estado_reproductivo === "castrado" &&
                        styles.chipTextSelected,
                    ]}
=======
                  onPress={() =>
                    setFieldValue("estado_reproductivo", "castrado")
                  }
                >
                  <Text
                    style={
                      values.estado_reproductivo === "castrado" &&
                      styles.chipTextSelected
                    }
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
                  >
                    Castrado
                  </Text>
                </TouchableOpacity>
<<<<<<< HEAD

                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.estado_reproductivo === "entero" &&
                      styles.chipSelected,
                  ]}
                  onPress={() => setFieldValue("estado_reproductivo", "entero")}
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
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78

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

<<<<<<< HEAD
export default CrearMascotaScreen;

// --------------------------------------------------------------
// ESTILOS
// --------------------------------------------------------------
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
  },
  headerTitle: {
    color: colors.botones.textoPrimario,
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  card: {
    backgroundColor: colors.fondo.componentes,
    borderRadius: 16,
    padding: 16,
<<<<<<< HEAD
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
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
<<<<<<< HEAD
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
=======
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  input: {
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    borderRadius: 8,
<<<<<<< HEAD
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
=======
    padding: 10,
    marginTop: 4,
    backgroundColor: "#FAFAFA",
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  chip: {
    flex: 1,
    borderWidth: 1,
<<<<<<< HEAD
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
=======
    borderColor: "#AAA",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  chipSmall: {
    borderWidth: 1,
    borderColor: "#AAA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 3,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  chipSelected: {
    backgroundColor: colors.primarios.indigo,
    borderColor: colors.primarios.indigo,
  },
<<<<<<< HEAD
  chipText: {
    fontSize: 14,
    color: colors.texto.primario,
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
=======
  chipTextSelected: { color: "white", fontWeight: "bold" },
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.botones.primario,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
<<<<<<< HEAD
  },
  saveButtonText: {
    color: colors.botones.textoPrimario,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: colors.estado.perdido.base,
    fontSize: 12,
    marginTop: -4,
    marginBottom: 4,
=======
    marginTop: 20,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
});
