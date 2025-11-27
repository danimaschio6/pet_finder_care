// App.js

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './supabase/client/supabaseClient';
import * as Notifications from "expo-notifications";

// 🔔 CONFIG GLOBAL DE NOTIFICACIONES
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Importa todas las pantallas
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import TabNavigator from './screens/TabNavigator';
import MisMascotasScreen from './screens/MisMascotasScreen';
import CrearMascotaScreen from './screens/CrearMascotaScreen';
import VerMascotaScreen from './screens/VerMascotaScreen';
import EditarMascotaScreen from './screens/EditarMascotaScreen'; 
import VerHistorialScreen from './screens/VerHistorialScreen';
import AgregarHistorialScreen from './screens/AgregarHistorialScreen';
import EditarHistorialScreen from './screens/EditarHistorialScreen';
import RecordatoriosScreen from './screens/RecordatoriosScreen';
import ReminderModal from './screens/ReminderModal';
import InboxScreen from './screens/InboxScreen';
import NearbySheltersScreen from './screens/NearbySheltersScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NewsScreen from './screens/NewsScreen';



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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {isLoggedin ? (
            <>
              <Stack.Screen name="Dashboard">
                {props => <TabNavigator {...props} onLogout={handleLogout} />}
              </Stack.Screen>

              <Stack.Screen name="MisMascotas" component={MisMascotasScreen} />
              <Stack.Screen name="CrearMascota" component={CrearMascotaScreen} />
              <Stack.Screen name="VerMascota" component={VerMascotaScreen} />
              <Stack.Screen name="EditarMascota" component={EditarMascotaScreen} />
              <Stack.Screen name="VerHistorial" component={VerHistorialScreen} />
              <Stack.Screen name="AgregarHistorial" component={AgregarHistorialScreen} />
              <Stack.Screen name="EditarHistorial" component={EditarHistorialScreen} />
              <Stack.Screen name="Recordatorios" component={RecordatoriosScreen} />
              <Stack.Screen
               name="ReminderModal"
               component={ReminderModal}
               options={{ presentation: "modal" }}
             />
              <Stack.Screen name="misMascotas" component={MisMascotasScreen} />
              <Stack.Screen name="BandejaEntrada" component={InboxScreen} />
              <Stack.Screen name="Mensajes" component={Chat} />
              <Stack.Screen name="Refugios" component={NearbySheltersScreen} />
              <Stack.Screen name="Noticias" component={NewsScreen} />
              
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
    </GestureHandlerRootView>
  );
};

export default App;