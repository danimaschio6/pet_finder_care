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
        <TouchableOpacity onPress={confirmSelection} style={styles.btnConfirm}>
          <Text style={styles.btnText}>Usar esta ubicación</Text>
        </TouchableOpacity>

        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.btnCancel}>
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
    width: "100%",
    alignItems: "center",
  },
  btnConfirm: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 8
  },
  btnCancel: {
    backgroundColor: "#d9534f",
    padding: 14,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  }
});