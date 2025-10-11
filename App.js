<<<<<<< HEAD
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Chat from "./screens/Chat";
=======
// App.js

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

// Importa todas tus pantallas
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TabNavigator from './screens/TabNavigator';
import misMascotasScreen from './screens/misMascotasScreen';
import Chat from './screens/Chat';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedin, setIsLoggedin] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedin(true);
  };

  const handleLogout = () => {
    setIsLoggedin(false);
  };

  
>>>>>>> origin/master

  return (
<<<<<<< HEAD
    <SafeAreaProvider>
      <View style={styles.container}>
        
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style="auto" />

        
        <Chat />
      </View>
    </SafeAreaProvider>
=======
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedin ? (
          <>
            <Stack.Screen name="Dashboard">
              {props => <TabNavigator {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            
            <Stack.Screen name="misMascotas" component={misMascotasScreen} />
            <Stack.Screen name="Mensajes" component={Chat} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
>>>>>>> origin/master
  );
};

<<<<<<< HEAD
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
=======
export default App;
>>>>>>> origin/master
