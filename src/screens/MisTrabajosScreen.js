// src/screens/MisTrabajosScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  SectionList,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // ¡Importamos los íconos!
import { colors } from '../theme/colors';
import JobCard from '../components/JobCard';

// --- DATOS DE EJEMPLO (MOCK DATA) ---
const MOCK_DATA = [
  {
    title: 'En Realizacion',
    data: [
      {
        id: '1',
        status: 'En Realizacion',
        dates: '05/08/25 - ',
        name: 'Pedro Gonzales',
        description: 'Arreglo de escape de gas, nuevas conexiones.',
        image: require('../assets/images/plomero1.png'), // Ajusta la ruta!
      },
    ],
  },
  {
    title: 'Pendiente',
    data: [
      {
        id: '2',
        status: 'Pendiente',
        dates: '20/08/25 - 22/08/25',
        name: 'Jonathan Leguizamon',
        description: 'Arreglo de escape de gas, nuevas conexiones.',
        image: require('../assets/images/plomero2.png'), // Ajusta la ruta!
      },
    ],
  },
  {
    title: 'Completado',
    data: [
      {
        id: '3',
        status: 'Completado',
        dates: '10/06/25 - 10/06/25',
        name: 'Gustavo Roman',
        description: 'Arreglo de escape de gas, nuevas conexiones.',
        image: require('../assets/images/plomero3.png'), // Ajusta la ruta!
      },
    ],
  },
];
// --- FIN DE DATOS DE EJEMPLO ---

const MisTrabajosScreen = () => {
  // --- ESTADO PARA LA BÚSQUEDA ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(MOCK_DATA);

  // --- LÓGICA DE FILTRADO ---
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(MOCK_DATA); // Si no hay búsqueda, mostrar todo
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      
      const newData = MOCK_DATA.map(section => {
        // 1. Filtrar los trabajos dentro de cada sección
        const data = section.data.filter(item => 
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.description.toLowerCase().includes(lowerCaseQuery)
        );
        // 2. Devolver la sección con los datos filtrados
        return {
          ...section,
          data: data,
        };
      }).filter(section => section.data.length > 0); // 3. Quitar secciones que quedaron vacías

      setFilteredData(newData);
    }
  }, [searchQuery]); // Se ejecuta cada vez que 'searchQuery' cambia

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Trabajos Contratados</Text>

          {/* Barra de Búsqueda y Filtro */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o descripción..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery} // Conectado al estado
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              {/* Ícono real en lugar de la "F" */}
              <Ionicons name="options" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Lista de Trabajos por Sección */}
          <SectionList
            sections={filteredData} // Usamos los datos filtrados
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <JobCard item={item} />}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.header}>{title}</Text>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            // Mensaje si no hay resultados
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontraron trabajos.</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 16 : 30, // Ajuste para el paddingTop
  },
  title: {
    fontSize: 32, // Más grande, como en tu otra pantalla
    fontWeight: '700',
    color: colors.white, // Color blanco
    marginLeft: 24, // Consistente con tu otra pantalla
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 24, // Consistente
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
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
    width: 48,
    height: 48,
    backgroundColor: colors.primaryBlue, // Color de botón
    borderRadius: 12, // Consistente
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightGray, // Color claro para fondo oscuro
    backgroundColor: 'transparent', // Fondo transparente
    paddingHorizontal: 24, // Consistente
    paddingVertical: 10,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedText, // Color de texto sutil
  },
});

export default MisTrabajosScreen;