import React, { useState } from 'react';
import { View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const App = () => {
  const [currentView, setCurrentView] = useState('login'); // El estado por defecto es 'login'

  // Esta función es llamada por el componente de Login para navegar al registro
  const handleRegisterPress = () => {
    setCurrentView('register');
  };

  // Esta función es llamada por el componente de Registro para volver al login
  const handleLoginPress = () => {
    setCurrentView('login');
  };

  // Esta función solo simula el éxito del login.
  // En un caso real, aquí pondrías la lógica de navegación a la pantalla principal.
  const handleLoginSuccess = () => {
    alert('¡Inicio de sesión exitoso! En una app real, aquí se cargaría el Dashboard.');
  };

  // Renderiza la pantalla correcta basada en el estado
  const renderAuthenticationScreen = () => {
    if (currentView === 'login') {
      return (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onRegisterPress={handleRegisterPress}
        />
      );
    } else {
      return (
        <RegisterScreen
          onRegisterSuccess={handleLoginPress} // Después de registrar, volvemos a login
          onLoginPress={handleLoginPress}
        />
      );
    }
  };

  return <View style={{ flex: 1 }}>{renderAuthenticationScreen()}</View>;
};

export default App;
