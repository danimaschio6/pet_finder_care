import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  StatusBar,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
// Importamos tus colores reales
import colors from "../data/colors.json";

export default function Chat({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // Avatar: Si viene por parámetro úsalo, si no, usa uno genérico
  const avatarUri =
    route?.params?.avatarUrl ||
    "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  const [modalVisible, setModalVisible] = useState(false);

  const [messages, setMessages] = useState([
    { id: "1", text: "¡Bienvenido a Pet Finder 🐾!", from: "system" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      from: "user",
    };

    // Agregamos al final del array (la lista invertida se encarga del orden visual)
    setMessages([...messages, newMessage]);
    setInput("");
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.from === "user" ? styles.userMessage : styles.systemMessage,
      ]}
    >
      <Text style={item.from === "user" ? styles.userText : styles.systemText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Barra de estado con tu color primario */}
      <StatusBar backgroundColor={colors.primarios.indigo} barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color={colors.botones.textoPrimario} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pet Finder 🐾</Text>

        {/* Avatar Clickeable */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* MODAL DE ZOOM */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <Image source={{ uri: avatarUri }} style={styles.modalImage} />
        </Pressable>
      </Modal>

      {/* CUERPO DEL CHAT */}
      <KeyboardAvoidingView
        style={styles.container}
        // Android maneja el teclado nativamente mejor con undefined si tienes adjustResize en app.json
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={[...messages].reverse()} // Invertimos los datos para la lista
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted // La lista crece desde abajo
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />

        {/* INPUT BAR */}
        <View
          style={[
            styles.inputContainer,
            // Padding dinámico para iPhones sin botón home o Androids con gestos
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 20 },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.texto.secundario}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color={colors.botones.textoPrimario} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// 🎨 ESTILOS BASADOS EN TU colors.json
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // Usamos el fondo de componentes (blanco) para el chat para que sea limpio
    backgroundColor: colors.fondo.componentes,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarios.indigo, // Tu color principal (#6366f1)
    paddingVertical: 15,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    zIndex: 10,
  },

  backButton: {
    padding: 8,
    marginRight: 10,
  },

  headerTitle: {
    flex: 1,
    color: colors.botones.textoPrimario, // Blanco
    fontWeight: "bold",
    fontSize: 20,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fondo.componentes,
  },

  /* MODAL */
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "85%",
    height: "45%",
    borderRadius: 20,
    resizeMode: "cover",
  },

  container: {
    flex: 1,
  },

  flatListContent: {
    paddingHorizontal: 12,
    paddingVertical: 20,
  },

  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
    elevation: 1,
  },

  userMessage: {
    backgroundColor: colors.primarios.indigo, // Mensaje enviado (Indigo)
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },

  systemMessage: {
    backgroundColor: colors.fondo.app, // Mensaje recibido (Indigo muy claro #e0e7ff)
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
  },

  userText: {
    fontSize: 16,
    color: colors.botones.textoPrimario, // Blanco
  },
  systemText: {
    fontSize: 16,
    color: colors.texto.primario, // Gris oscuro (#374151)
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.fondo.componentes,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: colors.bordes.primario, // (#d1d5db)
  },

  input: {
    flex: 1,
    height: 50,
    borderColor: colors.bordes.primario,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB", // Un gris muy sutil para el input (hardcoded standard)
    fontSize: 16,
    marginRight: 10,
    color: colors.texto.primario,
  },

  sendButton: {
    backgroundColor: colors.primarios.indigo,
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});