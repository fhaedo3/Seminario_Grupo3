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
        // El endpoint /search/advanced devuelve directamente un array, no un objeto con content
        const resultsList = Array.isArray(response) ? response : (response.content || []);
        setResults(resultsList);
      } catch (error) {
        console.error('Error fetching advanced search results:', error);
        Alert.alert('Error', 'No se pudieron obtener los resultados de la búsqueda.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters, sortBy]);

  const getEmptyMessage = () => {
    const { profession, jobType, location } = filters;
    
    const professionText = profession || 'profesionales';
    
    if (jobType && location) {
      return {
        title: 'No hay profesionales disponibles',
        subtitle: `No encontramos ${professionText} que realicen "${jobType}" en ${location}. Intenta buscar sin especificar el tipo de trabajo o el barrio.`,
      };
    }
    
    if (jobType) {
      return {
        title: 'Ningún profesional realiza este trabajo',
        subtitle: `No encontramos ${professionText} que ofrezcan el servicio "${jobType}". Intenta seleccionar otro tipo de trabajo o buscar sin especificar el servicio.`,
      };
    }
    
    if (location) {
      return {
        title: 'No hay profesionales en este barrio',
        subtitle: `No encontramos ${professionText} que trabajen en ${location}. Intenta buscar en otro barrio o sin especificar la ubicación.`,
      };
    }
    
    if (profession) {
      return {
        title: 'No se encontraron resultados',
        subtitle: `No encontramos ${professionText} disponibles. Verifica el oficio seleccionado o intenta con otro.`,
      };
    }
    
    return {
      title: 'No se encontraron resultados',
      subtitle: 'Intenta modificar los filtros de búsqueda para obtener más resultados.',
    };
  };

  const emptyMessage = getEmptyMessage();

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

      {filters.jobType && filters.jobType !== 'SIN_ESPECIFICACION' && filters.jobType !== 'OTRO' && prof.matchedJobPrice != null && (
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
            <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.6)" />
            <Text style={styles.emptyTitle}>{emptyMessage.title}</Text>
            <Text style={styles.emptySubtitle}>{emptyMessage.subtitle}</Text>
            <TouchableOpacity 
              style={styles.modifySearchButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back-outline" size={20} color={colors.white} />
              <Text style={styles.modifySearchButtonText}>Modificar búsqueda</Text>
            </TouchableOpacity>
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
  emptyTitle: { color: colors.white, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 16, lineHeight: 24 },
  modifySearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.greenButton,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  modifySearchButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
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
