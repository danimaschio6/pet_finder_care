import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import colors from "../data/colors.json";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
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

export default function NearbyPetDetailScreen() {
    const route = useRoute();

    //<any> para evitar el error de TypeScript
    const navigation = useNavigation<any>();

    const { mascota } = route.params as { mascota: any };

    const handleContact = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert("Atención", "Debes iniciar sesión para contactar al dueño.");
            return;
        }

        if (mascota.user_id && mascota.user_id === user.id) {
            Alert.alert("¡Es tu mascota!", "No puedes enviarte mensajes a ti mismo.");
            return;
        }

        navigation.navigate('Mensajes', {
            ownerId: mascota.user_id,
            petName: mascota.nombre,
            avatarUrl: mascota.image_url,
        });
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detalles de Mascota</Text>
            </View>

            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.titulo}>{mascota.nombre}</Text>

                    <Text style={styles.estado}>
                        Estado:{" "}
                        <Text style={{
                            color: mascota.estado === "Perdido" ? colors.estado.perdido.base : colors.estado.encontrado.base,
                            fontWeight: 'bold'
                        }}>
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
                        <Text style={styles.textMapa}>De grande quiero ser un mapa.</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={handleContact}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.contactButtonText}>
                            Contactar Dueño
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
        paddingBottom: 20,
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
        marginTop: 5,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    scrollContainer: {
        flex: 1,
    },
    titulo: {
        fontSize: 24,
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
        fontSize: 16,
        color: colors.texto.primario,
    },
    valor: {
        color: colors.texto.secundario,
        marginTop: 2,
        fontSize: 15,
    },
    mockMapa: {
        height: 180,
        borderRadius: 12,
        backgroundColor: "#414141",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
    },
    textMapa: {
        color: "#fff",
        opacity: 0.8
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
        marginBottom: 20,
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