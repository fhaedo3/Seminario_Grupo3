import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { FilterModal } from '../components/ProfessionalsFilters';
import { BottomNav } from '../components/BottomNav';
import { professionalsApi } from '../api';

export const SearchProfessionalsScreen = ({ navigation }) => {

  const handleFilterModalOpen = () => {
    setFilterModalVisible(true)
  }

  const handleApplyFilters = (values) => {
    setFilters(values);
    setFilterModalVisible(false);
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    distance: 'Cualquier distancia',
    profession: 'Todas',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [professionOptions, setProfessionOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const matchesDistanceFilter = (distanceKm, selectedRange) => {
    if (selectedRange === 'Cualquier distancia') {
      return true;
    }

    if (typeof distanceKm !== 'number') {
      return false;
    }

    switch (selectedRange) {
      case '< 5 km':
        return distanceKm < 5;
      case '5-10 km':
        return distanceKm >= 5 && distanceKm <= 10;
      case '10-25 km':
        return distanceKm > 10 && distanceKm <= 25;
      default:
        return true;
    }
  };

  const maxDistanceParam = useMemo(() => {
    switch (filters.distance) {
      case '< 5 km':
        return 5;
      case '5-10 km':
        return 10;
      case '10-25 km':
        return 25;
      default:
        return undefined;
    }
  }, [filters.distance]);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: 0,
        size: 30,
      };

      if (searchTerm?.trim()) {
        params.search = searchTerm.trim();
      }
      if (filters.profession && filters.profession !== 'Todas') {
        params.profession = filters.profession;
      }
      if (maxDistanceParam) {
        params.maxDistance = maxDistanceParam;
      }

      const response = await professionalsApi.search(params);
      const content = Array.isArray(response?.content) ? response.content : [];
      setResults(content);

      const professionsSet = new Set();
      const tagsSet = new Set();
      content.forEach((item) => {
        if (item.profession) {
          professionsSet.add(item.profession);
        }
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag) => tagsSet.add(tag));
        }
      });
      setProfessionOptions(Array.from(professionsSet));
      setTagOptions(Array.from(tagsSet));
    } catch (err) {
      console.error('Error fetching professionals', err);
      setError(err?.message ?? 'No se pudieron cargar los profesionales');
    } finally {
      setLoading(false);
    }
  }, [filters.profession, maxDistanceParam, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProfessionals();
    }, 350);

    return () => clearTimeout(debounce);
  }, [fetchProfessionals]);

  const filteredProfessionals = useMemo(() => {
    return results.filter((prof) => {
      const distanceOk = matchesDistanceFilter(prof.distanceKm ?? 0, filters.distance);
      return distanceOk;
    });
  }, [results, filters.distance]);

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.background}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Buscar</Text>
          <Text style={styles.subtitle}>Encontrá profesionales de confianza</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por oficio o nombre"
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity style={styles.filterButton} onPress={handleFilterModalOpen}>
              <Ionicons name="options" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Professionals List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.loadingText}>Buscando profesionales...</Text>
            </View>
          ) : filteredProfessionals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={40} color={colors.white} />
              <Text style={styles.emptyTitle}>No encontramos profesionales</Text>
              <Text style={styles.emptySubtitle}>Ajustá los filtros o intentá con otro término</Text>
            </View>
          ) : (
            filteredProfessionals.map((prof) => (
              <View key={prof.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Image
                    source={prof.avatarUrl ? { uri: prof.avatarUrl } : require('../assets/images/plomero1.png')}
                    style={styles.profileImage}
                  />
                  <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                      <View style={styles.textContainer}>
                        <Text style={styles.name}>{prof.displayName || prof.name}</Text>
                        <Text style={styles.profession}>
                          {prof.profession} - {prof.experienceYears ?? 0} Año
                          {(prof.experienceYears ?? 0) !== 1 ? "s" : ""} de Exp
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(prof.id)}
                        style={styles.starButton}
                      >
                        <Ionicons
                          name={favorites.has(prof.id) ? "star" : "star-outline"}
                          size={24}
                          color="#FFD700"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.description}>{prof.summary || 'Consultá para conocer más detalles.'}</Text>
                    
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.statValue}>
                          {prof.rating != null ? prof.rating.toFixed(2) : 'N/D'}
                        </Text>
                        <Text style={styles.statLabel}>Calificación</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Ionicons name="briefcase-outline" size={16} color="#FFF" />
                        <Text style={styles.statValue}>{prof.experienceYears ?? 0}</Text>
                        <Text style={styles.statLabel}>Años exp.</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Ionicons name="people-outline" size={16} color="#FFF" />
                        <Text style={styles.statValue}>{prof.reviewsCount ?? 0}</Text>
                        <Text style={styles.statLabel}>Opiniones</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.fullWidthAction}
                    onPress={() =>
                      navigation.navigate('ProfessionalDetails', {
                        professionalId: prof.id,
                      })
                    }
                  >
                    <Ionicons name="person-circle-outline" size={18} color={colors.white} />
                    <Text style={styles.secondaryActionText}>Ver perfil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        </ScrollView>

        <BottomNav navigation={navigation} />
      </KeyboardAvoidingView>
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        professionOptions={professionOptions}
        tagOptions={tagOptions}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    backgroundColor: colors.primaryBlue,
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    color: colors.white,
    opacity: 0.8,
  },
  errorMessage: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
  },
  cardContent: {
    flexDirection: "row",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  profession: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 8,
  },
  starButton: {
    marginLeft: 8,
  },
  description: {
    color: colors.white,
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12,
  },
  fullWidthAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.greenButton,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryActionText: {
    color: colors.white,
    fontWeight: "600",
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  secondaryActionText: {
    color: colors.white,
    fontWeight: "600",
  },
});
