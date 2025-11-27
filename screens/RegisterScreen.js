import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient'; // Asegúrate de que esta ruta sea correcta

const { height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  // 1. Estados para los campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // 2. Validaciones básicas
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    
    setLoading(true);

    try {
      // 3. Registrar el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        Alert.alert('Error de Registro', authError.message);
        setLoading(false);
        return;
      }

      // 4. Si el Auth fue exitoso, insertar el perfil en la tabla 'profiles'
      const user = authData.user;
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id, // Enlaza el registro de perfil con el registro de Auth
              first_name: name.trim(), // Guarda el nombre de pila
              email: user.email,
              // Los demás campos (last_name, phone, etc.) quedan como NULL o puedes pedirlos después
            },
          ]);

        if (profileError) {
          console.error('Error al crear perfil:', profileError.message);
          // Si falla la inserción del perfil, lo logueamos pero no bloqueamos el usuario.
          Alert.alert('Registro Exitoso', 'Cuenta creada. Error al guardar el nombre, por favor, complétalo en tu perfil.');
        } else {
          Alert.alert('¡Éxito!', 'Cuenta creada y perfil guardado.');
        }
        
        // 5. Navegación: Ir a la pantalla principal (Dashboard) o Login
        navigation.navigate('Dashboard'); 
      } else {
        // Esto cubre el caso raro donde Supabase Auth crea el registro pero no retorna el objeto 'user'.
        Alert.alert('Advertencia', 'Revisa tu correo para verificar tu cuenta e iniciar sesión.');
        navigation.navigate('Login'); 
      }

    } catch (error) {
      console.error('Error general de registro:', error);
      Alert.alert('Error General', 'Ocurrió un error inesperado al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Ionicons name="paw" size={42} color={colors.botones.textoPrimario} />
          <Text style={styles.headerTitle}>Pet Finder & Care</Text>
          <Text style={styles.headerSubtitle}>¡Uniendo mascotas y familias!</Text>
        </View>

        {/* Tarjeta de Registro */}
        <View style={styles.registerCard}>
          <Text style={styles.cardTitle}>Registrarse</Text>
          <Text style={styles.cardSubtitle}>Por favor, completa todos los campos.</Text>

          {/* Campo de Nombre */}
          <TextInput
            style={styles.input}
            placeholder="Nombre de Pila"
            placeholderTextColor={colors.texto.secundario}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            keyboardType="default"
          />

          {/* Campo de Correo Electrónico */}
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            placeholderTextColor={colors.texto.secundario}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Campo de Contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.texto.secundario}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Campo de Confirmar Contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            placeholderTextColor={colors.texto.secundario}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Botón de Crear Cuenta */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.botones.textoPrimario} />
            ) : (
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Botón de Iniciar Sesión (secundario) */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>¿Ya tienes una cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    // Usa colors.primarios.indigo
    backgroundColor: colors.primarios.indigo, 
  },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25, 
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: colors.botones.textoPrimario, // Blanco
    marginTop: 5, 
  },
  headerSubtitle: {
    fontSize: 14, 
    color: colors.botones.textoPrimario, // Blanco para buen contraste sobre índigo
  },
  registerCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.fondo.componentes,
    borderRadius: 20,
    padding: 25,
    // Usa colors.varios.sombra para la sombra
    shadowColor: colors.varios.sombra, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.texto.primario,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.texto.secundario,
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    // Usa colors.bordes.primario para el borde del input
    borderColor: colors.bordes.primario, 
    borderRadius: 10,
    // Usa colors.fondo.componentes (blanco) para el fondo del input
    backgroundColor: colors.fondo.componentes, 
    fontSize: 16,
    color: colors.texto.primario,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.botones.primario,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // Usa colors.botones.primario para el borde del botón secundario
    borderColor: colors.botones.primario, 
    marginTop: 15,
  },
  buttonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    // Usa colors.botones.textoSecundario para el texto secundario
    color: colors.botones.textoSecundario, 
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RegisterScreen;