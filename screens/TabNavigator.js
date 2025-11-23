// TabNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../data/colors.json';
import ReportPetScreen from './ReportPetScreen';
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
  const insets = useSafeAreaInsets();
  const tabBarHeight = 68 + Math.max(insets.bottom, 8);
  
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          let IconComponent;
          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
            IconComponent = Ionicons;
          } else if (route.name === 'Buscar') {
            iconName = focused ? 'search' : 'search-outline';
            IconComponent = Ionicons;
          } else if (route.name === 'Reportar') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            IconComponent = Ionicons;
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
            IconComponent = Ionicons;
          }
          return (
            <IconComponent 
              name={iconName} 
              size={focused ? 28 : 26} 
              color={color} 
            />
          );
        },
        tabBarActiveTintColor: colors.primarios.indigo,
        tabBarInactiveTintColor: colors.texto.secundario,
        tabBarStyle: {
          backgroundColor: colors.fondo.componentes,
          borderTopWidth: 0.5,
          borderTopColor: colors.bordes.primario,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 10,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
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