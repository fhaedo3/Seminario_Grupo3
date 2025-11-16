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
  const [showSortMenu, setShowSortMenu] = useState(false);

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
    } else if (sortBy === 'rating_asc') {
      return [...results].sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else if (sortBy === 'price_desc') {
      return [...results].sort((a, b) => (b.matchedJobPrice || 0) - (a.matchedJobPrice || 0));
    } else if (sortBy === 'price_asc') {
      return [...results].sort((a, b) => (a.matchedJobPrice || 0) - (b.matchedJobPrice || 0));
    }
    return results;
  }, [results, sortBy]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating_desc':
        return 'Mayor Calificación';
      case 'rating_asc':
        return 'Menor Calificación';
      case 'price_desc':
        return 'Precio: Mayor';
      case 'price_asc':
        return 'Precio: Menor';
      case 'name_asc':
        return 'Nombre: A-Z';
      case 'experience_desc':
        return 'Más Experiencia';
      default:
        return 'Ordenar';
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setShowSortMenu(false);
  };

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
          <Text style={styles.priceValue}>${Math.ceil(Number(prof.matchedJobPrice)).toLocaleString('es-AR')}</Text>
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
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={1}
        onPress={() => showSortMenu && setShowSortMenu(false)}
      >
        <View style={styles.header}>
          <BackButton navigation={navigation} />
          <Text style={styles.title}>Resultados de Búsqueda</Text>
        </View>

        <View style={styles.controlsHeader}>
          <Text style={styles.resultsCount}>{sortedResults.length} profesionales encontrados</Text>
          <View>
            <TouchableOpacity 
              style={styles.sortButton} 
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Ionicons name="filter" size={16} color={colors.white} />
              <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
              <Ionicons 
                name={showSortMenu ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.white} 
              />
            </TouchableOpacity>
            
            {showSortMenu && (
              <View style={styles.sortMenu}>
                <TouchableOpacity 
                  style={[
                    styles.sortMenuItem,
                    sortBy === 'rating_desc' && styles.sortMenuItemActive
                  ]}
                  onPress={() => handleSortChange('rating_desc')}
                >
                  <Ionicons 
                    name="star" 
                    size={18} 
                    color={sortBy === 'rating_desc' ? '#FFD700' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.sortMenuText,
                    sortBy === 'rating_desc' && styles.sortMenuTextActive
                  ]}>
                    Mayor calificación
                  </Text>
                  {sortBy === 'rating_desc' && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
                
                <View style={styles.sortMenuDivider} />
                
                <TouchableOpacity 
                  style={[
                    styles.sortMenuItem,
                    sortBy === 'rating_asc' && styles.sortMenuItemActive
                  ]}
                  onPress={() => handleSortChange('rating_asc')}
                >
                  <Ionicons 
                    name="star-outline" 
                    size={18} 
                    color={sortBy === 'rating_asc' ? '#FFD700' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.sortMenuText,
                    sortBy === 'rating_asc' && styles.sortMenuTextActive
                  ]}>
                    Menor calificación
                  </Text>
                  {sortBy === 'rating_asc' && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>

                <View style={styles.sortMenuDivider} />
                
                <TouchableOpacity 
                  style={[
                    styles.sortMenuItem,
                    sortBy === 'price_asc' && styles.sortMenuItemActive
                  ]}
                  onPress={() => handleSortChange('price_asc')}
                >
                  <Ionicons 
                    name="cash-outline" 
                    size={18} 
                    color={sortBy === 'price_asc' ? '#4CAF50' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.sortMenuText,
                    sortBy === 'price_asc' && styles.sortMenuTextActive
                  ]}>
                    Precio: Más barato
                  </Text>
                  {sortBy === 'price_asc' && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
                
                <View style={styles.sortMenuDivider} />
                
                <TouchableOpacity 
                  style={[
                    styles.sortMenuItem,
                    sortBy === 'price_desc' && styles.sortMenuItemActive
                  ]}
                  onPress={() => handleSortChange('price_desc')}
                >
                  <Ionicons 
                    name="cash" 
                    size={18} 
                    color={sortBy === 'price_desc' ? '#FF9800' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.sortMenuText,
                    sortBy === 'price_desc' && styles.sortMenuTextActive
                  ]}>
                    Precio: Más caro
                  </Text>
                  {sortBy === 'price_desc' && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>

                <View style={styles.sortMenuDivider} />
                
                <TouchableOpacity 
                  style={[
                    styles.sortMenuItem,
                    sortBy === 'experience_desc' && styles.sortMenuItemActive
                  ]}
                  onPress={() => handleSortChange('experience_desc')}
                >
                  <Ionicons 
                    name="briefcase" 
                    size={18} 
                    color={sortBy === 'experience_desc' ? '#2196F3' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.sortMenuText,
                    sortBy === 'experience_desc' && styles.sortMenuTextActive
                  ]}>
                    Más experiencia
                  </Text>
                  {sortBy === 'experience_desc' && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>

                <View style={styles.sortMenuDivider} />
                
                <TouchableOpacity 
                  style={[
                    styles.sortMenuItem,
                    sortBy === 'name_asc' && styles.sortMenuItemActive
                  ]}
                  onPress={() => handleSortChange('name_asc')}
                >
                  <Ionicons 
                    name="text" 
                    size={18} 
                    color={sortBy === 'name_asc' ? '#9C27B0' : 'rgba(255,255,255,0.7)'} 
                  />
                  <Text style={[
                    styles.sortMenuText,
                    sortBy === 'name_asc' && styles.sortMenuTextActive
                  ]}>
                    Nombre: A-Z
                  </Text>
                  {sortBy === 'name_asc' && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
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
      </TouchableOpacity>
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
  resultsCount: { color: 'rgba(255,255,255,0.8)', fontSize: 14, flex: 1 },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sortButtonText: { 
    color: colors.white, 
    fontWeight: '600', 
    fontSize: 13,
    maxWidth: 140,
  },
  sortMenu: {
    position: 'absolute',
    top: 46,
    right: 0,
    backgroundColor: 'rgba(50, 75, 135, 0.98)',
    borderRadius: 16,
    minWidth: 220,
    maxWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    zIndex: 1000,
    paddingVertical: 6,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  sortMenuItemActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  sortMenuText: {
    flex: 1,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
  sortMenuTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  sortMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 14,
    marginVertical: 2,
  },
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
