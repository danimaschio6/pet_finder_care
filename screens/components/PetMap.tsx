import { Alert, StyleSheet, View , Text} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface ICoords {
  lat: number,
  long: number
}

export default function PetMap(props: ICoords) {
    const { lat, long } = props;
    
    if (!lat || !long) {
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
    initialRegion= {{
        latitude: lat, 
        longitude: long, 
        latitudeDelta: 0.01, 
        longitudeDelta: 0.01, 
    }} 
    scrollEnabled= { false } 
    zoomEnabled= { false } 
    showsUserLocation= { true } 
    >
        <Marker 
        coordinate= {{ 
            latitude: lat, 
            longitude: long, 
        }} 
        />
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