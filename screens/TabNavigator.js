// TabNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../data/colors.json';
import ReportPetScreen from '../screens/ReportPetScreen';
import DashboardScreen from './DashboardScreen';
import ProfileScreen from './ProfileScreen';

//import PetDetailSecreen from './PetDetailScreen';

import NearbyPetsScreen from './NearbyPetsScreen';
import NearbyPetDetailScreen from './NearbyPetDetailScreen';
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();


const Stack = createNativeStackNavigator();
function NearbyPetsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NearbyPets" component={NearbyPetsScreen} />
      <Stack.Screen name="NearbyPetDetailScreen" component={NearbyPetDetailScreen} />
    </Stack.Navigator>
  );
}

const TabNavigator = ({ onLogout }) => {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let IconComponent;
          if (route.name === 'Inicio') {
            iconName = 'home-outline';
            IconComponent = Ionicons;
          } else if (route.name === 'Buscar') {
            iconName = 'search1';
            IconComponent = AntDesign;
          } else if (route.name === 'Reportar') {
            iconName = 'receipt-outline';
            IconComponent = Ionicons;
          } else if (route.name === 'Perfil') {
            iconName = 'user-alt';
            IconComponent = FontAwesome5;
          }
          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primarios.indigo,
        tabBarInactiveTintColor: colors.secundarios.gris,
        tabBarStyle: {
          backgroundColor: colors.fondo.componentes,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          paddingBottom: 10,
          marginBottom: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} />
      {/** 
      <Tab.Screen name="Buscar" component={PetDetailSecreen} />
      */}
      <Tab.Screen name="Buscar" component={NearbyPetsStack} />
      <Tab.Screen name="Reportar" component={ReportPetScreen} />
      <Tab.Screen name="Perfil">
        {props => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;