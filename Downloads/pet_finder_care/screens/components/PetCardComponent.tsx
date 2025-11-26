import { View , Text, StyleSheet, TouchableOpacity, Image} from "react-native"
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
  image_url?: string
}

export default function PetCard(props: IPet) { 

  const navigation = useNavigation();

  {/* */}
  const handleGoToPetDetail = () => {

    navigation.navigate("NearbyPetDetailScreen", { mascota : props })
  }

  const {id, tipo, nombre, estado, descripcion, detalle, distancia, image_url } = props

  // Obtener URL pública de la imagen desde Supabase Storage
  const getImageUrl = () => {
    if (!image_url) return null;
    // Si ya es una URL completa (como las que devuelve getPublicUrl), retornarla directamente
    if (image_url.startsWith('http://') || image_url.startsWith('https://')) {
      return image_url;
    }
    // Si es solo el nombre del archivo, construir la URL pública
    // Esto es un fallback por si acaso
    return null; // Por ahora, si no es URL completa, no mostramos imagen
  };

  const imageUrl = getImageUrl();

  return (
    <TouchableOpacity style={ styles.card } onPress={ handleGoToPetDetail }>
      {/* Foto de la Mascota o Placeholder */}
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.petImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.petIcon}>
          <Text>{tipo}</Text>
        </View>
      )}
      
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
    width: 60,
    height: 60,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    marginRight: 10,
    backgroundColor: "#aaaaaaff",
    justifyContent: 'center',
    alignItems: 'center',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
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