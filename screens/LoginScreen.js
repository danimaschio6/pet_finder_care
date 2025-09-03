import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import colors from './colors.json';

const LoginScreen = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }
    // Lógica de validación simulada
    if (email === "test@example.com" && password === "password123") {
      setMessage("¡Has iniciado sesión!");
      onLogin(true); // Actualiza el estado de la app principal
    } else {
      setMessage("Credenciales incorrectas.");
    }
  };

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    // Lógica de registro simulada
    setMessage("¡Cuenta creada! Ahora puedes iniciar sesión.");
    setIsLoginView(true);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
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
          style={styles.button}
          onPress={isLoginView ? handleLogin : handleRegister}
        >
          <Text style={styles.buttonText}>{isLoginView ? 'Ingresar' : 'Crear Cuenta'}</Text>
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
    shadowColor: colors.varios.sombra,
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
});

export default LoginScreen;
