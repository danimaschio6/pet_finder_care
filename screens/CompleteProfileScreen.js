import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient';

const CompleteProfileScreen = ({ route, navigation, onLoginSuccess }) => {
  const { userId, email } = route.params || {};
  
  // Obtener el usuario actual de Supabase Auth como respaldo
  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || userId;
  };
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteProfile = async () => {
    // Validación
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !city.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    // Validar formato de teléfono (básico)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Error", "Por favor, ingresa un número de teléfono válido.");
      return;
    }

    setIsLoading(true);

    try {
      // Obtener el usuario actual - intentar con getUser primero, luego getSession
      let finalUserId = userId;
      let userEmail = email;
      let session = null;

      // Intentar obtener el usuario autenticado
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && currentUser) {
        finalUserId = currentUser.id;
        userEmail = currentUser.email || email;
        console.log('Usuario obtenido con getUser():', finalUserId);
      } else {
        // Si getUser falla, intentar con getSession
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !currentSession || !currentSession.user) {
          // Si no hay sesión, usar el userId de los params (último recurso)
          if (!userId) {
            throw new Error('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
          }
          console.warn('No se encontró sesión activa, usando userId de params:', userId);
        } else {
          session = currentSession;
          finalUserId = currentSession.user.id;
          userEmail = currentSession.user.email || email;
          console.log('Sesión obtenida con getSession():', finalUserId);
        }
      }
      
      if (!finalUserId) {
        throw new Error('No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
      }
      
      console.log('=== VERIFICACIÓN DE AUTENTICACIÓN ===');
      console.log('Usuario ID final:', finalUserId);
      console.log('Email:', userEmail);
      console.log('Sesión activa:', !!session);

      // Si no se pudo obtener de la sesión, usar el userId de los params
      if (!finalUserId && userId) {
        finalUserId = userId;
        console.log('Usando userId de params como respaldo:', finalUserId);
      }
      
      // Verificar que tenemos un userId válido
      if (!finalUserId) {
        throw new Error('No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
      }
      
      // Verificar que el userId coincida con el usuario autenticado (si hay sesión)
      if (session && userId && userId !== finalUserId) {
        console.warn('El userId proporcionado no coincide con el usuario autenticado');
      }

      // Preparar datos del perfil - CRÍTICO: el id DEBE ser exactamente auth.uid()
      const profileData = {
        id: finalUserId, // DEBE coincidir exactamente con auth.uid() para que RLS funcione
        email: userEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        city: city.trim(),
      };

      console.log('=== DATOS DEL PERFIL ===');
      console.log('ID a insertar:', profileData.id);
      console.log('Datos completos:', profileData);

      // Primero verificar si el perfil ya existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', finalUserId)
        .single();

      let data, error;

      if (existingProfile && !checkError) {
        // El perfil existe, actualizar
        console.log('Perfil existe, actualizando...');
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            email: profileData.email,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            phone: profileData.phone,
            city: profileData.city,
          })
          .eq('id', finalUserId)
          .select();
        
        data = updateData;
        error = updateError;
        console.log('Resultado de update:', { data, error });
      } else {
        // El perfil no existe, insertar
        console.log('Perfil no existe, insertando nuevo...');
        console.log('Intentando INSERT con datos:', profileData);
        
        // Verificar una vez más que tenemos el ID correcto
        if (!profileData.id || profileData.id !== finalUserId) {
          console.error('ERROR: El ID del perfil no coincide con el usuario autenticado');
          throw new Error('Error de autenticación: El ID del usuario no coincide.');
        }
        
        // Verificar sesión antes de insertar
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        if (!verifySession) {
          console.warn('Advertencia: No hay sesión activa, pero continuando con userId de params');
        } else {
          console.log('Sesión verificada antes de insertar:', verifySession.user.id);
        }
        
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select();
        
        data = insertData;
        error = insertError;
        console.log('Resultado de insert:', { data, error });
        
        // Si hay error de RLS o 401, dar más información
        if (insertError) {
          if (insertError.code === '42501' || insertError.message?.includes('row-level security')) {
            console.error('ERROR RLS: Las políticas están bloqueando la inserción');
            console.error('Usuario intentando insertar:', finalUserId);
            console.error('Código de error:', insertError.code);
            console.error('Mensaje:', insertError.message);
            throw new Error('Error de permisos: Las políticas RLS están bloqueando la inserción. Por favor, ejecuta el script SQL fix_rls_definitivo.sql en Supabase.');
          } else if (insertError.code === 'PGRST301' || insertError.message?.includes('401') || insertError.message?.includes('Unauthorized')) {
            console.error('ERROR 401: No autorizado');
            console.error('Usuario intentando insertar:', finalUserId);
            throw new Error('Error de autenticación: No estás autorizado. Por favor, verifica que hayas iniciado sesión correctamente.');
          }
        }
      }

      if (error) {
        throw error;
      }

      setIsLoading(false);
      
      // Actualizar estado de login inmediatamente (esto hará que App.js cambie la navegación automáticamente)
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // Mostrar mensaje de éxito y la navegación se manejará automáticamente
      // Usar setTimeout para asegurar que el estado se actualice antes del alert
      setTimeout(() => {
        Alert.alert(
          '¡Perfil Completado! 🎉',
          'Tu información ha sido guardada correctamente.\n\n¡Bienvenido a Pet Finder & Care!',
          [
            {
              text: 'Continuar',
              onPress: () => {
                // La navegación ya se manejó automáticamente por el cambio de estado
              }
            }
          ],
          { cancelable: false }
        );
      }, 100);
    } catch (error) {
      setIsLoading(false);
      console.error('Error al guardar perfil:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('UserId:', userId);
      console.error('Email:', email);
      
      let errorMessage = 'Error desconocido';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = `Error ${error.code}: ${error.message || 'Error al guardar el perfil'}`;
      }
      
      Alert.alert(
        'Error',
        `No se pudo guardar tu información: ${errorMessage}\n\nPor favor, verifica que:\n- Estés conectado a internet\n- La tabla 'profiles' exista en la base de datos\n- Las políticas RLS estén configuradas correctamente`
      );
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={72} color={colors.primarios.indigo} />
        <Text style={styles.title}>Completa tu Perfil</Text>
        <Text style={styles.subtitle}>Necesitamos algunos datos adicionales para continuar</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan"
            placeholderTextColor={colors.texto.secundario}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="givenName"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Pérez"
            placeholderTextColor={colors.texto.secundario}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="familyName"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: +54 11 1234-5678"
            placeholderTextColor={colors.texto.secundario}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCorrect={false}
            textContentType="telephoneNumber"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Buenos Aires"
            placeholderTextColor={colors.texto.secundario}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="addressCity"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCompleteProfile}
          disabled={!!isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.botones.textoPrimario} />
          ) : (
            <Text style={styles.buttonText}>Guardar y Continuar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.fondo.app,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.texto.primario,
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: colors.texto.secundario,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: colors.fondo.componentes,
    padding: 0,
    borderRadius: 14,
    overflow: 'hidden',
  },
  inputGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.texto.secundario,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: colors.fondo.componentes,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.texto.primario,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  button: {
    width: '100%',
    backgroundColor: colors.botones.primario,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 20,
    marginBottom: 24,
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.botones.textoPrimario,
    fontWeight: '600',
    fontSize: 17,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default CompleteProfileScreen;

