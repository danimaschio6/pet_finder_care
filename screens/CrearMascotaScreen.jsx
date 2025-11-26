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
import { decode as atob } from "base-64";

// -------------------------------------------------------------
const petSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es obligatorio"),
  especie: Yup.string().required("La especie es obligatoria"),
  raza: Yup.string().nullable(),
  edad_numero: Yup.number()
    .nullable()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
  edad_unidad: Yup.string().oneOf(["mes", "año"]).required(),
  pelaje: Yup.string().nullable(),
  sexo: Yup.string().oneOf(["macho", "hembra"]).required(),
  estado_reproductivo: Yup.string()
    .oneOf(["castrado", "entero"])
    .required(),
});

const CrearMascotaScreen = ({ navigation }) => {
  const [uploading, setUploading] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);

  // -------------------------------------------------------------
  // PICKER SDK 54 → mediaTypes: ['images']
  // -------------------------------------------------------------
  const handlePickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // ✔ CORRECTO SDK 54
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true, // ✔ NECESARIO PARA SUPABASE
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      const mime = asset.mimeType ?? "image/jpeg";
      const ext = mime.split("/")[1] ?? "jpg";

      setPickedImage({
        uri: asset.uri,
        mimeType: mime,
        extension: ext,
        base64: asset.base64, // ✔ LISTA PARA SUBIR
      });
    } catch (err) {
      console.error("PICKER ERROR:", err);
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    }
  };

  // -------------------------------------------------------------
  // SUBIDA DE IMAGEN A SUPABASE (DIRECTO BASE64)
  // -------------------------------------------------------------
  
const uploadImage = async (userId) => {
  if (!pickedImage?.base64) return null;

  try {
    setUploading(true);

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
      return null;
    }

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
        edad_numero: values.edad_numero
          ? Number(values.edad_numero)
          : null,
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
      console.log("ERROR SUPABASE:", err);
      Alert.alert("Error", err.message ?? "Hubo un problema.");
    } finally {
      setUploading(false);
    }
  };

  // -------------------------------------------------------------
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
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
                    <Ionicons name="camera" size={30} color="#888" />
                    <Text style={styles.photoText}>Añadir foto</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* CAMPOS */}
              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                style={styles.input}
                value={values.nombre}
                onChangeText={handleChange("nombre")}
              />
              {errors.nombre && touched.nombre && (
                <Text style={styles.errorText}>{errors.nombre}</Text>
              )}

              <Text style={styles.label}>Especie*</Text>
              <TextInput
                style={styles.input}
                value={values.especie}
                onChangeText={handleChange("especie")}
              />
              {errors.especie && touched.especie && (
                <Text style={styles.errorText}>{errors.especie}</Text>
              )}

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
                  keyboardType="numeric"
                  value={values.edad_numero}
                  onChangeText={handleChange("edad_numero")}
                />

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
                <TouchableOpacity
                  style={[
                    styles.chip,
                    values.sexo === "macho" && styles.chipSelected,
                  ]}
                  onPress={() => setFieldValue("sexo", "macho")}
                >
                  <Text
                    style={
                      values.sexo === "macho" && styles.chipTextSelected
                    }
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
                    style={
                      values.sexo === "hembra" && styles.chipTextSelected
                    }
                  >
                    Hembra
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Estado reproductivo*</Text>
              <View style={{ flexDirection: "row" }}>
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
                    style={
                      values.estado_reproductivo === "castrado" &&
                      styles.chipTextSelected
                    }
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
                    style={
                      values.estado_reproductivo === "entero" &&
                      styles.chipTextSelected
                    }
                  >
                    Entero
                  </Text>
                </TouchableOpacity>
              </View>

              {/* GUARDAR */}
              <TouchableOpacity
                style={[styles.saveButton, uploading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fondo.app },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.primarios.indigo,
    justifyContent: "space-between",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: colors.fondo.componentes,
    borderRadius: 16,
    padding: 16,
  },
  photoContainer: { alignItems: "center", marginBottom: 16 },
  petPhoto: { width: 100, height: 100, borderRadius: 20 },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: { marginTop: 4, fontSize: 12, color: "#666" },
  label: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    backgroundColor: "#FAFAFA",
  },
  chip: {
    flex: 1,
    borderWidth: 1,
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
  },
  chipSelected: {
    backgroundColor: colors.primarios.indigo,
    borderColor: colors.primarios.indigo,
  },
  chipTextSelected: { color: "white", fontWeight: "bold" },
  saveButton: {
    backgroundColor: colors.botones.primario,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default CrearMascotaScreen;

