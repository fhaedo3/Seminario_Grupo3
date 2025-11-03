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
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BackButton } from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { reviewsApi } from '../api';

export const ReviewProfessional = ({ navigation, route }) => {
  const job = route.params;
  const { professional, jobDetails } = {
    professional: job.professional,
    jobDetails: {
      description: job.issue,
      startDate: job.scheduledAt,
    },
  };

  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tags = [
    "Puntualidad",
    "Cordialidad",
    "Precio",
    "Comunicación",
    "Prolijidad",
    "Compromiso",
  ];

  // Verificar si el usuario ya dejó una review
  React.useEffect(() => {
    const checkExistingReview = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      const professionalId = job.professionalId || professional.id;
      
      if (!professionalId) {
        setIsLoading(false);
        return;
      }

      try {
        const review = await reviewsApi.getUserReview(token, professionalId);
        if (review) {
          setExistingReview(review);
          // Cargar la review existente para editarla
          setRating(review.rating);
          
          // Extraer tags del comentario si existen
          const tagRegex = /^\[Tags: (.*?)\] /;
          const match = review.comment.match(tagRegex);
          if (match) {
            const tags = match[1].split(', ');
            setSelectedTags(new Set(tags));
            setComment(review.comment.replace(tagRegex, ''));
          } else {
            setComment(review.comment);
          }
          
          setIsEditMode(true);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        // Si no se encuentra review (404), está bien - puede crear una nueva
        console.log('No hay review existente, puede crear una nueva');
        setIsLoading(false);
      }
    };

    checkExistingReview();
  }, [token, job, professional, navigation]);

  const toggleTag = (tag) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (rating === 0) {
      Alert.alert('Error', 'Por favor seleccioná una calificación');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Por favor escribí un comentario');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Necesitás iniciar sesión para dejar una reseña');
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar el payload
      // Incluir los tags en el comentario si fueron seleccionados
      let finalComment = comment;
      if (selectedTags.size > 0) {
        const tagsArray = Array.from(selectedTags);
        finalComment = `[Tags: ${tagsArray.join(', ')}] ${comment}`;
      }

      if (isEditMode && existingReview) {
        // EDITAR review existente
        const updateData = {
          rating: rating,
          comment: finalComment,
        };

        await reviewsApi.update(token, existingReview.id, updateData);

        Alert.alert(
          '¡Reseña actualizada!',
          'Tu opinión fue actualizada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // CREAR nueva review
        const professionalId = job.professionalId || professional.id;
        
        if (!professionalId) {
          Alert.alert('Error', 'No se pudo identificar al profesional');
          return;
        }

        const reviewData = {
          professionalId: professionalId,
          rating: rating,
          comment: finalComment,
        };

        await reviewsApi.create(token, reviewData);

        Alert.alert(
          '¡Reseña publicada!',
          'Tu opinión ayuda a otros usuarios a elegir el mejor profesional.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      
      let errorMessage = isEditMode 
        ? 'No se pudo actualizar tu reseña. Intentá nuevamente.'
        : 'No se pudo publicar tu reseña. Intentá nuevamente.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar reseña',
      '¿Estás seguro de que querés eliminar tu reseña? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!existingReview || !token) {
              return;
            }

            setIsDeleting(true);

            try {
              await reviewsApi.delete(token, existingReview.id);

              Alert.alert(
                'Reseña eliminada',
                'Tu reseña fue eliminada exitosamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error al eliminar reseña:', error);
              Alert.alert('Error', 'No se pudo eliminar la reseña. Intentá nuevamente.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.primaryBlue, colors.secondaryBlue]}
        style={styles.background}
      >
        <StatusBar style="light" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Verificando...</Text>
        </View>
      </LinearGradient>
    );
  }

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
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Editar tu Reseña' : 'Contános tu Experiencia'}
            </Text>
            <View style={styles.headerActions}>
              {isEditMode && (
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={24} 
                    color={isDeleting ? colors.mutedText : "#ff4757"} 
                  />
                </TouchableOpacity>
              )}
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

          {/* Mensaje si está editando */}
          {isEditMode && (
            <View style={styles.editModeBanner}>
              <Ionicons name="create-outline" size={24} color={colors.white} />
              <Text style={styles.editModeText}>
                Estás editando tu reseña. Podés modificarla o eliminarla.
              </Text>
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'ACTUALIZAR RESEÑA' : 'ENVIAR RESEÑA'}
                </Text>
              )}
            </TouchableOpacity>

            {isEditMode && (
              <TouchableOpacity
                style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color={colors.white} />
                    <Text style={styles.deleteButtonText}>ELIMINAR RESEÑA</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 16,
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
  editModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  editModeText: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
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
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});