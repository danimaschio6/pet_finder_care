import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import LoginScreen from './screens/LoginScreens';
import DashboardScreen from './screens/DashboardScreen';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    isLoggedIn ? (
      <NavigationContainer>
        <DashboardScreen onLogout={handleLogout} />
      </NavigationContainer>
    ) : (
      <LoginScreen onLogin={handleLoginSuccess} />
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;