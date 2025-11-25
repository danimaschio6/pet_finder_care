import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";

interface IProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelected: (lat: number, lng: number) => void;
  onClose?: () => void;
}

const DEFAULT_REGION = {
  latitude: -31.3972539,
  longitude: -58.0173305,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

{/*
export default function LocationSelectMap({
  initialLat = -34.6037,
  initialLng = -58.3816,
  onLocationSelected,
  onClose
}: IProps) {
*/}
export default function LocationSelectMap(props: IProps) {
  const {initialLat= -34.6037, initialLng= -58.3816, onLocationSelected, onClose}= props;

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
  };

  const confirmSelection = () => {
    onLocationSelected(markerPosition.latitude, markerPosition.longitude);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: markerPosition.latitude,
          longitude: markerPosition.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={markerPosition} />
      </MapView>

      <View style={styles.panel}>
        <TouchableOpacity onPress={confirmSelection} style={[styles.btn, styles.acceptBtn]}>
          <Text style={styles.btnText}>Usar esta ubicación</Text>
        </TouchableOpacity>

        {onClose && (
          <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  panel: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  }, 
  cancelBtn: {
    backgroundColor: "#d9534f",
  }, 
  acceptBtn: {
    backgroundColor: "#4CAF50",
  }, 
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  }
});