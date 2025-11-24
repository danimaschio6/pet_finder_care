// screens/ReminderModal.jsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";

import colors from "../data/colors.json";
import { addReminder } from "../supabase/services/reminderStorage";

const ReminderModal = ({ route, navigation }) => {
  const { petId, petName } = route.params;

  const [visible, setVisible] = useState(true);
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // 🔔 Programar notificación local
  const scheduleNotif = async (when) => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Activa las notificaciones.");
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Recordatorio de ${petName}`,
        body: text,
        sound: true,
      },
      trigger: when,
    });
  };

  // 💾 Guardar recordatorio
  const save = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Escribe un recordatorio.");
      return;
    }

    const notifId = await scheduleNotif(date);
    if (!notifId) return;

    const reminder = {
      id: uuid.v4(),
      text,
      datetime: date,
      notifId,
    };

    await addReminder(petId, reminder);
    setVisible(false);
    navigation.goBack();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.bg}>
        <View style={styles.modal}>
          <Text style={styles.title}>Nuevo recordatorio</Text>

          {/* TEXTO */}
          <TextInput
            style={styles.input}
            placeholder="Ej: Antipulgas mañana..."
            value={text}
            onChangeText={setText}
          />

          {/* FECHA */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="calendar" size={20} color={colors.primarios.indigo} />
            <Text style={styles.dateButtonText}>{date.toLocaleString()}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, d) => {
                if (Platform.OS !== "ios") setShowPicker(false);
                if (d) setDate(d);
              }}
            />
          )}

          {/* BOTÓN GUARDAR */}
          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>

          {/* CANCELAR */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setVisible(false);
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReminderModal;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: colors.fondo.componentes,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.texto.primario,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#F7F7F7",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.botones.secundario,
    borderRadius: 10,
    padding: 12,
  },
  dateButtonText: {
    marginLeft: 10,
    color: colors.texto.primario,
    fontWeight: "500",
  },
  saveBtn: {
    backgroundColor: colors.primarios.indigo,
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelBtn: {
    marginTop: 10,
    padding: 12,
  },
  cancelText: {
    color: colors.texto.secundario,
    textAlign: "center",
  },
});
