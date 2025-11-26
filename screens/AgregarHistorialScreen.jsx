// screens/AgregarHistorialScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
// 👇 YA NO USAMOS expo-file-system AQUÍ
// import * as FileSystem from "expo-file-system";
// import { decode as atob } from "base64-js";

import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";

import colors from "../data/colors.json";
import {
  createPetHistory,
  updatePetHistory,
  uploadHistoryFile,
} from "../supabase/services/petHistoryService";

const tipoOptions = ["vacuna", "desparasitacion", "otro"];

const condicionOptions = [
  "baja de peso",
  "ideal",
  "sobrepeso",
  "obesa",
  "muy delgada",
  "robusta",
  "otra",
];

// VALIDACIÓN alineada al CHECK de la tabla
const historySchema = Yup.object().shape({
  tipo: Yup.string()
    .oneOf(tipoOptions, "Selecciona un tipo válido")
    .required("El tipo es obligatorio"),
  fecha: Yup.string().required("La fecha es obligatoria"),
  peso: Yup.number()
    .typeError("Debe ser un número")
    .nullable()
    .min(0, "No puede ser negativo"),
  condicion_corporal: Yup.string()
    .nullable()
    .oneOf([...condicionOptions, null], "Valor no válido"),
  detalle: Yup.string().nullable(),
});

const AgregarHistorialScreen = ({ route, navigation }) => {
  const { petId } = route.params;

  const [loading, setLoading] = useState(false);
  const [pickedFile, setPickedFile] = useState(null);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true, // importante para que expo-file-system/legacy pueda leerlo
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets ? result.assets[0] : result;

      setPickedFile({
        uri: file.uri,
        name: file.name || `file-${Date.now()}`,
        mimeType: file.mimeType || "application/octet-stream",
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo seleccionar el archivo.");
    }
  };

  const handleSubmitForm = async (values, { resetForm }) => {
    try {
      setLoading(true);

      const baseRecord = {
        pet_id: petId,
        tipo: values.tipo,
        fecha: values.fecha,
        peso:
          values.peso === "" || values.peso === null
            ? null
            : Number(values.peso),
        condicion_corporal: values.condicion_corporal || null,
        detalle: values.detalle?.trim() || null,
        archivo_url: null,
      };

      // 1) Crear registro básico sin archivo
      const created = await createPetHistory(baseRecord);

      // 2) Si hay archivo → delegar lectura/subida al servicio
      if (pickedFile) {
        const extension = pickedFile.name.includes(".")
          ? pickedFile.name.split(".").pop()
          : "bin";

        const publicUrl = await uploadHistoryFile(
          petId,
          created.id,
          extension,
          pickedFile.uri // 👈 IMPORTANTE: solo enviamos el URI
        );

        await updatePetHistory(created.id, { archivo_url: publicUrl });
      }

      resetForm();
      setPickedFile(null);

      Alert.alert("Listo", "Registro agregado correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("ERROR AGREGAR HISTORIAL:", err);
      Alert.alert("Error", "No se pudo guardar el historial.");
    } finally {
      setLoading(false);
    }
  };

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

        <Text style={styles.headerTitle}>Añadir historial</Text>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Formik
          initialValues={{
            tipo: "",
            fecha: "",
            peso: "",
            condicion_corporal: "",
            detalle: "",
          }}
          validationSchema={historySchema}
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
              {/* TIPO */}
              <Text style={styles.label}>Tipo*</Text>
              <View style={styles.rowWrap}>
                {tipoOptions.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.chip,
                      values.tipo === t && styles.chipSelected,
                    ]}
                    onPress={() => setFieldValue("tipo", t)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        values.tipo === t && styles.chipTextSelected,
                      ]}
                    >
                      {t === "vacuna"
                        ? "Vacuna"
                        : t === "desparasitacion"
                        ? "Desparasitación"
                        : "Otro"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {touched.tipo && errors.tipo && (
                <Text style={styles.errorText}>{errors.tipo}</Text>
              )}

              {/* FECHA */}
              <Text style={styles.label}>Fecha*</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={values.fecha}
                onChangeText={handleChange("fecha")}
                onBlur={handleBlur("fecha")}
              />
              {touched.fecha && errors.fecha && (
                <Text style={styles.errorText}>{errors.fecha}</Text>
              )}

              {/* PESO */}
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 5.4"
                keyboardType="numeric"
                value={values.peso}
                onChangeText={handleChange("peso")}
              />
              {touched.peso && errors.peso && (
                <Text style={styles.errorText}>{errors.peso}</Text>
              )}

              {/* CONDICIÓN CORPORAL */}
              <Text style={styles.label}>Condición corporal</Text>
              <View style={styles.rowWrap}>
                {condicionOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.chipSmall,
                      values.condicion_corporal === c &&
                        styles.chipSelected,
                    ]}
                    onPress={() => setFieldValue("condicion_corporal", c)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        values.condicion_corporal === c &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* DETALLE */}
              <Text style={styles.label}>Detalle</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Notas, síntomas, indicaciones del veterinario..."
                value={values.detalle}
                onChangeText={handleChange("detalle")}
                multiline
                numberOfLines={4}
              />

              {/* ARCHIVO ADJUNTO */}
              <Text style={styles.label}>Archivo adjunto (opcional)</Text>
              <TouchableOpacity
                style={styles.fileButton}
                onPress={handlePickFile}
              >
                <Ionicons
                  name="attach-outline"
                  size={20}
                  color={colors.botones.textoPrimario}
                />
                <Text style={styles.fileButtonText}>
                  {pickedFile ? "Cambiar archivo" : "Adjuntar archivo"}
                </Text>
              </TouchableOpacity>
              {pickedFile && (
                <Text style={styles.fileName}>{pickedFile.name}</Text>
              )}

              {/* BOTÓN GUARDAR */}
              <TouchableOpacity
                style={[styles.saveButton, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.botones.textoPrimario} />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar registro</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default AgregarHistorialScreen;

// ==== STYLES ====
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
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
  },
  chipSelected: {
    backgroundColor: colors.primarios.indigo,
    borderColor: colors.primarios.indigo,
  },
  chipText: {
    fontSize: 13,
    color: colors.texto.primario,
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.botones.primario,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  fileButtonText: {
    color: colors.botones.textoPrimario,
    marginLeft: 8,
    fontWeight: "600",
  },
  fileName: {
    fontSize: 12,
    color: colors.texto.secundario,
    marginTop: 4,
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
  errorText: {
    color: colors.estado.perdido.base,
    fontSize: 12,
    marginTop: -2,
    marginBottom: 4,
  },
});

