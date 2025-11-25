// screens/EditarMascotaScreen.jsx

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

import { Formik } from "formik";
import * as Yup from "yup";
=======
import { decode as atob } from "base-64"; // ✔ CORRECTO PARA SDK 54

import { Formik } from "formik";
import * as Yup from "yup";

>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import colors from "../data/colors.json";
import { supabase } from "../supabase/client/supabaseClient";

// SERVICES
import { updatePet, deletePet } from "../supabase/services/userPetsService";

// --------------------------------------------------------------
<<<<<<< HEAD
// VALIDACIÓN — alineada con CHECK constraints de Supabase
=======
// VALIDACIÓN
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
// --------------------------------------------------------------
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
  edad_unidad: Yup.string().oneOf(["mes", "año"]),
  pelaje: Yup.string().nullable(),
  sexo: Yup.string().oneOf(["macho", "hembra"]),
  estado_reproductivo: Yup.string().oneOf(["castrado", "entero"]),
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
});

const EditarMascotaScreen = ({ route, navigation }) => {
  const { pet } = route.params;

  const [pickedImage, setPickedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------------------
<<<<<<< HEAD
  // ELEGIR IMAGEN
  // --------------------------------------------------------------
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
=======
  // PICKER IMAGEN SDK 54
  // --------------------------------------------------------------
  const handlePickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a tu galería para cambiar la foto."
        );
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  // --------------------------------------------------------------
<<<<<<< HEAD
  // SUBIR IMAGEN — overwrite real en Supabase Storage
  // Ruta: user_id/pet.id.extension
  // --------------------------------------------------------------
  const uploadImage = async () => {
    // Si no se eligió nueva imagen, devolvemos la anterior
    if (!pickedImage) return pet.foto_url;
=======
  // SUBIR IMAGEN (REEMPLAZO REAL)
  // Ruta: user_id / petId.extension
  // --------------------------------------------------------------
  const uploadImage = async () => {
    if (!pickedImage?.base64) return pet.foto_url;
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78

    try {
      setLoading(true);

<<<<<<< HEAD
      // Leer archivo como base64
      const base64 = await FileSystem.readAsStringAsync(pickedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir base64 -> bytes (Uint8Array compatible)
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const extension = pickedImage.fileName.split(".").pop();
      const filePath = `${pet.user_id}/${pet.id}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("user_pets")
        .upload(filePath, bytes, {
          contentType: "image/jpeg",
          upsert: true, // overwrite
        });

      if (uploadError) {
        console.error(uploadError);
        Alert.alert("Error", "No se pudo subir la imagen.");
=======
      const filePath = `${pet.user_id}/${pet.id}.${pickedImage.extension}`;

      // Convertir base64 → bytes (Uint8Array)
      const binary = atob(pickedImage.base64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const { error } = await supabase.storage
        .from("user_pets")
        .upload(filePath, bytes, {
          contentType: pickedImage.mimeType,
          upsert: true, // ✔ REEMPLAZA LA FOTO EXISTENTE
        });

      if (error) {
        console.error("Upload error:", error);
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
        return pet.foto_url;
      }

      const { data } = supabase.storage
        .from("user_pets")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error(err);
      return pet.foto_url;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------
  // ELIMINAR MASCOTA
  // --------------------------------------------------------------
  const handleDelete = () => {
    Alert.alert(
      "Eliminar mascota",
      "¿Seguro que deseas eliminar esta mascota?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePet(pet.id);
<<<<<<< HEAD
              Alert.alert("Listo", "Mascota eliminada correctamente.", [
                { text: "OK", onPress: () => navigation.navigate("MisMascotas") },
=======
              Alert.alert("Listo", "Mascota eliminada.", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("MisMascotas"),
                },
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
              ]);
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar la mascota.");
            }
          },
        },
      ]
    );
  };

  // --------------------------------------------------------------
  // GUARDAR CAMBIOS
  // --------------------------------------------------------------
  const handleUpdate = async (values) => {
    try {
      setLoading(true);

      const foto_url = await uploadImage();

      const payload = {
        nombre: values.nombre.trim(),
        especie: values.especie.trim(),
        raza: values.raza?.trim() || null,
        edad_numero:
          values.edad_numero === "" ? null : Number(values.edad_numero),
        edad_unidad: values.edad_unidad || null,
        pelaje: values.pelaje?.trim() || null,
        sexo: values.sexo || null,
        estado_reproductivo: values.estado_reproductivo || null,
        foto_url,
      };

      await updatePet(pet.id, payload);

      Alert.alert("Listo", "Mascota actualizada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Hubo un problema al actualizar.");
    } finally {
      setLoading(false);
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
            size={22}
            color={colors.botones.textoPrimario}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Editar Mascota</Text>

<<<<<<< HEAD
        {/* BOTÓN TACHO */}
        <TouchableOpacity onPress={handleDelete}>
          <MaterialIcons
            name="delete"
            size={24}
=======
        <TouchableOpacity onPress={handleDelete}>
          <MaterialIcons
            name="delete"
            size={26}
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
            color={colors.estado.perdido.base}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Formik
          initialValues={{
            nombre: pet.nombre || "",
            especie: pet.especie || "",
            raza: pet.raza || "",
            edad_numero: pet.edad_numero?.toString() || "",
            edad_unidad: pet.edad_unidad || "",
            pelaje: pet.pelaje || "",
            sexo: pet.sexo || "",
            estado_reproductivo: pet.estado_reproductivo || "",
          }}
          validationSchema={petSchema}
          onSubmit={handleUpdate}
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
                ) : pet.foto_url ? (
                  <Image
                    source={{ uri: pet.foto_url }}
                    style={styles.petPhoto}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons
                      name="camera"
                      size={28}
                      color={colors.secundarios.gris}
                    />
                    <Text style={styles.photoText}>Cambiar foto</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* NOMBRE */}
              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                style={styles.input}
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
                value={values.especie}
                onChangeText={handleChange("especie")}
<<<<<<< HEAD
                onBlur={handleBlur("especie")}
                placeholder="Perro, Gato..."
              />
              {touched.especie && errors.especie && (
=======
              />
              {errors.especie && touched.especie && (
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
                <Text style={styles.errorText}>{errors.especie}</Text>
              )}

              {/* RAZA */}
              <Text style={styles.label}>Raza</Text>
              <TextInput
                style={styles.input}
                value={values.raza}
                onChangeText={handleChange("raza")}
              />

              {/* EDAD */}
              <Text style={styles.label}>Edad*</Text>
<<<<<<< HEAD
              <View style={styles.ageRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="Número"
=======
              <View style={styles.row}>
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
=======
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
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
              </View>

              {/* PELAJE */}
              <Text style={styles.label}>Pelaje</Text>
              <TextInput
                style={styles.input}
                value={values.pelaje}
                onChangeText={handleChange("pelaje")}
              />

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
<<<<<<< HEAD
                      values.sexo === "macho" && styles.chipTextSelected,
=======
                      values.sexo === "macho" &&
                        styles.chipTextSelected,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
                      values.sexo === "hembra" && styles.chipTextSelected,
=======
                      values.sexo === "hembra" &&
                        styles.chipTextSelected,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
                style={[styles.saveButton, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.botones.textoPrimario} />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
export default EditarMascotaScreen;

=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
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
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
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
<<<<<<< HEAD
    backgroundColor: "#E5E7EB",
=======
    backgroundColor: "#EEE",
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
    fontWeight: "600",
    marginBottom: 4,
    color: colors.texto.primario,
    marginTop: 8,
=======
    fontWeight: "bold",
    marginTop: 10,
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
=======
    padding: 10,
    marginTop: 4,
    backgroundColor: "#FAFAFA",
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 6,
<<<<<<< HEAD
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
=======
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  chip: {
    flex: 1,
    borderWidth: 1,
<<<<<<< HEAD
    borderColor: colors.bordes.primario,
    borderRadius: 50,
=======
    borderColor: "#AAA",
    borderRadius: 20,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
    paddingVertical: 8,
    alignItems: "center",
  },
  chipSmall: {
<<<<<<< HEAD
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    marginRight: 8,
=======
    borderWidth: 1,
    borderColor: "#AAA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
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
<<<<<<< HEAD
    fontWeight: "600",
=======
    fontWeight: "bold",
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.botones.primario,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
<<<<<<< HEAD
=======
    marginTop: 20,
>>>>>>> f3796ed79ca88c48d2f8e643399bca8073733a78
  },
  saveButtonText: {
    color: colors.botones.textoPrimario,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: colors.estado.perdido.base,
    fontSize: 12,
    marginTop: 2,
  },
});
