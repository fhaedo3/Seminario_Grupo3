import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { professionalsApi } from '../api';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';

export const SearchResultsScreen = ({ route, navigation }) => {
  const { filters } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating_desc'); // 'rating_desc' por defecto

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = {
          ...filters,
          sortBy,
        };
        // Limpiar parámetros nulos o vacíos
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === '') {
            delete params[key];
          }
        });

        const response = await professionalsApi.searchAdvanced(params);
        setResults(response.content || []);
      } catch (error) {
        console.error('Error fetching advanced search results:', error);
        Alert.alert('Error', 'No se pudieron obtener los resultados de la búsqueda.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters, sortBy]);

  const sortedResults = useMemo(() => {
    // La API ya debería devolver los resultados ordenados, pero como fallback, podemos ordenar en el cliente.
    if (sortBy === 'rating_desc') {
      return [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return results;
  }, [results, sortBy]);

  const renderProfessionalCard = (prof) => (
    <TouchableOpacity
      key={prof.id}
      style={styles.card}
      onPress={() => navigation.navigate('ProfessionalDetails', { professionalId: prof.id })}
    >
      <View style={styles.cardHeader}>
        <Image
          source={prof.avatarUrl ? { uri: prof.avatarUrl } : require('../assets/images/plomero1.png')}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.professionalName}>{prof.displayName || prof.name}</Text>
          <Text style={styles.professionalProfession}>{prof.profession}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{prof.rating?.toFixed(1) || 'N/A'}</Text>
        </View>
      </View>

      {filters.jobType && prof.matchedJobPrice != null && (
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Precio para "{filters.jobType}":</Text>
          <Text style={styles.priceValue}>${prof.matchedJobPrice.toLocaleString('es-AR')}</Text>
        </View>
      )}

      <Text style={styles.summary} numberOfLines={2}>
        {prof.summary || 'Este profesional aún no ha agregado una descripción.'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.background}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton navigation={navigation} />
          <Text style={styles.title}>Resultados de Búsqueda</Text>
        </View>

        <View style={styles.controlsHeader}>
          <Text style={styles.resultsCount}>{sortedResults.length} profesionales encontrados</Text>
          <TouchableOpacity style={styles.sortButton} onPress={() => Alert.alert('Ordenar', 'Funcionalidad de ordenamiento múltiple próximamente.')}>
            <Ionicons name="filter" size={16} color={colors.white} />
            <Text style={styles.sortButtonText}>Ordenar por Calificación</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingText}>Buscando profesionales...</Text>
          </View>
        ) : sortedResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={60} color="rgba(255,255,255,0.7)" />
            <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
            <Text style={styles.emptySubtitle}>Intenta ajustar los filtros o buscar un oficio diferente.</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {sortedResults.map(renderProfessionalCard)}
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 40 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' },
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginLeft: 16 },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsCount: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: colors.white, fontSize: 16, opacity: 0.8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 16 },
  emptyTitle: { color: colors.white, fontSize: 22, fontWeight: '700' },
  emptySubtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 16, lineHeight: 22 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: colors.white },
  headerText: { flex: 1 },
  professionalName: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  professionalProfession: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { color: colors.white, fontWeight: 'bold' },
  summary: { color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  priceSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
  },
  priceValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
