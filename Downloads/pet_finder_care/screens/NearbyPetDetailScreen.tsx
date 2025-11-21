import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../data/colors.json";
import { useRoute } from "@react-navigation/native";

interface IPet {
  id: string
  tipo: string
  nombre: string
  estado: string
  descripcion: string
  detalle: string
  distancia: string
}

export default function NearbyPetDetailScreen() {
    const route= useRoute();
    const {mascota}= route.params as { mascota: any };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detalles de Mascota</Text>
            </View>
            <View style={styles.container}>
                <ScrollView style={styles.container}>
                    <Text style={styles.titulo}>{mascota.nombre}</Text>
                    <Text style={styles.estado}>
                        Estado:{" "}
                        <Text style={{
                        color : mascota.estado === "Perdido" ? colors.estado.perdido.base : colors.estado.encontrado.base,
                        }}
                        >
                            {mascota.estado}
                        </Text>
                    </Text>

                    <View style={styles.seccion}>
                        <Text style={styles.label}>Tipo:</Text>
                        <Text style={styles.valor}>{mascota.tipo}</Text>
                    </View>

                    <View style={styles.seccion}>
                        <Text style={styles.label}>Descripción:</Text>
                        <Text style={styles.valor}>{mascota.descripcion}</Text>
                    </View>

                    <View style={styles.seccion}>
                        <Text style={styles.label}>Detalle:</Text>
                        <Text style={styles.valor}>{mascota.detalle}</Text>
                    </View>

                    <View style={styles.seccion}>
                        <Text style={styles.label}>Distancia:</Text>
                        <Text style={styles.valor}>{mascota.distancia}</Text>
                    </View>
                    <View style={styles.mockMapa}>
                        <Text style={ styles.textMapa }>De grande quiero ser un mapa.</Text>
                    </View>
                </ScrollView>
                    
                
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
        paddingBottom: 50,
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
    container: {
        flex: 1,
        backgroundColor: colors.fondo.componentes,
        padding: 10,
        borderRadius: 20,
        marginTop: 10,
        marginHorizontal: 16,
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        color: colors.texto.primario,
        marginBottom: 10,
    },
    estado: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.texto.secundario,
    },
    seccion: {
        marginBottom: 14,
    },
    label: {
        fontWeight: "bold",
        color: colors.texto.primario,
    },
    valor: {
        color: colors.texto.secundario,
        marginTop: 2,
    },
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
    }
});