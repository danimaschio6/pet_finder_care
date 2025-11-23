import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../../data/colors.json";
import { Ionicons } from "@expo/vector-icons";

const PetCard = ({
  pet,
  onPress,          // 👈 Navegar a VerMascota
  onEdit,           // 👈 Botón lápiz
  onAddReminder,    // 👈 Recordatorios
  onViewHistory,    // 👈 Historial
}) => {

  const [expanded, setExpanded] = useState(false);

  // -------------------------------
  // 🔡 Pluralización automática
  // -------------------------------
  const formatEdad = () => {
    if (!pet.edad_numero || !pet.edad_unidad) return "Edad no registrada";

    const unidad = pet.edad_unidad === "mes" ? "mes" : "año";
    const plural = pet.edad_numero > 1 ? "es" : "";

    return `${pet.edad_numero} ${unidad}${plural}`;
  };

  // -------------------------------
  // 🟣 Ajuste castrado/castrada
  // -------------------------------
  const formatEstadoReproductivo = () => {
    if (!pet.estado_reproductivo) return "No especificado";

    if (pet.sexo === "hembra") {
      if (pet.estado_reproductivo === "castrado") return "castrada";
      if (pet.estado_reproductivo === "entero") return "entera";
    }
    return pet.estado_reproductivo;
  };

  // -------------------------------
  // 📸 Foto o inicial del nombre
  // -------------------------------
  const renderPhoto = () => {
    if (pet.foto_url) {
      return <Image source={{ uri: pet.foto_url }} style={styles.petPhoto} />;
    }

    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {pet.nombre?.charAt(0)?.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* FOTO + INFO PRINCIPAL + LAPIZ EDITAR */}
      <View style={styles.row}>
        {renderPhoto()}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.petName}>{pet.nombre}</Text>

          <Text style={styles.petDetails}>
            {pet.especie} · {pet.raza || "Sin raza"} · {formatEdad()}
          </Text>
        </View>

        {/* BOTÓN EDITAR */}
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="pencil" size={22} color={colors.primarios.indigo} />
        </TouchableOpacity>
      </View>

      {/* BOTÓN EXPANDIR */}
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.moreButtonText}>
          {expanded ? "Ver menos" : "Ver más"}
        </Text>
      </TouchableOpacity>

      {/* INFORMACIÓN EXTRA EXPANDIBLE */}
      {expanded && (
        <View style={styles.extraInfo}>
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

      {/* ACCIONES SECUNDARIAS */}
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  petPhoto: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },

  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#555",
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

  moreButton: {
    marginTop: 8,
  },

  moreButtonText: {
    color: colors.primarios.indigo,
    fontWeight: "600",
  },

  extraInfo: {
    marginTop: 10,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    padding: 10,
  },

  extraItem: {
    fontSize: 14,
    color: colors.texto.primario,
    marginBottom: 4,
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
  },

  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarios.indigoClaro,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  smallButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },
});
