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

  

  return (
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
  );
};

export default App;