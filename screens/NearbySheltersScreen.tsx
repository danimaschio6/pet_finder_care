import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "../supabase/client/supabaseClient";

interface IShelter {
  id: string
  nombre: string
  ubicacion: string
  distancia: string
  latitud: number
  longitud: number
}

export default function NearbySheltersScreen() {
  const [userLocation, setUserLocation] = useState<{ lat: number, long: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [shelters, setShelters] = useState<IShelter[]>([]);

  // lista de refugios mock
  const sheltersMock = [
    {
      id: 1,
      name: "Refugio San Martín",
      latitude: -34.5875,
      longitude: -58.4473,
    },
    {
      id: 2,
      name: "Hogar Patitas Felices",
      latitude: -34.6037,
      longitude: -58.3816,
    },
    {
      id: 3,
      name: "Rescate Animal Sur",
      latitude: -34.6995,
      longitude: -58.4750,
    },
  ];

  // Obtengo ubicación real del usuario
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        alert("Permiso de ubicación denegado.");
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: location.coords.latitude,
        long: location.coords.longitude,
      });

      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (userLocation) loadShelters();
  }, [userLocation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Cargando mapa...</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No se pudo obtener tu ubicación.</Text>
      </View>
    );
  }

  const loadShelters = async () => {
    try {
      setIsLoading(true);

      const { data: shelterData, error } = await supabase
        .from("shelters")
        .select("id, name, created_at, latitude, longitude")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar refugios:", error);
        setShelters([]);
        return;
      }

      const processedShelters: IShelter[] = [];

      for (const shelter of shelterData || []) {
        const distanciaKm = calcularDistanciaKm(
          userLocation!.lat,
          userLocation!.long,
          shelter.latitude,
          shelter.longitude
        );

        // Si el refugio esta a mas de 10km pasa al siguiente
        if (distanciaKm > 10) continue;

        // Obtener dirección inversa
        const address = await Location.reverseGeocodeAsync({
          latitude: shelter.latitude,
          longitude: shelter.longitude,
        });
        
        let ubicacion = "Ubicación desconocida";
        
        if (address.length > 0) {
          const { street, name } = address[0];
          if (street && name) ubicacion = `${street} ${name}`;
          else if (street) ubicacion = street;
        }
        
        processedShelters.push({
          id: shelter.id,
          nombre: shelter.name,
          latitud: shelter.latitude,
          longitud: shelter.longitude,
          distancia: `${distanciaKm.toFixed(1)} km`,
          ubicacion,
        });
      }

      setShelters(processedShelters);
    } catch (error) {
      console.error("Error al cargar refugios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const radio = 6371; //Km de radio de la tierra
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radio * c;
  }

  /*
  const refugiosFiltrados: IShelter[] = shelters.filter((item) => {
    // sin ubicacion de usuario no filtramos nada. No importan los demas filtros pq igual la lista no se muestra
    if (!userLocation) return false;

    const dist = calcularDistanciaKm(
      userLocation.lat,
      userLocation.long,
      item.latitud,
      item.longitud
    );

    item.distancia = `${dist.toFixed(1)} km`; //para mostrar
    if (dist > 10) return false;

    const address = await Location.reverseGeocodeAsync({
      latitude: item.latitud,
      longitude: item.longitud,
    })

    if (address.length > 0) {
      const { street, name } = address[0];

      const ubicacion = `${street} ${name}`;

      //return ubicacion; // si lo necesitás devolver
      item.ubicacion= ubicacion;
    }
    
  });
  */

  /*
  async function obtenerDireccion(lat: number, lon: number) {
    return await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lon,
    })
  }
  */

  return (
    <View style={ styles.mapContainer }>
      <MapView
        style={ styles.map }
        region={{
          latitude: userLocation.lat,
          longitude: userLocation.long,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Marcador de usuario */}
        <Marker
          coordinate={{ latitude: userLocation.lat, longitude: userLocation.long }}
          title="Tú"
          pinColor="blue"
        />

        {/* Marcadores de refugios */}
        {shelters.map((refugio) => (
          <Marker
            key={refugio.id}
            coordinate={{ latitude: refugio.latitud, longitude: refugio.longitud }}
            title={refugio.nombre}
            description={ refugio.distancia +" - "+ refugio.ubicacion }
            pinColor="red"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});