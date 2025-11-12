//Importa React hook (useState)
import React, { useState } from "react";
//Importa los componentes nativos
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
//margenes seguros
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Chat() {
  const insets = useSafeAreaInsets(); // Detecta márgenes seguros
  // Estado inicial
  const [messages, setMessages] = useState([
    { id: "1", text: "¡Bienvenido a Pet Finder 🐾!", from: "system" },
  ]);
  const [input, setInput] = useState(""); // Estado para almacenar el texto
  // Función al presionar "Enviar"
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

  return (
    // Contenedor principal que respeta las zonas seguras del dispositivo
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}  
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 70 : 80} 
      >  {/* FlatList muestra la lista de mensajes */}
        <FlatList   
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.from === "user" ? styles.userMessage : styles.systemMessage,  // Aplica estilo segun quie lo envia
              ]}
            >
              <Text>{item.text}</Text>
            </View>
          )}
          
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 100 }}  
        />
          {/* Barra de escritura */}
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },  
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={input}
            onChangeText={setInput}  
          />
          <TouchableOpacity style={styles.button} onPress={sendMessage}>
            <Text style={{ color: "white" }}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
   // Estilos visuales del chat
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // Fondo blanco general
  },
  container: {
    flex: 1,     // Ocupa toda la pantalla
  },
  message: {
    margin: 8,
    padding: 10,
    borderRadius: 8,
    maxWidth: "80%",  // Limita el ancho de los globos de chat
  },
  userMessage: {
    backgroundColor: "#d1fcd3", // Verde claro para el mensajes del usuario
    alignSelf: "flex-end", 
  },
  systemMessage: {
    backgroundColor: "#eee", 
    alignSelf: "flex-start", 
  },
  inputContainer: {
    flexDirection: "row",   
    alignItems: "center",
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  button: {
    backgroundColor: "green",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
});