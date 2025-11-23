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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../data/colors.json";

export default function Chat({ navigation: navProp, route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 68 + Math.max(insets.bottom, 8);

  const avatarUri =
    route?.params?.avatarUrl ||
    "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  const [modalVisible, setModalVisible] = useState(false);

  const [messages, setMessages] = useState([
    { id: "1", text: "¡Bienvenido a Pet Finder 🐾!", from: "system" },
  ]);

  const [input, setInput] = useState("");

  // Navegar a las pantallas del TabNavigator
  const navigateToTab = (screenName) => {
    navigation.navigate('Dashboard', { screen: screenName });
  };

  const sendMessage = () => {
    if (input.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      from: "user",
    };

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
      <StatusBar backgroundColor={colors.primarios.indigo} barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 16 }]}>
        <TouchableOpacity onPress={() => navProp?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.botones.textoPrimario} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pet Finder 🐾</Text>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* MODAL ZOOM */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: avatarUri }} style={styles.modalImage} />
        </Pressable>
      </Modal>

      {/* CHAT */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={[
            styles.flatListContent,
            { paddingBottom: tabBarHeight + 80 }
          ]}
          showsVerticalScrollIndicator={false}
        />

        {/* INPUT */}
        <View
          style={[
            styles.inputContainer,
            { 
              paddingBottom: Math.max(insets.bottom, 12),
              marginBottom: tabBarHeight 
            },
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
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.fondo.componentes,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarios.indigo,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 10,
  },

  backButton: {
    padding: 8,
    marginRight: 10,
  },

  headerTitle: {
    flex: 1,
    color: colors.botones.textoPrimario,
    fontWeight: "bold",
    fontSize: 20,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fondo.componentes,
  },

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
    backgroundColor: colors.fondo.app,
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
    backgroundColor: colors.primarios.indigo,
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },

  systemMessage: {
    backgroundColor: colors.fondo.app,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
  },

  userText: {
    fontSize: 16,
    color: colors.botones.textoPrimario,
  },

  systemText: {
    fontSize: 16,
    color: colors.texto.primario,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.fondo.componentes,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: colors.bordes.primario,
  },

  input: {
    flex: 1,
    height: 50,
    borderColor: colors.bordes.primario,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
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
