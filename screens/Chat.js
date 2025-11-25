import React, { useState, useEffect, useRef } from "react";
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
  ActivityIndicator,
  Alert
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../data/colors.json";
import { supabase } from "../supabase/client/supabaseClient"; // Cliente Supabase

export default function Chat({ navigation: navProp, route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 68 + Math.max(insets.bottom, 8);

  const avatarUri =
    route?.params?.avatarUrl ||
    "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  const avatarUri = avatarUrl || "https://cdn-icons-png.flaticon.com/512/616/616408.png";
  const chatTitle = petName ? `Consulta sobre ${petName}` : "Chat Pet Finder";

  // estados
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // referencias para no perder valores entre renderizados
  const currentUserRef = useRef(null);
  const conversationIdRef = useRef(null);

  //INICIAR CHAT (buscar usuario y la conversacion)
  useEffect(() => {
    const initChat = async () => {
      try {
        // Si no tiene ownerId ,para todo para evitar error en la BD
        if (!ownerId) {
          console.error("Error crítico: Intentando abrir chat sin ID de dueño (ownerId es null/undefined)");
          Alert.alert("Error", "No se pudo identificar al dueño de esta mascota.");
          setLoading(false);
          return;
        }
        //Obtener mi usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Si no hay usuario logueado, no carga nada
        currentUserRef.current = user.id;

  // Navegar a las pantallas del TabNavigator
  const navigateToTab = (screenName) => {
    navigation.navigate('Dashboard', { screen: screenName });
  };

  const sendMessage = () => {
    if (input.trim().length === 0) return;

        if (existingConv) {
          // Si ya hablaron antes, cargamos el ID y los mensajes
          conversationIdRef.current = existingConv.id;
          await loadMessages(existingConv.id);
          subscribeToMessages(existingConv.id);
        } else {
          // Si es chat nuevo, dejamos de cargar (se creara al enviar el primer mensaje)
          setLoading(false);
        }
      } catch (err) {
        console.error("Error iniciando chat:", err);
        setLoading(false);
      }
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  //SUSCRIPCIÓN REALTIME
  const subscribeToMessages = (convId) => {
    supabase
      .channel(`chat:${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          // Si el mensaje nuevo NO es mío, lo agrego (los míos ya los agrego localmente)
          if (payload.new.sender_id !== currentUserRef.current) {
            setMessages((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();
  };

  //ENVIAR MENSAJE
  const sendMessage = async () => {
    if (input.trim().length === 0) return;

    // Seguridad extra. Si no hay ownerId, alertamos.
    if (!ownerId) {
      Alert.alert("Error", "No se puede enviar el mensaje porque falta el destinatario.");
      return;
    }

    const textToSend = input;
    setInput(""); //limpiar input visualmente rapido

    try {
      let convId = conversationIdRef.current;

      //si no existe conversacion, la creamos(primera vez)
      if (!convId) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert([
            { user_1: currentUserRef.current, user_2: ownerId }
          ])
          .select()
          .single();

        if (createError) throw createError;

        convId = newConv.id;
        conversationIdRef.current = convId;
        subscribeToMessages(convId); //nos suscribimos a la nueva sala
      }

      //insertar mensaje en la base de datos
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: convId,
            sender_id: currentUserRef.current,
            content: textToSend,
          }
        ])
        .select()
        .single();

      if (msgError) throw msgError;

      // agregamos a la lista local
      setMessages((prev) => [msgData, ...prev]);

    } catch (err) {
      console.error("Error enviando mensaje:", err);
      Alert.alert("Error", "Hubo un problema al enviar el mensaje.");
    }
  };

  // renderizado de cada burbuja
  const renderItem = ({ item }) => {
    // Verificamos si el mensaje es mío comparando IDs
    const isMyMessage = item.sender_id === currentUserRef.current;

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.userMessage : styles.systemMessage,
        ]}
      >
        <Text style={isMyMessage ? styles.userText : styles.systemText}>
          {item.content || item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.primarios.indigo} barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 16 }]}>
        <TouchableOpacity onPress={() => navProp?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.botones.textoPrimario} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>

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
            // Deshabilitamos el input si no hay ownerId para evitar intentos de envío
            editable={!!ownerId}
          />

          <TouchableOpacity
            style={[styles.sendButton, !ownerId && { backgroundColor: '#ccc' }]}
            onPress={sendMessage}
            disabled={!ownerId}
          >
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
    borderWidth: 1,
    borderColor: "white",
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
