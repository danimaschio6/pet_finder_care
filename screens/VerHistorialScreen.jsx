// screens/VerHistorialScreen.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import colors from "../data/colors.json";

import {
  getPetHistory,
  deletePetHistory,
} from "../supabase/services/petHistoryService";

import FullScreenImageViewer from "./components/FullScreenImageViewer";

const VerHistorialScreen = ({ route, navigation }) => {
  const { petId } = route.params;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getPetHistory(petId);
      setRecords(data || []);
    } catch (e) {
      console.log("Historial error:", e);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [petId])
  );

  const handleDelete = (id) => {
    Alert.alert(
      "Eliminar registro",
      "¿Seguro que deseas eliminar este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePetHistory(id);
              loadHistory();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar.");
            }
          },
        },
      ]
    );
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(jpe?g|png|webp|gif)$/i.test(url);
  };

  const isPdfUrl = (url) => {
    if (!url) return false;
    return /\.pdf$/i.test(url);
  };

  const handleOpenAttachment = async (url) => {
    if (!url) return;

    if (isImageUrl(url)) {
      setSelectedImageUrl(url);
      setShowImageViewer(true);
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "No se pudo abrir el archivo adjunto.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo abrir el archivo adjunto.");
    }
  };

  const formatTipo = (tipo) => {
    if (!tipo) return "Sin tipo";
    switch (tipo) {
      case "vacuna":
        return "Vacuna";
      case "desparasitacion":
        return "Desparasitación";
      default:
        return "Otro";
    }
  };

  const renderItem = ({ item }) => {
    const hasFile = !!item.archivo_url;
    const imageFile = isImageUrl(item.archivo_url);
    const pdfFile = isPdfUrl(item.archivo_url);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("EditarHistorial", { history: item })}
        activeOpacity={0.9}
      >
        <View style={styles.row}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.title}>{formatTipo(item.tipo)}</Text>

            <Text style={styles.subText}>Fecha: {item.fecha}</Text>

            {item.condicion_corporal && (
              <Text style={styles.subText}>
                Condición corporal: {item.condicion_corporal}
              </Text>
            )}

            {item.peso && (
              <Text style={styles.subText}>Peso: {item.peso} kg</Text>
            )}

            {item.detalle && (
              <Text style={styles.detalleText} numberOfLines={2}>
                {item.detalle}
              </Text>
            )}

            {hasFile && (
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={() => handleOpenAttachment(item.archivo_url)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={
                    pdfFile
                      ? "document-text-outline"
                      : imageFile
                      ? "image-outline"
                      : "attach-outline"
                  }
                  size={18}
                  color={colors.botones.textoPrimario}
                />
                <Text style={styles.attachmentText}>
                  {pdfFile
                    ? "Ver PDF adjunto"
                    : imageFile
                    ? "Ver imagen adjunta"
                    : "Abrir archivo adjunto"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ✅ ICONO DE EDITAR (ahora visible) */}
          <View style={{ alignItems: "center", gap: 14 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditarHistorial", { history: item })}
            >
              <MaterialIcons
                name="edit"
                size={24}
                color={colors.primarios.indigo}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <MaterialIcons
                name="delete"
                size={24}
                color={colors.estado.perdido.base}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
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

        <Text style={styles.headerTitle}>Historial Clínico</Text>

        <View style={{ width: 22 }} />
      </View>

      {/* LISTA */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primarios.indigo} />
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay registros todavía</Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() =>
              navigation.navigate("AgregarHistorial", { petId: petId })
            }
          >
            <Text style={styles.addFirstButtonText}>+ Añadir primer registro</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AgregarHistorial", { petId })}
      >
        <Ionicons name="add" size={30} color={colors.botones.textoPrimario} />
      </TouchableOpacity>

      {/* VISOR FULL SCREEN PARA IMÁGENES */}
      {showImageViewer && selectedImageUrl && (
        <FullScreenImageViewer
          imageUrl={selectedImageUrl}
          onClose={() => {
            setShowImageViewer(false);
            setSelectedImageUrl(null);
          }}
        />
      )}
    </View>
  );
};

export default VerHistorialScreen;

/* ===============================
   ESTILOS — iOS / Minimal
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },

  header: {
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primarios.indigo,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: {
    color: colors.botones.textoPrimario,
    fontSize: 18,
    fontWeight: "bold",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    color: colors.texto.secundario,
    marginBottom: 16,
    textAlign: "center",
  },
  addFirstButton: {
    backgroundColor: colors.botones.primario,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: colors.botones.textoPrimario,
    fontWeight: "600",
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: colors.fondo.componentes,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.texto.primario,
  },
  subText: {
    fontSize: 13,
    color: colors.texto.secundario,
    marginTop: 4,
  },
  detalleText: {
    fontSize: 13,
    color: colors.texto.primario,
    marginTop: 6,
  },

  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.primarios.indigo,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  attachmentText: {
    color: colors.botones.textoPrimario,
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: colors.primarios.indigo,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});