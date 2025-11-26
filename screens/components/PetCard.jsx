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

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PetCard = ({
  pet,
  onPress,
  onEdit,
  onAddReminder,
  onViewHistory,
}) => {

  const [expanded, setExpanded] = useState(false);

  const formatEdad = () => {
  const n = pet.edad_numero;
  const u = pet.edad_unidad;

  if (!n || !u) return "Edad no registrada";

  if (u === "mes") {
    return n === 1 ? "1 mes" : `${n} meses`;
  }

  if (u === "año") {
    return n === 1 ? "1 año" : `${n} años`;
  }

  return "Edad no registrada";
};

  const formatEstado = () => {
    if (!pet.estado_reproductivo) return "No especificado";
    if (pet.sexo === "hembra") {
      if (pet.estado_reproductivo === "castrado") return "castrada";
      if (pet.estado_reproductivo === "entero") return "entera";
    }
    return pet.estado_reproductivo;
  };

  // 🔥 FOTO DE LA MASCOTA — ARREGLADO Y OPTIMIZADO
  const renderPhoto = () => {
    if (pet.foto_url && typeof pet.foto_url === "string") {
      return (
        <Image
          source={{ uri: pet.foto_url }}
          style={styles.petPhoto}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {pet.nombre?.charAt(0)?.toUpperCase() || "?"}
        </Text>
      </View>
    );
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.row}>
        {renderPhoto()}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.petName}>{pet.nombre}</Text>

          <Text style={styles.petDetails}>
            {pet.especie} · {pet.raza || "Sin raza"} · {formatEdad()}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <View style={styles.chipSmall}>
              <Text style={styles.chipText}>{pet.sexo}</Text>
            </View>

            <View style={[styles.chipSmall, { marginLeft: 6 }]}>
              <Text style={styles.chipText}>{formatEstado()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="create-outline" size={22} color={colors.primarios.indigo} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.moreButton} onPress={toggleExpand}>
        <Text style={styles.moreButtonText}>
          {expanded ? "Ocultar detalles" : "Ver más detalles"}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandBox}>
          <Text style={styles.extraItem}>Pelaje: {pet.pelaje || "No registrado"}</Text>  
       </View>
      )}

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
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  // 🔥 Más grande, redondo y bonito
  petPhoto: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#ddd",
  },

  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 30,
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
    color: "#fff",
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
    marginBottom: 4,
    color: colors.texto.primario,
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
