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

export const SearchProfessionalsScreen = ({ navigation }) => {

  const handleMissingScreen = (values) => {
    console.log('Pantalla no implementada aun', values);
  };

  const handleFilterModalOpen = (values) => {
    setFilterModalVisible(true)
  }

  const handleApplyFilters = (values) => {
    console.log('hacer coso...');
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
          <Text style={styles.title}>Buscá profesionales</Text>
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
          {professionals.map((prof) => (
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
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={handleMissingScreen}>
            <Ionicons name="home" size={24} color={colors.white} />
            <Text style={styles.navText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleMissingScreen}>
            <Ionicons name="search" size={24} color={colors.white} />
            <Text style={styles.navText}>Buscar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleMissingScreen}>
            <Ionicons name="briefcase" size={24} color={colors.white} />
            <Text style={styles.navText}>Mis Trabajos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleMissingScreen}>
            <Ionicons name="person" size={24} color={colors.white} />
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
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
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "700",
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
    paddingBottom: 100,
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: colors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 4,
  },
});
