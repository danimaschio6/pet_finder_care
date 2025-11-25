// screens/VerMascotaScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import colors from '../data/colors.json';
import FullScreenImageViewer from './components/FullScreenImageViewer';

// 📌 Formateo reproducido a nivel PRO
const formatEdad = (pet) => {
  const n = pet.edad_numero;
  const u = pet.edad_unidad;

  if (!n || !u) return "—";

  if (u === "mes") {
    return n === 1 ? "1 mes" : `${n} meses`;
  }

  if (u === "año") {
    return n === 1 ? "1 año" : `${n} años`;
  }

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

const VerMascotaScreen = ({ route, navigation }) => {
  const { pet } = route.params;
  const [showViewer, setShowViewer] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.botones.textoPrimario} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalle de Mascota</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FOTO → ABRE ZOOM */}
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

        {/* Nombre */}
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
      </ScrollView>

      {/* Botón flotante EDITAR */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate("EditarMascota", { pet })}
      >
        <MaterialIcons name="edit" size={26} color={colors.botones.textoPrimario} />
      </TouchableOpacity>

      {/* ZOOM FULLSCREEN */}
      {showViewer && pet.foto_url && (
        <FullScreenImageViewer
          imageUrl={pet.foto_url}
          onClose={() => setShowViewer(false)}
        />
      )}
    </View>
  );
};

export default VerMascotaScreen;

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
    paddingBottom: 90,
    paddingHorizontal: 16,
  },
  imageContainer: {
    alignSelf: 'center',
    marginTop: 10,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
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
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: colors.texto.secundario,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: colors.texto.primario,
    fontWeight: "600",
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
});