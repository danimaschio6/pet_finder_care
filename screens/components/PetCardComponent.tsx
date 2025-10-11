import { View , Text, StyleSheet, TouchableOpacity} from "react-native"
import colors from "../../data/colors.json";

import { useNavigation } from "@react-navigation/native";

interface IPet {
  id: string
  tipo: string
  nombre: string
  estado: string
  descripcion: string
  detalle: string
  distancia: string
}

export default function PetCard(props: IPet) { 

  const navigation = useNavigation();

  {/* */}
  const handleGoToPetDetail = () => {

    navigation.navigate("NearbyPetDetailScreen", { mascota : props })
  }

  const {id, tipo, nombre, estado, descripcion, detalle, distancia } = props

  return (
    <TouchableOpacity style={ styles.card } onPress={ handleGoToPetDetail }>
      {/* Placeholder de Foto */}
      <View style={styles.petIcon}>
        <Text>{tipo}</Text>
      </View>
      
      {/* Información de la Mascota */}
      <View style={{flex:1}}>

        <Text style={styles.petName}>
          {nombre} -
          <Text style={{
            color: estado === 'Perdido' ? colors.estado.perdido.base : colors.estado.encontrado.base,
            fontWeight: 'bold',
          }}> {estado}</Text>
        </Text>

        <Text style={styles.petDescription}> {descripcion} </Text>
        <Text style={styles.petDetail}>📍 {detalle}</Text>
        <Text style={styles.petDistance}> {distancia} </Text>

      </View>

    </TouchableOpacity>
    
  )}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.fondo.app,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  petIcon: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 16,
    marginRight: 10,
    backgroundColor: "#aaaaaaff"
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.texto.primario,
  },
  petDescription: {
    fontSize: 14,
    color: colors.texto.primario,
  },
  petDetail: {
    fontSize: 13,
    color: colors.texto.primario,
    marginTop: 2,
  },
  petDistance: {
    fontSize: 12,
    color: colors.botones.primario,
    marginTop: 2,
  },
});