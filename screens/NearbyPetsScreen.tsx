import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, Switch, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import colors from "../data/colors.json";
import PetCard from "./components/PetCardComponent";
import { supabase } from "../supabase/client/supabaseClient";


interface IPet {
  id: string
  tipo: string
  nombre: string
  estado: string
  descripcion: string
  detalle: string
  distancia: string
  image_url?: string
  user_id?: string
}

export default function NearbyPetsScreen() {
  const [filtroPerdidas, setFiltroPerdidas] = useState('Todas');
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [soloConFoto, setSoloConFoto] = useState(false);
  const [menosDe5km, setMenosDe5km] = useState(false);
  const [pets, setPets] = useState<IPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    loadPets();
  }, [filtroPerdidas, soloConFoto]);

  const loadPets = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('pets')
        .select('id, owner_id, name, species, breed, description, location, image_url, status, created_at')
        .order('created_at', { ascending: false });

      if (filtroPerdidas === "Perdidas") {
        query = query.eq('status', 'perdida');
      } else if (filtroPerdidas === "Encontradas") {
        query = query.eq('status', 'encontrada');
      }

      if (soloConFoto) {
        query = query.not('image_url', 'is', null);
      }

      const { data: petsData, error } = await query;

      if (error) {
        console.error('Error al cargar mascotas:', error);
        setPets([]);
        return;
      }


      const mappedPets: IPet[] = (petsData || []).map((pet: any) => ({
        id: pet.id,
        user_id: pet.owner_id || undefined, // Si es null, pasa a ser undefined
        tipo: pet.species === 'perro' ? 'Perro' : pet.species === 'gato' ? 'Gato' : pet.species,
        nombre: pet.name || 'Sin nombre',
        estado: pet.status === 'perdida' ? 'Perdido' : pet.status === 'encontrada' ? 'Encontrado' : 'Desconocido',
        descripcion: pet.description || 'Sin descripción',
        detalle: pet.location ? `📍 ${pet.location}` : '📍 Ubicación no especificada',
        distancia: 'Distancia no disponible',
        image_url: pet.image_url || undefined, // Si es null, pasa a ser undefined
      }));

      setPets(mappedPets);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mascotas Cerca</Text>
      </View>

      <View style={styles.container}>
        {/* FILTROS */}
        <View style={styles.filtros}>
          <TouchableOpacity style={[styles.botonFiltro, filtroPerdidas === "Todas" && styles.botonFiltroActivo]} onPress={() => setFiltroPerdidas("Todas")}>
            <Text style={[styles.filtroText, filtroPerdidas === "Todas" && styles.filtroActivoText]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonFiltro, filtroPerdidas === "Perdidas" && styles.botonFiltroActivo]} onPress={() => setFiltroPerdidas("Perdidas")}>
            <Text style={[styles.filtroText, filtroPerdidas === "Perdidas" && styles.filtroActivoText]}>Perdidas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonFiltro, filtroPerdidas === "Encontradas" && styles.botonFiltroActivo]} onPress={() => setFiltroPerdidas("Encontradas")}>
            <Text style={[styles.filtroText, filtroPerdidas === "Encontradas" && styles.filtroActivoText]}>Encontradas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonFiltro} onPress={() => setModalFiltrosVisible(true)}>
            <Text style={styles.filtroText}>
              <Ionicons name="options-outline" size={22} color={colors.botones.textoSecundario} />
            </Text>
          </TouchableOpacity>

          <Modal animationType="slide" transparent={true} visible={!!modalFiltrosVisible} onRequestClose={() => setModalFiltrosVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Opciones de Filtrado</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Solo con foto</Text>
                  <Switch value={soloConFoto} onValueChange={setSoloConFoto} thumbColor={soloConFoto ? colors.primarios.indigo : "#f4f3f4"} trackColor={{ false: "#d1d5db", true: colors.primarios.indigo }} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Menos de 5 km</Text>
                  <Switch value={menosDe5km} onValueChange={setMenosDe5km} thumbColor={menosDe5km ? colors.primarios.indigo : "#f4f3f4"} trackColor={{ false: "#d1d5db", true: colors.primarios.indigo }} />
                </View>
                <TouchableOpacity style={[styles.botonFiltro, { marginTop: 20, backgroundColor: colors.botones.primario, alignItems: 'center' }]} onPress={() => setModalFiltrosVisible(false)}>
                  <Text style={[styles.filtroText, { color: '#fff' }]}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <TextInput
          style={styles.input}
          placeholder='Buscar por raza, color, etc.'
          placeholderTextColor={colors.texto.secundario}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
            <ActivityIndicator size="large" color={colors.primarios.indigo} />
          </View>
        ) : (
          <FlatList
            data={mascotasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PetCard {...item} />}
            contentContainerStyle={{ paddingBottom: 80, margin: 15 }}
            ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20, color: colors.texto.secundario }}>No se encontraron resultados.</Text>}
            refreshing={isLoading}
            onRefresh={loadPets}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.fondo.app, paddingHorizontal: 0, paddingTop: 0 },
  container: { flex: 1, backgroundColor: colors.fondo.componentes, paddingHorizontal: 5, paddingTop: 20, borderRadius: 15, marginBottom: 50, marginHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.botones.textoPrimario },
  header: { paddingVertical: 16, paddingHorizontal: 20, backgroundColor: colors.primarios.indigo, alignItems: 'center', justifyContent: 'center', paddingTop: 40, marginBottom: 10, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  filtros: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, marginHorizontal: 5 },
  botonFiltro: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10, backgroundColor: colors.botones.secundario },
  botonFiltroActivo: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 10, backgroundColor: colors.botones.primario },
  filtroText: { color: colors.botones.textoSecundario, fontWeight: '500' },
  filtroActivoText: { color: colors.botones.textoPrimario, fontWeight: '500' },
  input: { backgroundColor: colors.fondo.componentes, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.bordes.primario, marginHorizontal: 12, marginVertical: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "80%", backgroundColor: colors.fondo.componentes, padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20, color: colors.texto.primario, textAlign: "center" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  switchLabel: { color: colors.texto.primario, fontSize: 16 },
});