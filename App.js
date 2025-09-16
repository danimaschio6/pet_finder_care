import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Chat from "./screens/Chat";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style="auto" />

        
        <Chat />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
