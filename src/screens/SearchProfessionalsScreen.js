import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { professionals } from "../assets/data/plomerosdata";
import { FilterModal } from '../components/ProfessionalsFilters'; // Adjust path
import { BottomNav } from '../components/BottomNav';

export const SearchProfessionalsScreen = ({ navigation }) => {

  const handleFilterModalOpen = () => {
    setFilterModalVisible(true)
  }

  const handleApplyFilters = (values) => {
    setFilters(values);
    setFilterModalVisible(false);
  }

  const [searchTerm, setSearchTerm] = useState("Plomero");
  const [favorites, setFavorites] = useState(new Set());
  const [filterModalVisible, setFilterModalVisible] = useState(false); 
  const [filters, setFilters] = useState(null);

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const filteredProfessionals = professionals.filter((prof) => {
    const term = (searchTerm || '').toLowerCase();
    const matchesTerm = prof.name?.toLowerCase().includes(term) || prof.profession?.toLowerCase().includes(term);
    const matchesProfession = filters?.profession ? prof.profession === filters.profession : true;
    return matchesTerm && matchesProfession;
  });

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
              placeholder="Plomero"
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
          {filteredProfessionals.map((prof) => (
            <View key={prof.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Image source={prof.image} style={styles.profileImage} />
                <View style={styles.infoContainer}>
                  <View style={styles.headerRow}>
                    <View style={styles.textContainer}>
                      <Text style={styles.name}>{prof.name}</Text>
                      <Text style={styles.profession}>
                        {prof.profession} - {prof.experience} Año
                        {prof.experience !== 1 ? "s" : ""} de Exp
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
                  <Text style={styles.description}>{prof.description}</Text>
                </View>
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={() =>
                    navigation.navigate('Chat', {
                      professional: {
                        name: prof.name,
                        profession: prof.profession,
                        avatar: prof.image,
                      },
                      jobSummary: `Consulta sobre ${prof.profession.toLowerCase()}`,
                    })
                  }
                >
                  <Ionicons name="chatbubble-ellipses" size={18} color={colors.white} />
                  <Text style={styles.primaryActionText}>Chatear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() =>
                    navigation.navigate('ProfessionalDetails', {
                      professionalId: prof.id, // ← pasamos el ID del profesional
                    })
                  }
                >
                  <Ionicons name="person-circle-outline" size={18} color={colors.white} />
                  <Text style={styles.secondaryActionText}>Ver perfil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        
      </KeyboardAvoidingView>
      
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
    paddingTop: 16,
    paddingBottom: 8,
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
    paddingBottom: 160,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12,
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
