// App.js

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './supabase/client/supabaseClient';

// Importa todas tus pantallas
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import TabNavigator from './screens/TabNavigator';
import misMascotasScreen from './screens/misMascotasScreen';
import Chat from './screens/Chat';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al iniciar la app
  useEffect(() => {
    checkSession();
    
    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUserProfile(session.user.id);
      } else {
        setIsLoggedin(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setIsLoading(false);
    }
  };

  const checkUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, city')
        .eq('id', userId)
        .single();

      // Si tiene perfil completo, permitir acceso
      if (profile && profile.first_name && profile.last_name && profile.phone && profile.city) {
        setIsLoggedin(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking profile:', error);
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedin(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedin(false);
  };

  if (isLoading) {
    return null; // O puedes mostrar un loading spinner
  }

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
            <Stack.Screen name="CompleteProfile">
              {props => <CompleteProfileScreen {...props} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;