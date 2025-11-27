import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView, // <--- Importado
  Platform // <--- Importado para detectar OS
} from 'react-native';
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
      // Reemplazo de Alert con una implementación de alerta más segura si fuera una web, pero en RN se usa Alert
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
    // 1. Envolver todo con KeyboardAvoidingView
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Usar 'padding' en iOS, 'height' o 'position' en Android
      // 2. Ajustar el offset si el encabezado se sigue ocultando (puedes ajustar este valor)
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* 3. El ScrollView es ahora el hijo de KeyboardAvoidingView */}
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Mejora la experiencia al tocar fuera de los inputs
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="account-circle" size={60} color={colors.primarios.indigo} />
          <Text style={styles.title}>Completa tu Perfil</Text>
          <Text style={styles.subtitle}>Necesitamos algunos datos adicionales para continuar</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Pérez"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: +54 11 1234-5678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Buenos Aires"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCompleteProfile}
            disabled={!!isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.botones.textoPrimario} />
            ) : (
              <Text style={styles.buttonText}>Guardar y Continuar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Nuevo estilo para el contenedor principal
  flexContainer: { 
    flex: 1, 
    backgroundColor: colors.fondo.app, // Opcional: mantener el color de fondo aquí
  }, 
  container: {
    flexGrow: 1,
    padding: 20,
    // Eliminamos el backgroundColor de aquí si lo pusimos en flexContainer
    // y si no está, lo dejamos como estaba
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.texto.primario,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.texto.secundario,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: colors.fondo.componentes,
    padding: 24,
    borderRadius: 16,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.texto.primario,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: colors.bordes.primario,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
    color: colors.texto.primario,
  },
  button: {
    width: '100%',
    backgroundColor: colors.botones.primario,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.varios.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CompleteProfileScreen;
