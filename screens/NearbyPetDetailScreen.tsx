import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../data/colors.json";
import { useRoute, useNavigation } from "@react-navigation/native";
import PetMap from "./components/PetMap";

import { supabase } from "../supabase/client/supabaseClient";

interface ICoords {
    latitud: number,
    longitud: number
}
interface IPet {
    id: string
    tipo: string
    nombre?: string
    estado: string
    descripcion: string
    detalle: string
    idDuenio?: number
    distancia: string
    latitud?: number
    longitud?: number
}

export default function NearbyPetDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { mascota }= route.params as { mascota: any };
    //const { mascota }= route.params as { mascota: IPet };

    const coordenadas: ICoords = {
        latitud: mascota.latitud,
        longitud: mascota.longitud,
    };

    const handleContact = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert("Atención", "Debes iniciar sesión para contactar al dueño.");
            return;
        }

        if (mascota.user_id && mascota.user_id === user.id) {
            Alert.alert("Es tu mascota", "No puedes enviarte mensajes a ti mismo.");
            return;
        }

        navigation.navigate('Mensajes', { ownerId: mascota.idDuenio, petName: mascota.nombre, avatarUrl: mascota.image_url, });
    };

    return (
        <View style={styles.screen}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={28} color={colors.botones.textoPrimario} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalles de Mascota</Text>
                <View style={styles.backButton} />
            </View>
            <View style={styles.container}>
                <ScrollView style={[styles.container, {paddingBottom: 10}]}>
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

                    {/* 
                    <View style={styles.mockMapa}>
                        <Text style={ styles.textMapa }>Mapa</Text>
                    </View>
                     */}
                    
                    <View style={{ height: 250, borderRadius: 10, overflow: "hidden", marginVertical: 16 }}>
                        <PetMap {...coordenadas} />
                    </View>

                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={handleContact}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.contactButtonText}>
                            Contactar.
                        </Text>
                    </TouchableOpacity>
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
        fontSize: 17,
        fontWeight: '600',
        color: colors.botones.textoPrimario,
        flex: 1,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.primarios.indigo,
        marginBottom: 0,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: colors.fondo.componentes,
        padding: 20,
        borderRadius: 0,
        marginTop: 0,
        marginHorizontal: 0,
    },
    titulo: {
        fontSize: 34,
        fontWeight: "700",
        color: colors.texto.primario,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    estado: {
        fontSize: 17,
        marginBottom: 24,
        color: colors.texto.secundario,
        fontWeight: '400',
    },
    seccion: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.bordes.primario,
    },
    label: {
        fontWeight: "600",
        color: colors.texto.primario,
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    valor: {
        color: colors.texto.primario,
        marginTop: 4,
        fontSize: 17,
        fontWeight: '400',
    },
    mockMapa: {
        height: 220,
        borderRadius: 12,
        backgroundColor: colors.fondo.app,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
        borderWidth: 0.5,
        borderColor: colors.bordes.primario,
    },
    textMapa:{
        color: colors.texto.secundario,
        fontSize: 15,
        fontWeight: '400',
    },
    contactButton: {
        flexDirection: 'row',
        backgroundColor: colors.primarios.indigo,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 80,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});