import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/client/supabaseClient';
import colors from '../data/colors.json';

export default function InboxScreen() {
    const navigation = useNavigation();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Recargar la lista cada vez que entras a la pantalla
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchConversations();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Se busca las conversaciones donde soy el user_1 O user_2
            // Y traemos los datos de perfil de ambos para saber quién es el otro
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    id, 
                    user_1:profiles!user_1(id, first_name, last_name, avatar_url), 
                    user_2:profiles!user_2(id, first_name, last_name, avatar_url)
                    `);

            if (error) throw error;

            // Filtro para mostrar solo los datos del "otro" usuario
            const formattedData = data.map(chat => {
                const amIUser1 = chat.user_1.id === user.id;
                const otherUser = amIUser1 ? chat.user_2 : chat.user_1;

                // Si no hay datos del otro usuario, ponemos algo genérico
                const nombre = otherUser ? `${otherUser.first_name || 'Usuario'} ${otherUser.last_name || ''}` : 'Usuario desconocido';
                const avatar = otherUser?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/616/616408.png';

                return {
                    id: chat.id,
                    otherUserId: otherUser?.id,
                    name: nombre,
                    avatar: avatar,
                };
            });

            setConversations(formattedData);
        } catch (error) {
            console.error('Error cargando inbox:', error);
        } finally {
            setLoading(false);
        }
    };

    const openChat = (item) => {
        // Reutilizo la pantalla de Chat.js 
        navigation.navigate('Mensajes', {
            ownerId: item.otherUserId, // ID del otro usuario
            petName: item.name,        // Usamos su nombre como título del chat
            avatarUrl: item.avatar,    // Su foto
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.chatRow} onPress={() => openChat(item)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtext}>Toca para abrir chat...</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secundarios.gris} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Mensajes</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primarios.indigo} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No tienes conversaciones activas.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.fondo.app },
    header: {
        backgroundColor: colors.primarios.indigo,
        paddingTop: 50,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    list: { padding: 16 },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.fondo.componentes,
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        elevation: 2,
    },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: 'bold', color: colors.texto.primario },
    subtext: { fontSize: 14, color: colors.texto.secundario },
    empty: { textAlign: 'center', marginTop: 50, color: colors.texto.secundario },
});