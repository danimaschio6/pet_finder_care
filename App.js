import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ReportPetScreen from './screens/ReportPetScreen';
import PetListScreen from './screens/PetListScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import Footer from './data/Footer'; // La ruta del Footer que ya tienes

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [selectedPet, setSelectedPet] = useState(null);

  const handleRegisterPress = () => {
    setCurrentView('register');
  };

  const handleLoginPress = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = () => {
    setCurrentView('home'); 
  };

  const handleReportPetPress = () => {
    setCurrentView('reportPet');
  };

  const handleViewPetList = () => {
    setCurrentView('petList');
  };

  const handleViewPetDetail = (pet) => {
    setSelectedPet(pet);
    setCurrentView('petDetail');
  };

  const handleBack = () => {
    if (currentView === 'petDetail') {
      setCurrentView('petList');
    } else {
      setCurrentView('home');
    }
  };

  const renderScreen = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onRegisterPress={handleRegisterPress}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={handleLoginPress}
            onLoginPress={handleLoginPress}
          />
        );
      case 'home':
        return (
          <HomeScreen
            onReportPetPress={handleReportPetPress}
            onViewPetList={handleViewPetList}
          />
        );
      case 'reportPet':
        return <ReportPetScreen onBackPress={handleBack} />;
      case 'petList':
        return <PetListScreen onViewPetDetail={handleViewPetDetail} />;
      case 'petDetail':
        return <PetDetailScreen petData={selectedPet} onBackPress={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>{renderScreen()}</View>
      {/* El Footer solo se renderiza si la vista no es 'login' o 'register' */}
      {currentView !== 'login' && currentView !== 'register' && (
        <Footer 
          onHomePress={handleLoginSuccess} 
          onReportPetPress={handleReportPetPress} 
          onViewPetList={handleViewPetList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default App;