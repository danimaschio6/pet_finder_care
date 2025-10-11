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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Chat() {
  const insets = useSafeAreaInsets();
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
    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 70 : 80}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.from === "user" ? styles.userMessage : styles.systemMessage,
              ]}
            >
              <Text>{item.text}</Text>
            </View>
          )}
          // 💡 Added paddingBottom to prevent the last message from being hidden
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 100 }} 
        />

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  message: {
    margin: 8,
    padding: 10,
    borderRadius: 8,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#d1fcd3",
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