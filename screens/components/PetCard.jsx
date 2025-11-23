import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../data/colors.json";

// Animación del acordeón (Android fix)
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PetCard = ({
  pet,
  onPress,         // Navegar a VerMascota
  onEdit,          // Editar
  onAddReminder,   // Recordatorios
  onViewHistory,   // Historial
}) => {
  const [expanded, setExpanded] = useState(false);

  // ----------------------------------------------------
  // 📌 EDAD → plural automático (1 mes / 2 meses / etc.)
  // ----------------------------------------------------
  const formatEdad = () => {
    if (!pet.edad_numero || !pet.edad_unidad) return "Edad no registrada";

    const unidad = pet.edad_unidad; // mes / año
    const plural = pet.edad_numero > 1 ? "s" : "";

    return `${pet.edad_numero} ${unidad}${plural}`;
  };

  // ----------------------------------------------------
  // 📌 Estado reproductivo → castrada / entera si es hembra
  // ----------------------------------------------------
  const formatEstadoReproductivo = () => {
    if (!pet.estado_reproductivo) return "No especificado";

    if (pet.sexo === "hembra") {
      if (pet.estado_reproductivo === "castrado") return "castrada";
      if (pet.estado_reproductivo === "entero") return "entera";
    }
    return pet.estado_reproductivo;
  };

  // ----------------------------------------------------
  // 📌 Foto o inicial del nombre
  // ----------------------------------------------------
  const renderPhoto = () => {
    if (pet.foto_url) {
      return <Image source={{ uri: pet.foto_url }} style={styles.petPhoto} />;
    }

    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{pet.nombre?.charAt(0)?.toUpperCase()}</Text>
      </View>
    );
  };

  // ----------------------------------------------------
  // 📌 Toggle Expand — Animación
  // ----------------------------------------------------
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* ----------------- ROW PRINCIPAL ----------------- */}
      <View style={styles.row}>
        {renderPhoto()}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.petName}>{pet.nombre}</Text>

          <Text style={styles.petDetails}>
            {pet.especie} · {pet.raza || "Sin raza"} · {formatEdad()}
          </Text>

          {/* CHIPS: Sexo + Estado reproductivo */}
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <View style={styles.chipSmall}>
              <Text style={styles.chipText}>{pet.sexo || "?"}</Text>
            </View>

            <View style={[styles.chipSmall, { marginLeft: 6 }]}>
              <Text style={styles.chipText}>{formatEstadoReproductivo()}</Text>
            </View>
          </View>
        </View>

        {/* ✏ EDITAR */}
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="create-outline" size={22} color={colors.primarios.indigo} />
        </TouchableOpacity>
      </View>

      {/* ----------------- BOTÓN EXPANDIR ----------------- */}
      <TouchableOpacity style={styles.moreButton} onPress={toggleExpand}>
        <Text style={styles.moreButtonText}>
          {expanded ? "Ocultar detalles" : "Ver más detalles"}
        </Text>
      </TouchableOpacity>

      {/* ----------------- CONTENIDO EXPANDIBLE ----------------- */}
      {expanded && (
        <View style={styles.expandBox}>
          <Text style={styles.extraItem}>
            Pelaje: {pet.pelaje || "No registrado"}
          </Text>

          <Text style={styles.extraItem}>
            Sexo: {pet.sexo || "No registrado"}
          </Text>

          <Text style={styles.extraItem}>
            Estado reproductivo: {formatEstadoReproductivo()}
          </Text>
        </View>
      )}

      {/* ----------------- ACCIONES SECUNDARIAS ----------------- */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.smallButton} onPress={onAddReminder}>
          <Ionicons name="notifications" size={18} color="#fff" />
          <Text style={styles.smallButtonText}>Recordatorio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={onViewHistory}>
          <Ionicons name="medkit" size={18} color="#fff" />
          <Text style={styles.smallButtonText}>Historial</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default PetCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.fondo.componentes,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  petPhoto: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },

  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#444",
  },

  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.texto.primario,
  },

  petDetails: {
    fontSize: 14,
    color: colors.texto.secundario,
    marginTop: 4,
  },

  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.primarios.indigoClaro,
    borderRadius: 50,
  },

  chipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  moreButton: {
    marginTop: 10,
  },

  moreButtonText: {
    color: colors.primarios.indigo,
    fontWeight: "600",
    fontSize: 14,
  },

  expandBox: {
    marginTop: 12,
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 12,
  },

  extraItem: {
    fontSize: 14,
    color: colors.texto.primario,
    marginBottom: 4,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarios.indigo,
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  smallButtonText: {
    color: "white",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },
});
