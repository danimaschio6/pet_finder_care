import { Alert, StyleSheet, View , Text} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface ICoords {
  latitud: number | null;
  longitud: number | null;
  zoom?: number;
  hideMarker?: boolean;
}

export default function PetMap(props: ICoords) {
    const { latitud, longitud, zoom, hideMarker } = props;

    const noCoords =
    latitud === null ||
    longitud === null ||
    latitud === undefined ||
    longitud === undefined;
    
    if (noCoords) {
        return (
            <View style={styles.mockMapa}>
                <Text style={styles.textMapa}>Ubicación no disponible</Text>
            </View>
        );
    }
    {/*
    const getPermissions = async () => {
        let {status, ios, android, expires, granted, canAskAgain} = await Location.requestForegroundPermissionsAsync();

        if (status!== 'granted') {
            if (!canAskAgain) {
                Alert.alert("Permiso denegado", "Necesitamos que lo habilite desde la configuración de su dispositivo.",
                    [{
                        text: 'Cancelar',
                        onPress: ()=> console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {
                        text: 'OK',
                        onPress: ()=> console.log('Cancel Pressed'),
                    },
                    ]
                )
                return;
            }

            Alert.alert("Permiso denegado", "Es necesario el permiso para acceder a su ubicación", [
            {
                text: 'Cancelar',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'OK',
                onPress: () => getPermissions(),
            },
            ])
        return
        } else if (granted) {
            getLocation();
        }

    }

    useEffect(() => {
        getPermissions()
    }, []);
    */}

  return (
    <MapView 
    style= { styles.map }
    region= {{
        latitude: Number(latitud), 
        longitude: Number(longitud), 
        latitudeDelta: zoom ? zoom : 0.01,
        longitudeDelta: zoom ? zoom : 0.01,
    }} 
    scrollEnabled= { false } 
    zoomEnabled= { true } 
    showsUserLocation= { true } 
    >
        {!hideMarker && (
            <Marker coordinate= {{ latitude: Number(latitud), longitude: Number(longitud) }} />
        )}
        {/*
        <Marker 
        coordinate= {{ 
            latitude: lat, 
            longitude: long, 
        }} 
        title={ nombre } 
        description={ detalle }
        />
        */}
    </MapView>
  );
}

const styles = StyleSheet.create({
    map: { flex: 1 },
    mockMapa: {
        height: 200,
        borderRadius: 4,
        backgroundColor: "#414141ff",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 16,
    },
    textMapa:{
        color: "#ffffffff",
    },
});