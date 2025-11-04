import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { reviewRepliesApi } from '../api';
import { useAuth } from '../context/AuthContext';

export const ReplyToReview = ({ navigation, route }) => {
  const { review } = route.params;
  const { token } = useAuth();
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingReply, setExistingReply] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar respuesta existente si existe
  useEffect(() => {
    const loadExistingReply = async () => {
      if (!review?.reply) {
        setIsLoading(false);
        return;
      }

      try {
        setExistingReply(review.reply);
        setReply(review.reply.reply);
        setIsEditMode(true);
      } catch (error) {
        console.error('Error loading existing reply:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingReply();
  }, [review]);

  const handleSubmit = async () => {
    if (!reply.trim()) {
      Alert.alert('Error', 'Por favor escribí tu respuesta');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Necesitás iniciar sesión para responder');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && existingReply) {
        // EDITAR respuesta existente
        await reviewRepliesApi.update(token, existingReply.id, { reply });

        Alert.alert(
          '¡Respuesta actualizada!',
          'Tu respuesta fue actualizada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // CREAR nueva respuesta
        await reviewRepliesApi.create(token, {
          reviewId: review.id,
          reply,
        });

        Alert.alert(
          '¡Respuesta enviada!',
          'Tu respuesta fue publicada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      
      let errorMessage = isEditMode
        ? 'No se pudo actualizar tu respuesta. Intentá nuevamente.'
        : 'No se pudo publicar tu respuesta. Intentá nuevamente.';
      
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
      'Eliminar respuesta',
      '¿Estás seguro de que querés eliminar tu respuesta? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!existingReply || !token) {
              return;
            }

            setIsDeleting(true);

            try {
              await reviewRepliesApi.delete(token, existingReply.id);

              Alert.alert(
                'Respuesta eliminada',
                'Tu respuesta fue eliminada exitosamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error al eliminar respuesta:', error);
              Alert.alert('Error', 'No se pudo eliminar la respuesta. Intentá nuevamente.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.primaryBlue, colors.secondaryBlue]}
        style={styles.background}
      >
        <StatusBar style="light" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Cargando...</Text>
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <BackButton navigation={navigation} />
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Editar Respuesta' : 'Responder Reseña'}
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
                    color={isDeleting ? colors.mutedText : '#ff4757'}
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
          {/* Review Original */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.white} />
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewUser}>{review.userDisplayName || review.userId}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>

          {/* Mensaje informativo */}
          {isEditMode && (
            <View style={styles.editModeBanner}>
              <Ionicons name="create-outline" size={24} color={colors.white} />
              <Text style={styles.editModeText}>
                Estás editando tu respuesta. Podés modificarla o eliminarla.
              </Text>
            </View>
          )}

          {/* Campo de respuesta */}
          <View style={styles.replyInputContainer}>
            <Text style={styles.label}>Tu respuesta:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Escribí tu respuesta aquí..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={reply}
              onChangeText={setReply}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Respondé de manera profesional y cordial. Esta respuesta será visible para todos.
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!reply.trim() || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!reply.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'ACTUALIZAR RESPUESTA' : 'ENVIAR RESPUESTA'}
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
                    <Text style={styles.deleteButtonText}>ELIMINAR RESPUESTA</Text>
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
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    marginTop: 12,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    width: 44,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewUser: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewComment: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  editModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  editModeText: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  replyInputContainer: {
    marginBottom: 24,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    color: colors.white,
    fontSize: 15,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  helperText: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.7,
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
    fontWeight: '700',
    letterSpacing: 1,
  },
});

