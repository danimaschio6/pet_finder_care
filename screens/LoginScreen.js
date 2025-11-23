import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../data/colors.json';
import { supabase } from '../supabase/client/supabaseClient';

const LoginScreen = ({ onLogin, navigation }) => {
  const insets = useSafeAreaInsets();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🐾</Text>
            </View>
            <Text style={styles.title}>Pet Finder & Care</Text>
            <Text style={styles.subtitle}>¡Uniendo mascotas y familias!</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{isLoginView ? '¡Bienvenido!' : 'Crear Cuenta'}</Text>
              <Text style={styles.cardSubtitle}>
                {isLoginView 
                  ? 'Ingresá tu usuario y contraseña' 
                  : 'Completa el formulario para registrarte'}
              </Text>
            </View>

            {message ? (
              <View style={styles.messageContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.estado.perdido.base} />
                <Text style={styles.messageText}>{message}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'email' && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={focusedInput === 'email' ? colors.primarios.indigo : colors.texto.secundario} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Correo Electrónico"
                  placeholderTextColor={colors.texto.secundario}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'password' && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={focusedInput === 'password' ? colors.primarios.indigo : colors.texto.secundario} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor={colors.texto.secundario}
                  value={password}
                  onChangeText={(text) => setPassword(text.toLowerCase())}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colors.texto.secundario} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!isLoginView && (
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'confirmPassword' && styles.inputWrapperFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedInput === 'confirmPassword' ? colors.primarios.indigo : colors.texto.secundario} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor={colors.texto.secundario}
                    value={confirmPassword}
                    onChangeText={(text) => setConfirmPassword(text.toLowerCase())}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password"
                    textContentType="password"
                    autoCorrect={false}
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={colors.texto.secundario} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={isLoginView ? handleLogin : handleRegister}
                disabled={!!isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.botones.textoPrimario} />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLoginView ? 'Ingresar' : 'Crear Cuenta'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setIsLoginView(!isLoginView);
                setMessage('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>
                {isLoginView ? '¿No tenés una cuenta? ' : '¿Ya tenés una cuenta? '}
                <Text style={styles.secondaryButtonTextBold}>
                  {isLoginView ? 'Registrate' : 'Iniciá sesión'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.fondo.app,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: colors.fondo.app,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarios.indigo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primarios.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.texto.primario,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.texto.secundario,
    textAlign: 'center',
    fontWeight: '400',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.fondo.componentes,
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.texto.primario,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.texto.secundario,
    textAlign: 'center',
    fontWeight: '400',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.estado.perdido.fondo,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.estado.perdido.base,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    color: colors.estado.perdido.base,
    marginLeft: 8,
    fontWeight: '500',
  },
  inputContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.bordes.primario,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: colors.primarios.indigo,
    backgroundColor: colors.fondo.app,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 17,
    color: colors.texto.primario,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  button: {
    width: '100%',
    backgroundColor: colors.botones.primario,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: colors.primarios.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
  },
  buttonText: {
    color: colors.botones.textoPrimario,
    fontWeight: '600',
    fontSize: 17,
  },
  secondaryButtonText: {
    color: colors.texto.secundario,
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButtonTextBold: {
    color: colors.botones.primario,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.bordes.primario,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.texto.secundario,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default LoginScreen;
