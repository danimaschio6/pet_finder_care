// screens/VerMascotaScreen.jsx 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import colors from '../data/colors.json';
import FullScreenImageViewer from './components/FullScreenImageViewer';
import { reportAsLost, markAsFound } from '../supabase/services/reportPetService';
import { supabase } from '../supabase/client/supabaseClient';
import PetMap from './components/PetMap';
import LocationSelectMap from './components/LocationSelectMap';

/* ================= FORMATEADORES (NO TOCADOS) ================= */

const formatEdad = (pet) => {
  const n = pet.edad_numero;
  const u = pet.edad_unidad;
  if (!n || !u) return "—";
  if (u === "mes") return n === 1 ? "1 mes" : `${n} meses`;
  if (u === "año") return n === 1 ? "1 año" : `${n} años`;
  return "—";
};

const formatEstadoReproductivo = (pet) => {
  if (!pet.estado_reproductivo) return "—";
  if (pet.sexo === "hembra") {
    if (pet.estado_reproductivo === "castrado") return "castrada";
    if (pet.estado_reproductivo === "entero") return "entera";
  }
  return pet.estado_reproductivo;
};

/* ================= COMPONENTE ================= */

const VerMascotaScreen = ({ route, navigation }) => {
  const { pet } = route.params;
  const [showViewer, setShowViewer] = useState(false);

  
  const [modalMapa, setModalMapa] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLatitude, setSelectedLatitude] = useState(null);
  const [selectedLongitude, setSelectedLongitude] = useState(null);

  // ✅ Estado: indica si HAY una publicación perdida en `pets` para esta mascota
  const [publicadoComoPerdido, setPublicadoComoPerdido] = useState(false);

  // ✅ Al montar la pantalla, consultamos Supabase para ver si ya está publicada como perdida
  useEffect(() => {
    const checkIfReportedAsLost = async () => {
      try {
        const { data: session } = await supabase.auth.getUser();
        const userId = session?.user?.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from("pets")
          .select("id, status")
          .eq("owner_id", userId)
          .eq("name", pet.nombre)
          .eq("species", pet.especie)
          .eq("status", "perdida")
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error chequeando estado perdida:", error.message);
          return;
        }

        if (data) {
          setPublicadoComoPerdido(true);
        } else {
          setPublicadoComoPerdido(false);
        }
      } catch (err) {
        console.error("Error interno chequeando perdida:", err.message);
      }
    };

    checkIfReportedAsLost();
  }, [pet.nombre, pet.especie]);

  /* ---------- CONFIRMACIONES ---------- */

  const confirmReportLost = () => {
    Alert.alert(
      "⚠️ Reportar Mascota",
      `¿Querés reportar a "${pet.nombre}" como mascota perdida?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", style: "destructive", onPress: handleReportLost },
      ]
    );
  };

  const handleReportLost = async () => {
    try {
      //await reportAsLost(...pet, {latitud:selectedLatitude , longitud:selectedLongitude });
      if (!selectedLatitude || !selectedLongitude) {
        Alert.alert("Ubicación requerida", "Debes seleccionar una ubicación en el mapa.");
        return;
      }
      const petCompleto = {
        ...pet,
        latitud: selectedLatitude,
        longitud: selectedLongitude,
      };
      await reportAsLost(petCompleto);
      setPublicadoComoPerdido(true); // ✅ ahora queda guardado en estado
      Alert.alert("✅ Reportado", "La mascota fue publicada como perdida.");
    } catch {
      Alert.alert("Error", "No se pudo reportar la mascota.");
    }
    //hasta aca estaria
    cancelSelectionModal();
  };

  const confirmMarkAsFound = () => {
    Alert.alert(
      "✅ Mascota encontrada",
      `¿"${pet.nombre}" fue encontrada?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", onPress: handleMarkAsFound },
      ]
    );
  };

  const handleMarkAsFound = async () => {
    try {
      await markAsFound(pet); // 👈 le pasamos la mascota privada
      setPublicadoComoPerdido(false); // ✅ desaparece el botón verde
      Alert.alert("🎉 Actualizada", "La publicación fue marcada como encontrada.");
    } catch {
      Alert.alert("Error", "No se pudo actualizar.");
    }
  };

  //subo y cierro modal
  const confirmSelectionModal = () => {
    //onLocationSelected(markerPosition.latitude, markerPosition.longitude);
    confirmReportLost();
  };

  //limpio states y cierro modal
  const cancelSelectionModal = () => {
    setSelectedLatitude(null);
    setSelectedLongitude(null);
    setModalMapa(false);
  };
  /* ================= RENDER ================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.botones.textoPrimario} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Mascota</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FOTO */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => pet.foto_url && setShowViewer(true)}
          activeOpacity={0.8}
        >
          {pet.foto_url ? (
            <Image source={{ uri: pet.foto_url }} style={styles.image} />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="paw-outline" size={32} color={colors.secundarios.gris} />
              <Text style={{ color: colors.secundarios.gris }}>Sin foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* NOMBRE */}
        <Text style={styles.name}>{pet.nombre}</Text>

        {/* TARJETA INFO */}
        <View style={styles.card}>
          <Text style={styles.label}>Especie</Text>
          <Text style={styles.value}>{pet.especie}</Text>

          <Text style={styles.label}>Raza</Text>
          <Text style={styles.value}>{pet.raza || "—"}</Text>

          <Text style={styles.label}>Edad</Text>
          <Text style={styles.value}>{formatEdad(pet)}</Text>

          <Text style={styles.label}>Pelaje</Text>
          <Text style={styles.value}>{pet.pelaje || "—"}</Text>

          <Text style={styles.label}>Sexo</Text>
          <Text style={styles.value}>{pet.sexo || "—"}</Text>

          <Text style={styles.label}>Estado reproductivo</Text>
          <Text style={styles.value}>{formatEstadoReproductivo(pet)}</Text>
        </View>

        {/* ===== ACCIONES MINI (UI LIMPIA) ===== */}
        <View style={styles.bottomActions}>
          {/* 🔴 SOS SIEMPRE */}
          <TouchableOpacity style={styles.sosMiniButton} onPress={ () => setModalMapa(true)}>
            <Text style={styles.sosMiniText}>SOS</Text>
          </TouchableOpacity>

          {/* ✅ BOTÓN VERDE SOLO SI HAY PUBLICACIÓN PERDIDA EN BD */}
          {publicadoComoPerdido && (
            <TouchableOpacity style={styles.foundMiniButton} onPress={confirmMarkAsFound}>
              <Text style={styles.foundMiniText}>✅ Encontrada</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* BOTÓN EDITAR */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate("EditarMascota", { pet })}
      >
        <MaterialIcons name="edit" size={26} color={colors.botones.textoPrimario} />
      </TouchableOpacity>

      {/* ZOOM */}
      {showViewer && pet.foto_url && (
        <FullScreenImageViewer
          imageUrl={pet.foto_url}
          onClose={() => setShowViewer(false)}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={!!modalMapa}
        onRequestClose={() => setModalMapa(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Necesitamos que ingrese la ultima ubicacion conocida de su mascota</Text>
            
            {/* mapas vista previa */}
            <View style={styles.mapSection}>
              {/* mapa alejado — si no hay ubicación seleccionada */}
              {selectedLatitude === null && selectedLongitude === null ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowMap(true)}
                  style={{ height: 200, borderRadius: 10, overflow: "hidden" }}
                >
                  <PetMap latitud={-38.4161} longitud={-63.6167} zoom={4} hideMarker />
                </TouchableOpacity>
              ) : (
                /* mapa con marcador — ubicación elegida */
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowMap(true)}
                  style={{ height: 200, borderRadius: 12, overflow: "hidden" }}
                >
                  <PetMap latitud={selectedLatitude} longitud={selectedLongitude} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.panelModal}>
              {/*aca prosigo con la subida*/}
              <TouchableOpacity onPress={confirmSelectionModal} 
              disabled={!selectedLatitude && !selectedLongitude} 
              style={[styles.modalBtn, styles.acceptBtn, (!selectedLatitude || !selectedLongitude) && { opacity: 0.4 }]}
              
              >
                <Text style={styles.btnText}>Definir ubicación</Text>
              </TouchableOpacity>
              
              {/*aca limpio los states*/}
              <TouchableOpacity onPress={cancelSelectionModal} style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.btnText}>Cerrar</Text>
              </TouchableOpacity>
              
            </View>

          </View>
        </View>
      </Modal>
      
      {/* Mapa para seleccionar ubicacion*/}
      <Modal visible={showMap} animationType="slide">
        <LocationSelectMap
          initialLat={selectedLatitude || -34.6037}
          initialLng={selectedLongitude || -58.3816}
          onLocationSelected={(lat, lng) => {
            setSelectedLatitude(lat);
            setSelectedLongitude(lng);
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      </Modal>
    </View>
  );
};

export default VerMascotaScreen;

/* ================= ESTILOS ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fondo.app },

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

  scrollContent: { paddingBottom: 120, paddingHorizontal: 16 },

  imageContainer: { alignSelf: 'center', marginTop: 10 },

  image: { width: 160, height: 160, borderRadius: 80 },

  noImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
    color: colors.texto.primario,
  },

  card: {
    marginTop: 20,
    backgroundColor: colors.fondo.componentes,
    borderRadius: 16,
    padding: 16,
  },

  label: { fontSize: 13, color: colors.texto.secundario, marginTop: 8 },

  value: {
    fontSize: 15,
    color: colors.texto.primario,
    fontWeight: "600",
  },

  bottomActions: {
    marginTop: 30,
    alignItems: "center",
  },

  sosMiniButton: {
    backgroundColor: colors.estado.perdido.base,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  sosMiniText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  foundMiniButton: {
    backgroundColor: colors.estado.encontrado.base,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginTop: 14,
  },

  foundMiniText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  editButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarios.indigo,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.fondo.componentes,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.texto.primario,
    textAlign: "center",
  },
  panelModal: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  acceptBtn: {
    backgroundColor: "#4CAF50",
  }, 
  cancelBtn: {
    backgroundColor: "#d9534f",
  }, 
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  }
});
