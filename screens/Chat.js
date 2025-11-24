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
import { Ionicons } from "@expo/vector-icons";
import colors from "../data/colors.json";
import { supabase } from "../supabase/client/supabaseClient"; // Cliente Supabase

export default function Chat({ navigation, route }) {
  const insets = useSafeAreaInsets();

  //parametro (dueño y mascota)
  const { ownerId, petName, avatarUrl } = route.params || {};

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

        //Buscar si ya existe una conversación entre YO y el DUEÑO
        //La query busca: (user_1 = YO y user_2 = DUEÑO) O (user_1 = DUEÑO y user_2 = YO)
        const { data: existingConv, error } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(user_1.eq.${user.id},user_2.eq.${ownerId}),and(user_1.eq.${ownerId},user_2.eq.${user.id})`)
          .maybeSingle(); // el maybeSingle para que no de error si no existe

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

    initChat();

    //limpieza al salir de la pantalla
    return () => {
      supabase.removeAllChannels();
    };
  }, [ownerId]);

  //cargar los mensajes viejos
  const loadMessages = async (convId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false });     // Orden DESC para la lista

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
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
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color={colors.botones.textoPrimario} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* MODAL ZOOM */}
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primarios.indigo} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* INPUT BAR */}
        <View
          style={[
            styles.inputContainer,
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
    </View>
  );
}

//    ESTILOS
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarios.indigo,
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
    backgroundColor: colors.fondo.componentes,
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
});