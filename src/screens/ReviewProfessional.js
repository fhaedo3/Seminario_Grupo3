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
import { BackButton } from '../components/BackButton';

export const ReviewProfessional = ({ navigation, route }) => {
  const job = route.params;
  const { professional, jobDetails } = {
    professional: job.professional,
    jobDetails: {
      description: job.issue,
      startDate: job.scheduledAt,
    },
  };

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [comment, setComment] = useState("");

  const tags = [
    "Puntualidad",
    "Cordialidad",
    "Precio",
    "Comunicación",
    "Prolijidad",
    "Compromiso",
  ];

  const toggleTag = (tag) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const handleSubmit = () => {
    // Aquí enviarías la calificación al backend
    console.log({
      professional: professional.name,
      rating,
      tags: Array.from(selectedTags),
      comment,
    });
    
    // Navegar de vuelta o mostrar confirmación
    navigation.goBack();
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
          <View style={styles.headerTopRow}>
            <BackButton navigation={navigation} />
            <Text style={styles.headerTitle}>Contános tu Experiencia</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="attach-outline" size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="ellipsis-vertical" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Professional Card */}
          <View style={styles.professionalCard}>
            <Image source={professional.avatar} style={styles.professionalImage} />
            <Text style={styles.questionText}>
              ¿Cómo fue tu experiencia con{"\n"}
              {professional.name} - {professional.profession}?
            </Text>
            
            <View style={styles.jobDetailsCard}>
              <Text style={styles.jobDetailsTitle}>Trabajo Realizado:</Text>
              <Text style={styles.jobDetailsText}>"{jobDetails.description}"</Text>
              <Text style={styles.jobDetailsDate}>
                {jobDetails.startDate}
              </Text>
            </View>
          </View>

          {/* Rating Stars */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={48}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>
              ¿Qué fue lo mejor? / ¿Qué podría mejorar?
            </Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    selectedTags.has(tag) && styles.tagSelected,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.has(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>
              ¿Querés dejar algún comentario?
            </Text>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Buen tipo, labura bien. Cobro un precio justo. Cuelga en responder mensajes nomas"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              rating === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={styles.submitButtonText}>ENVIAR</Text>
          </TouchableOpacity>
        </ScrollView>
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
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  professionalCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  professionalImage: {
    width: 160,
    height: 160,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  questionText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  jobDetailsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  jobDetailsTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  jobDetailsText: {
    color: colors.white,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 8,
  },
  jobDetailsDate: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.8,
  },
  ratingContainer: {
    backgroundColor: "rgba(100, 150, 255, 0.3)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  starButton: {
    padding: 4,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsSectionTitle: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  tag: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tagSelected: {
    backgroundColor: colors.greenButton,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  tagText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  tagTextSelected: {
    color: colors.white,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentTitle: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  commentInputContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  commentInput: {
    fontSize: 14,
    color: "#333",
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});