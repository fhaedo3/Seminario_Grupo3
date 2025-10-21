import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const DEFAULT_DISTANCE = 'Cualquier distancia';
const DEFAULT_PROFESSION = 'Todas';
const DEFAULT_OTHER = 'Todos';

export const FilterModal = ({ visible, onClose, onApplyFilters, initialFilters }) => {
  const [selectedDistance, setSelectedDistance] = useState(DEFAULT_DISTANCE);
  const [selectedProfession, setSelectedProfession] = useState(DEFAULT_PROFESSION);
  const [selectedOther, setSelectedOther] = useState(DEFAULT_OTHER);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedDistance(initialFilters?.distance ?? DEFAULT_DISTANCE);
    setSelectedProfession(initialFilters?.profession ?? DEFAULT_PROFESSION);
    setSelectedOther(initialFilters?.other ?? DEFAULT_OTHER);
  }, [visible, initialFilters]);

  const distances = [DEFAULT_DISTANCE, '< 5 km', '5-10 km', '10-25 km'];
  const professions = [DEFAULT_PROFESSION, 'Plomero', 'Electricista', 'Gasista'];
  const others = [DEFAULT_OTHER, 'Popular', 'Matriculado', 'Verificado'];

  const handleApply = () => {
    onApplyFilters({
      distance: selectedDistance,
      profession: selectedProfession,
      other: selectedOther,
    });
    onClose();
  };

  const FilterSection = ({ title, options, selected, onSelect, color = '#4CAF50' }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selected === option && { backgroundColor: color },
              selected !== option && styles.optionButtonInactive,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                selected === option && styles.optionTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Header with Close Button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Distance Filter */}
            <FilterSection
              title="Distancia de búsqueda"
              options={distances}
              selected={selectedDistance}
              onSelect={setSelectedDistance}
              color="#4CAF50"
            />

            {/* Profession Filter */}
            <FilterSection
              title="Profesión"
              options={professions}
              selected={selectedProfession}
              onSelect={setSelectedProfession}
              color="#2196F3"
            />

            {/* Other Filter */}
            <FilterSection
              title="Otros"
              options={others}
              selected={selectedOther}
              onSelect={setSelectedOther}
              color="#4CAF50"
            />

            {/* Apply Button */}
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#3d5a99',
    borderRadius: 24,
    width: '90%',
    maxHeight: '75%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  optionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});