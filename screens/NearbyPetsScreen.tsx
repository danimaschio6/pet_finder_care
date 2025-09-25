import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, Switch } from "react-native";
import colors from "../data/colors.json";
import PetCard from "./components//PetCardComponent";

interface IPet {
  id: string
  tipo: string
  nombre: string
  estado: string
  descripcion: string
  detalle: string
  distancia: string
}

const data : IPet[]= [
  {
    id: "1",
    tipo: 'Perro',
    nombre: 'Tobey',
    estado: 'Perdido',
    descripcion: 'Border Collie, macho, blanco y negro',
    detalle: 'Visto por última vez: Parque Central, hace 3 horas',
    distancia: '2.1 km de ti',
  },
  {
    id: "2",
    tipo: 'Gato',
    nombre: 'Luna',
    estado: 'Encontrado',
    descripcion: 'Gata tricolor, pequeña, sin collar',
    detalle: 'Encontrada: Calle Falsa 123, ayer',
    distancia: '4.5 km de ti',
  },
  {
    id: "3",
    tipo: 'Perro',
    nombre: 'Leo',
    estado: 'Perdido',
    descripcion: 'Pitbull, macho, cicatriz en ojo izquierdo',
    detalle: 'Perdido desde: Barrio Los Pinos, hace 2 días',
    distancia: '6.8 km de ti',
  },
  {
    id: "4",
    tipo: 'Gato',
    nombre: 'Antonio',
    estado: 'Perdido',
    descripcion: 'Naranja, macho, usa botas',
    detalle: 'Perdido desde: Barrio Los Pinos, hace 2 días',
    distancia: '1.1 km de ti',
  },
  {
    id: "5",
    tipo: 'Perro',
    nombre: 'Jake',
    estado: 'Encontrado',
    descripcion: 'Bulldog, macho, clarito',
    detalle: 'Perdido desde: Barrio Los Pinos, hace 2 días',
    distancia: '1.1 km de ti',
  },
];

export default function NearbyPetsScreen() {
  const [filtroPerdidas, setFiltroPerdidas] = useState('Todas');
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);

  const [soloConFoto, setSoloConFoto] = useState(false);
  const [menosDe5km, setMenosDe5km] = useState(false);
  
  {/*
  const renderCard = ( {item} ) => {
    const isPerdido = item.estado === 'Perdido';
    return (
      <View style={ styles.card }>

        <View style={[
            styles.badge, 
            {
              backgroundColor: isPerdido ? colors.estado.perdido.fondo : colors.estado.encontrado.fondo ,
            },
        ]}>
          <Text style={{ 
            color: isPerdido ? colors.estado.perdido.base : colors.estado.encontrado.base, fontWeight: 'bold',
          }}>
            {item.tipo}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={ styles.nombre }>
            {item.nombre}{' '}
            
            <Text style={{
                color: isPerdido ? colors.estado.perdido.base : colors.estado.encontrado.base,
            }}>
              ({item.estado})
            </Text>

          </Text>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
          <Text style={styles.detalle}>📍 {item.detalle}</Text>
          <Text style={styles.distancia}>{item.distancia}</Text>
        </View>
        <Text>ver</Text>
      </View>
    );
  };
  */}

  const mascotasFiltradas : IPet[] = data.filter( (item) => {
    if (filtroPerdidas === "Todas") return item;
    if (filtroPerdidas === "Perdidas") return item.estado === "Perdido";
    if (filtroPerdidas === "Encontradas") return item.estado === "Encontrado";
    return true;
  });

  return (
    
    <View style={styles.screen}>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Mascotas Cerca</Text>
        </View>
      <View style={styles.container}>
        {/* Encabezado */}
        {/**
        <Text style={styles.header}>Mascotas Cerca</Text>
        */}
        

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
            <Text style={ styles.filtroText}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={ [styles.botonFiltro, filtroPerdidas === "Perdidas" && styles.botonFiltroActivo] } onPress={() => setFiltroPerdidas("Perdidas")}> 
            <Text style={ styles.filtroText}>
              Perdidas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={ [styles.botonFiltro, filtroPerdidas === "Encontradas" && styles.botonFiltroActivo] } onPress={() => setFiltroPerdidas("Encontradas")}>
            <Text style={ styles.filtroText}>
              Encontradas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={ styles.botonFiltro } onPress={() => setModalFiltrosVisible(true)}>
            <Text style={ styles.filtroText}>
              Filtros
            </Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalFiltrosVisible}
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
                  style={[styles.botonFiltro, { marginTop: 20 }]}
                  onPress={() => setModalFiltrosVisible(false)}
                >
                  <Text style={styles.filtroText}>Cerrar</Text>
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
        />
        
        {/* Lista */}
        {/*
        <FlatList
          data={data}
          keyExtractor={(item: IPet) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
        */}
        <FlatList
        data= {mascotasFiltradas}
        keyExtractor={( item ) => item.id}
        renderItem={( {item} ) => <PetCard {...item} />}
        contentContainerStyle= {{ paddingBottom: 80, margin: 15 }}
        ListEmptyComponent= {
          <Text style={{ textAlign: "center", marginTop: 20, color: colors.texto.secundario }}>
            No hay mascotas {filtroPerdidas.toLowerCase()} en este momento.
          </Text>
        }
        />
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
    paddingHorizontal: 5,
    paddingTop: 20,
    borderRadius: 15,
    marginBottom: 50,
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.botones.textoPrimario,
    
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primarios.indigo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    marginBottom: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
    justifyContent: 'space-around',
    marginBottom: 12,
    marginHorizontal: 5,
  },
  botonFiltro: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.botones.secundario,
  },
  botonFiltroActivo: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    color: "#ffffffff",
    backgroundColor: colors.botones.primario,
  },
  filtroText: {
    color: colors.botones.textoSecundario,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.fondo.componentes,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.bordes.primario,
    margin: 10,
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
  },modalOverlay: {
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
});