import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, Switch, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import colors from "../data/colors.json";
import PetCard from "./components/PetCardComponent";
import { supabase } from "../supabase/client/supabaseClient";

import LocationSelectMap from "../screens/components/LocationSelectMap";
import * as Location from "expo-location";

interface IPet {
  id: string
  tipo: string
  nombre: string
  estado: string
  descripcion: string
  detalle: string
  idDuenio?: number
  distancia: string
  latitud?: number
  longitud?: number
}

export default function NearbyPetsScreen() {
  const insets = useSafeAreaInsets();
  const [filtroPerdidas, setFiltroPerdidas] = useState('Todas');
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [soloConFoto, setSoloConFoto] = useState(false);
  const [menosDe5km, setMenosDe5km] = useState(false);
  const [pets, setPets] = useState<IPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  //estados mapa
  const [userLocation, setUserLocation] = useState<{ lat: number, long: number } | null>(null);
  const [modalMapaEleccionVisible, setModalMapaEleccionVisible] = useState(false);
  //estados location
  const [locationStatus, setLocationStatus] = useState<"granted" | "denied" | "unknown">("unknown");

  const getLocation = async () =>{
    const location = await Location.getCurrentPositionAsync();
    setUserLocation({
      lat: location.coords.latitude,
      long: location.coords.longitude,
    });
  }
  const pedirPermisoLocation = async () => {
    let {status, granted, canAskAgain} = await Location.requestForegroundPermissionsAsync();
    //let {status, ios, android, expires, granted, canAskAgain} =
    if (status!== 'granted') {
      if (!canAskAgain) {
        Alert.alert("Permiso denegado", "Es necesario que habilite el permiso en la configuración de su dispositivo.", 
          [{
            text: 'Cancelar',
            onPress: ()=> console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: ()=> console.log('Ok Pressed'),
          },
          ]
        )
        setLocationStatus("denied");
        return;
      }

      Alert.alert("Permiso denegado", "Es necesario el permiso para acceder a su ubicación actual", [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          //onPress: () => pedirPermisoLocation(),
          onPress: () => setLocationStatus("denied"),
        },
      ])
      return
    } else if (granted) {
      setLocationStatus("granted");
      getLocation();
    }
  }

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

  // Cargar mascotas desde Supabase
  {/* 
  useEffect(() => {
    loadPets();
  }, []);
  // Recargar cuando cambie el filtro
  useEffect(() => {
    loadPets();
  }, [filtroPerdidas, soloConFoto]);
  */}

  //permiso expo-location
  useEffect(() => {
    pedirPermisoLocation();
  }, []);
  // Cargar mascotas desde Supabase, recarga cuando cambien los filtros
  useEffect(() => {
    if (userLocation) loadPets();
  }, [userLocation, filtroPerdidas, soloConFoto]);

  const loadPets = async () => {
    try {
      setIsLoading(true);
      
      // Construir la query base
      let query = supabase
        .from('pets')
        .select('id, name, species, breed, description, location, owner_id, image_url, status, created_at, latitude, longitude')
        .order('created_at', { ascending: false });

      // Filtrar por estado si no es "Todas"
      if (filtroPerdidas === "Perdidas") {
        query = query.eq('status', 'perdida');
      } else if (filtroPerdidas === "Encontradas") {
        query = query.eq('status', 'encontrada');
      }

      // Filtrar solo con foto si está activado
      if (soloConFoto) {
        query = query.not('image_url', 'is', null);
      }

      const { data: petsData, error } = await query;

      if (error) {
        console.error('Error al cargar mascotas:', error);
        setPets([]);
        return;
      }

      // Mapear los datos de Supabase al formato que espera el componente
      const mappedPets: IPet[] = (petsData || []).map((pet: any) => ({
        id: pet.id,
        tipo: pet.species === 'perro' ? 'Perro' : pet.species === 'gato' ? 'Gato' : pet.species,
        nombre: pet.name || 'Sin nombre',
        estado: pet.status === 'perdida' ? 'Perdido' : pet.status === 'encontrada' ? 'Encontrado' : 'Desconocido',
        descripcion: pet.description || 'Sin descripción',
        detalle: pet.location ? `📍 ${pet.location}` : '📍 Ubicación no especificada',
        idDuenio: pet.owner_id,
        distancia: 'Distancia no disponible', // Por ahora, se puede calcular después con geolocalización
        image_url: pet.image_url || null, // Incluir la URL de la imagen        
        // coordenadas
        latitud: pet.latitude,
        longitud: pet.longitude
      }));

      setPets(mappedPets);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar por búsqueda
  {/* 
  const mascotasFiltradas: IPet[] = pets.filter((item) => {

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(query) ||
      item.descripcion.toLowerCase().includes(query) ||
      item.tipo.toLowerCase().includes(query) ||
      item.detalle.toLowerCase().includes(query)
    );

  });
  */}

  // Filtrar búsqueda
  const mascotasFiltradas: IPet[] = pets.filter((item) => {
    // sin ubicacion de usuario no filtramos nada. No importan los demas filtros pq igual la lista no se muestra
    if (!userLocation || (!item.latitud && !item.longitud )) return false;

    // cálculo de distancia si la mascota tiene coordenadas
    if (item.latitud && item.longitud) {
      const dist = calcularDistanciaKm(
        userLocation.lat,
        userLocation.long,
        item.latitud,
        item.longitud
      );

      item.distancia = `${dist.toFixed(1)} km`;

      // si está activado "menosDe5km"
      //if (menosDe5km && dist > 5) return false;
      
      const distanciaMaxima = menosDe5km ? 5 : 10;
      if (dist > distanciaMaxima) return false;
    }

    // luego filtro por búsqueda
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (
        !item.nombre.toLowerCase().includes(q) &&
        !item.descripcion.toLowerCase().includes(q) &&
        !item.tipo.toLowerCase().includes(q) &&
        !item.detalle.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>Mascotas Cerca</Text>
      </View>

      <View style={styles.container}>

        {/* Filtros */}
        {/* 
        <View style={styles.filtros}>
          {['Perdidas', 'Encontradas'].map((palabraFiltro) => (
            <TouchableOpacity
              key={ palabraFiltro }
              style={[
                styles.filtroBtn,
                filtroPerdidas === palabraFiltro && { backgroundColor: colors.botones.primario },
              ]}
              onPress={() => setFiltroPerdidas(palabraFiltro)}
            >
              <Text style={[
                styles.filtroText,
                filtroPerdidas === palabraFiltro && { color: colors.botones.textoPrimario },
              ]}>
                { palabraFiltro }
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        </TouchableOpacity><TouchableOpacity style={ styles.filtroBtn }>
          <Text style={ styles.filtroText}>
            Filtros.
          </Text>
        </TouchableOpacity>
        */}
        
        <View style={styles.filtros}>
          <TouchableOpacity style={ [styles.botonFiltro, filtroPerdidas === "Todas" && styles.botonFiltroActivo] } onPress={() => setFiltroPerdidas("Todas")}> 
            <Text style={ [styles.filtroText, filtroPerdidas === "Todas" && styles.filtroActivoText] }>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={ [styles.botonFiltro, filtroPerdidas === "Perdidas" && styles.botonFiltroActivo] } onPress={() => setFiltroPerdidas("Perdidas")}> 
            <Text style={ [styles.filtroText, filtroPerdidas === "Perdidas" && styles.filtroActivoText] }>
              Perdidas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={ [styles.botonFiltro, filtroPerdidas === "Encontradas" && styles.botonFiltroActivo] } onPress={() => setFiltroPerdidas("Encontradas")}>
            <Text style={ [styles.filtroText, filtroPerdidas === "Encontradas" && styles.filtroActivoText] }>
              Encontradas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={ styles.botonFiltro } onPress={() => setModalFiltrosVisible(true)}>
            <Text style={ styles.filtroText }>
              <Ionicons name="options-outline" size={22} color= {colors.botones.textoSecundario}/>
            </Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={!!modalFiltrosVisible}
            onRequestClose={() => setModalFiltrosVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Opciones de Filtrado</Text>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Solo con foto</Text>
                  <Switch
                    value={soloConFoto}
                    onValueChange={setSoloConFoto}
                    thumbColor={soloConFoto ? colors.primarios.indigo : "#f4f3f4"}
                    trackColor={{ false: "#d1d5db", true: colors.primarios.indigo }}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Menos de 5 km</Text>
                  <Switch
                    value={menosDe5km}
                    onValueChange={setMenosDe5km}
                    thumbColor={menosDe5km ? colors.primarios.indigo : "#f4f3f4"}
                    trackColor={{ false: "#d1d5db", true: colors.primarios.indigo }}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.botonFiltroActivo, { marginTop: 20 }]}
                  onPress={() => setModalFiltrosVisible(false)}
                >
                  <Text style={styles.filtroActivoText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </View>
        
        {/* Buscador */}
        <TextInput
          style={styles.input}
          placeholder='Buscar por raza, color, etc.'
          placeholderTextColor={colors.texto.secundario}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />

        { locationStatus === "denied" && (
          <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
            No diste permiso para usar la ubicación. Podés elegir una ubicación manualmente.
          </Text>
        ) }

        {/* botón modal mapa */}
        <View style={styles.locationBtnContainer}>
          <TouchableOpacity style={styles.locationBtn} onPress={() => setModalMapaEleccionVisible(true)}>
            <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
              <Ionicons name="map-outline" size={18} color= {colors.botones.secundario}/>
              Definir ubicación
            </Text>
          </TouchableOpacity>
        </View>
        

        {/*modal mapa */}
        <Modal visible={ modalMapaEleccionVisible } animationType="slide">
          <LocationSelectMap 
          initialLat={ userLocation?.lat }
          initialLng={ userLocation?.long }
          onLocationSelected={(lat, long) => {
            setUserLocation({ lat, long });
            setModalMapaEleccionVisible(false);
          }}
          onClose={() => setModalMapaEleccionVisible(false)}
          />
        </Modal>
        
        
        {/* Lista */}
        {/*
        <FlatList
          data={data}
          keyExtractor={(item: IPet) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
        */}
        {!userLocation ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <Text style={{ color: colors.texto.secundario, fontSize: 16, marginBottom: 10 }}>
              Defina una ubicación para ver mascotas cercanas.
            </Text>

            <TouchableOpacity
              onPress={() => setModalMapaEleccionVisible(true)}
              style={{
                backgroundColor: colors.primarios.indigo,
                padding: 12,
                borderRadius: 10,
                width: "80%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Elegir ubicación</Text>
            </TouchableOpacity>
          </View>
        ): isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
            <ActivityIndicator size="large" color={colors.primarios.indigo} />
            <Text style={{ marginTop: 10, color: colors.texto.secundario }}>Cargando mascotas...</Text>
          </View>
        ) : (
          <FlatList
            data={mascotasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PetCard {...item} />}
            contentContainerStyle={{ 
              paddingBottom: 68 + Math.max(insets.bottom, 8) + 20, 
              margin: 15 
            }}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20, color: colors.texto.secundario }}>
                {searchQuery 
                  ? `No se encontraron mascotas que coincidan con "${searchQuery}"`
                  : `No hay mascotas ${filtroPerdidas.toLowerCase()} en este momento.`
                }
              </Text>
            }
            refreshing={isLoading}
            onRefresh={loadPets}
          />
        )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.fondo.app,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.fondo.componentes,
    paddingHorizontal: 0,
    paddingTop: 0,
    borderRadius: 0,
    marginBottom: 0,
    marginHorizontal: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.botones.textoPrimario,
    letterSpacing: -0.5,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  containerDos: {
    flex: 1,
    backgroundColor: colors.fondo.componentes,
    paddingHorizontal: 16,
    paddingTop: 40,
    borderRadius: 25
  },
  filtros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  botonFiltro: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.fondo.app,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
  },
  botonFiltroActivo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.primarios.indigo,
  },
  filtroText: {
    color: colors.texto.secundario,
    fontWeight: '600',
    fontSize: 15,
  },
  filtroActivoText: {
    color: colors.botones.textoPrimario,
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    backgroundColor: colors.fondo.componentes,
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.bordes.primario,
    marginHorizontal: 20,
    marginVertical: 8,
    fontSize: 17,
    color: colors.texto.primario,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.fondo.componentes,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.texto.primario,
  },
  descripcion: {
    fontSize: 14,
    color: colors.texto.primario,
  },
  detalle: {
    fontSize: 13,
    color: colors.texto.secundario,
    marginTop: 2,
  },
  distancia: {
    fontSize: 12,
    color: colors.botones.primario,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.fondo.componentes,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.texto.primario,
    textAlign: "center",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  switchLabel: {
    color: colors.texto.primario,
    fontSize: 16,
  },
  locationBtnContainer: {
    paddingHorizontal: 12, 
    marginTop: 10, 
  },
  locationBtn: {
    backgroundColor: colors.primarios.indigo, 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: "center", 
  },
});