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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../data/colors.json";
import { supabase } from "../supabase/client/supabaseClient";

// Servicios Supabase
import { getUserPets } from "../supabase/services/userPetsService";

// Componentes
import PetCard from "./components/PetCard";

// React Navigation
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const MisMascotasScreen = ({ navigation: navProp }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 68 + Math.max(insets.bottom, 8);
  
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
      onPress={() => navProp?.navigate("VerMascota", { pet: item })}
      onEdit={() => navProp?.navigate("EditarMascota", { pet: item })}
      onAddReminder={() =>
        navProp?.navigate("ReminderModal", { petId: item.id })
      }
      onViewHistory={() =>
        navProp?.navigate("VerHistorial", { petId: item.id })
      }
    />
  );

  // Navegar a las pantallas del TabNavigator
  const navigateToTab = (screenName) => {
    navigation.navigate('Dashboard', { screen: screenName });
  };

  return (
    <View style={styles.container}>
      {/* Barra Superior */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Mis Mascotas</Text>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primarios.indigo} />
          <Text style={styles.loadingText}>Cargando mascotas...</Text>
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navProp?.navigate("CrearMascota")}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Añadir Mascota</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + 100 }
          ]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navProp?.navigate("CrearMascota")}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+ Añadir Mascota</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { height: tabBarHeight, paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateToTab("Inicio")}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={26} color={colors.texto.secundario} />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateToTab("Buscar")}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={26} color={colors.texto.secundario} />
          <Text style={styles.navText}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateToTab("Reportar")}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={26} color={colors.texto.secundario} />
          <Text style={styles.navText}>Reportar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateToTab("Perfil")}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={26} color={colors.texto.secundario} />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MisMascotasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.botones.textoPrimario,
    letterSpacing: -0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.texto.secundario,
    fontWeight: "400",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: "center",
    color: colors.texto.secundario,
    fontSize: 16,
    marginBottom: 24,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addButton: {
    backgroundColor: colors.botones.primario,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: colors.botones.textoPrimario,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: colors.fondo.componentes,
    borderTopWidth: 0.5,
    borderTopColor: colors.bordes.primario,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    color: colors.texto.secundario,
  },
});

