import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient';

const LoginScreen = ({ onLogin, navigation }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setMessage(error.message || "Credenciales incorrectas.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Verificar si el usuario tiene perfil completo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, city')
          .eq('id', data.user.id)
          .single();

        setIsLoading(false);
        
        // Si no tiene perfil o le faltan datos, ir a completar perfil
        if (profileError || !profile || !profile.first_name || !profile.last_name || !profile.phone || !profile.city) {
          navigation?.navigate('CompleteProfile', { 
            userId: data.user.id, 
            email: data.user.email
          });
        } else {
          onLogin(true);
        }
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error al iniciar sesión. Por favor, intenta nuevamente.");
      console.error('Error en login:', error);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setMessage(error.message || "Error al crear la cuenta.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Esperar un momento para asegurar que la sesión esté establecida
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar que la sesión esté activa
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setMessage("Error: La sesión no se estableció correctamente. Por favor, intenta nuevamente.");
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        // Navegar a completar perfil
        navigation?.navigate('CompleteProfile', { 
          userId: data.user.id, 
          email: email.trim()
        });
      }
    } catch (error) {
      setIsLoading(false);
      setMessage("Error al registrar. Por favor, intenta nuevamente.");
      console.error('Error en registro:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.title}>Pet Finder & Care</Text>
        <Text style={styles.subtitle}>¡Uniendo mascotas y familias!</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isLoginView ? 'Iniciar Sesión' : 'Registrarse'}</Text>
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="off"
          textContentType="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {!isLoginView && (
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        )}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={isLoginView ? handleLogin : handleRegister}
          disabled={!!isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.botones.textoPrimario} />
          ) : (
            <Text style={styles.buttonText}>{isLoginView ? 'Ingresar' : 'Crear Cuenta'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsLoginView(!isLoginView)}
        >
          <Text style={styles.secondaryButtonText}>
            {isLoginView ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.fondo.app,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    color: colors.botones.textoSecundario,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.texto.primario,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.texto.secundario,
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.fondo.componentes,
    padding: 24,
    borderRadius: 16,
    shadowColor: colors.varios,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.texto.primario,
    marginBottom: 20,
    textAlign: 'center',
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
  },
  button: {
    width: '100%',
    backgroundColor: colors.botones.primario,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: colors.botones.secundario,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.botones.textoPrimario,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: colors.botones.textoSecundario,
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    color: 'red',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
