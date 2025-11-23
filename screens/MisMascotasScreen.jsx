// screens/MisMascotasScreen.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import colors from "../data/colors.json";
import { supabase } from "../supabase/client/supabaseClient";

// Servicios Supabase
import { getUserPets } from "../supabase/services/userPetsService";

// Componentes
import PetCard from "./components/PetCard";

// React Navigation
import { useFocusEffect } from "@react-navigation/native";

const MisMascotasScreen = ({ navigation }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // ---------------------------------------------------------
  // 🔐 Obtener usuario logueado
  // ---------------------------------------------------------
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.log("Error getting user:", error);
      return;
    }

    setUserId(data.user.id);
  };

  // ---------------------------------------------------------
  // 🐶 Cargar mascotas desde Supabase (SERVICE)
  // ---------------------------------------------------------
  const loadPets = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const data = await getUserPets(userId); // ⭐ ahora usa el service
      setPets(data || []);
    } catch (err) {
      console.log("Error loading pets:", err);
    }

    setLoading(false);
  };

  // ---------------------------------------------------------
  // 🔄 Inicializar (traer usuario solo una vez)
  // ---------------------------------------------------------
  useEffect(() => {
    fetchUser();
  }, []);

  // ---------------------------------------------------------
  // 🔁 Cuando userId cambia → traigo mascotas
  // ---------------------------------------------------------
  useEffect(() => {
    if (userId) loadPets();
  }, [userId]);

  // ---------------------------------------------------------
  // 🔄 Refrescar cada vez que la pantalla vuelve a enfocarse
  // ---------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      if (userId) loadPets();
    }, [userId])
  );

  // ---------------------------------------------------------
  // 📌 Render de cada mascota
  // ---------------------------------------------------------
  const renderPet = ({ item }) => (
    <PetCard
      pet={item}
      onPress={() => navigation.navigate("VerMascota", { pet: item })}
      onEdit={() => navigation.navigate("EditarMascota", { pet: item })}
      onAddReminder={() =>
        navigation.navigate("ReminderModal", { petId: item.id })
      }
      onViewHistory={() =>
        navigation.navigate("VerHistorial", { petId: item.id })
      }
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Mascotas</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primarios.indigo} />
      ) : pets.length === 0 ? (
        <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* --------------------------------------------------
          ➕ Botón Añadir Mascota
      -------------------------------------------------- */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CrearMascota")}
      >
        <Text style={styles.addButtonText}>+ Añadir Mascota</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MisMascotasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.texto.primario,
  },
  emptyText: {
    textAlign: "center",
    color: colors.texto.secundario,
    fontSize: 16,
    marginTop: 40,
  },
  addButton: {
    backgroundColor: colors.botones.primario,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    alignSelf: "center",
  },
  addButtonText: {
    color: colors.botones.textoPrimario,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

