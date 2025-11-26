// screens/RecordatoriosScreen.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import colors from "../data/colors.json";
import { getReminders, deleteReminder } from "../supabase/services/reminderStorage";

const RecordatoriosScreen = ({ route, navigation }) => {
  const { petId, petName } = route.params;

  const [reminders, setReminders] = useState([]);

  // 🔄 Cargar recordatorios
  const loadReminders = async () => {
    try {
      const data = await getReminders(petId);
      setReminders(data);
    } catch (err) {
      console.log("Error loading reminders:", err);
    }
  };

  // Ejecutar cada vez que la pantalla toma foco
  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  // ❌ Eliminar recordatorio
  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Deseas eliminar este recordatorio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const updated = await deleteReminder(petId, id);
          setReminders(updated);
        },
      },
    ]);
  };

  // 🎨 Render Item
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>{item.text}</Text>
        <Text style={styles.date}>
          {new Date(item.datetime).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <MaterialIcons
          name="delete"
          size={24}
          color={colors.estado.perdido.base}
        />
      </TouchableOpacity>
    </View>
  );

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

        <Text style={styles.headerTitle}>Recordatorios de {petName}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* LISTA */}
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay recordatorios aún.</Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("ReminderModal", { petId, petName })}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default RecordatoriosScreen;

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
  },
  headerTitle: {
    color: colors.botones.textoPrimario,
    fontSize: 18,
    fontWeight: "bold",
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    color: colors.texto.secundario,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.fondo.componentes,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.texto.primario,
  },
  date: {
    fontSize: 12,
    color: colors.texto.secundario,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarios.indigo,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
