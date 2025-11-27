import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import colors from "../data/colors.json";
import axios from "axios";
import env from "../env";

interface INewsArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage?: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}
export default function PetNewsScreen() {
  const [news, setNews] = useState<INewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const API_KEY = env.NEWSAPI_KEY;

  const URL = (p: number) => `https://newsapi.org/v2/everything?q=mascota&language=es&pageSize=10&page=${p}&sortBy=publishedAt&apiKey=${API_KEY}`;

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await axios.get<{ articles: INewsArticle[] }>(URL(1));
      setNews(response.data.articles);
      setHasMore(response.data.articles.length > 0);
    } catch (error) {
      console.log("Error al querer cargar noticias:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await axios.get<{ articles: INewsArticle[] }>(URL(nextPage));
      const newArticles = response.data.articles;

      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setNews((prev) => [...prev, ...newArticles]);
        setPage(nextPage);
      }
    } catch (error) {
      console.log("Error cargando más noticias:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: {item: INewsArticle }) => (
    <TouchableOpacity style={styles.card} onPress={() => Linking.openURL(item.url)}>
      {item.urlToImage && <Image source={{ uri: item.urlToImage }} style={styles.image} />}

      <View style={{ padding: 10 }}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.metaContainer}>
          {item.source?.name && (
            <Text style={styles.source}>{item.source.name}</Text>
          )}
          <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        <Text style={styles.link}>Leer más →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="gray" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Cargando noticias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
        <View style={styles.container}>
        <FlatList
        data={news}
        keyExtractor={(item) => item.url}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        />
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
    container: {
        flex: 1,
        backgroundColor: colors.fondo.componentes,
        padding: 20,
        borderRadius: 0,
        marginTop: 0,
        marginHorizontal: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    list: {
        padding: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 16,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    image: {
        width: "100%",
        height: 190,
    },
    title: {
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 6,
    },
    metaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    source: {
        fontSize: 12,
        color: "#555",
        fontWeight: "bold",
    },
    date: {
        fontSize: 12,
        color: "#777",
    },
    description: {
        fontSize: 14,
        color: "#444",
        marginBottom: 6,
    },
    link: {
        color: "#0a7bff",
        fontWeight: "bold",
        marginTop: 6,
    },
});