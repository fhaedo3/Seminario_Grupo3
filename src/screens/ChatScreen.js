import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../components/BackButton';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { messagesApi } from '../api';
import { withBaseUrl } from '../config/api';
import { cloudinaryConfig } from '../config/cloudinary';

const fallbackProfessional = {
    name: 'Jonathan Leguizamón',
    avatar: require('../assets/images/plomero3.png'),
    profession: 'Plomero',
};

export const ChatScreen = ({ navigation, route }) => {
    const professional = route?.params?.professional ?? fallbackProfessional;
    const jobSummary = route?.params?.jobSummary ?? 'Detalle del trabajo';
    const conversationSeed = route?.params?.initialMessages ?? [];
    const serviceOrderId = route?.params?.serviceOrderId ?? null;
    const jobStatus = route?.params?.jobStatus ?? null;
    const { token, user, username } = useAuth();

    const [messages, setMessages] = useState(() => [...conversationSeed]);
    const [inputText, setInputText] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [completeJobModalVisible, setCompleteJobModalVisible] = useState(false);
    const [cancelJobModalVisible, setCancelJobModalVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [completingJob, setCompletingJob] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancellingJob, setCancellingJob] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const scrollViewRef = useRef();

    // Lista básica de emojis comunes
    const basicEmojis = [
        '😀', '😃', '😄', '😊', '😍', '🥰', '😘', '🤗',
        '👍', '👌', '👏', '🙌', '💪', '🤝', '👋', '🙏',
        '❤️', '💙', '💚', '💛', '🧡', '💜', '💯', '🔥',
        '⭐', '✨', '🎉', '🎊', '🤔', '😅', '😂', '🤣'
    ];

    const avatarSource = professional.avatarUrl 
        ? { uri: professional.avatarUrl } 
        : require('../assets/images/plomero1.png');
    const professionalName = professional.name || professional.displayName || 'Profesional';
    const professionalProfession = professional.profession || 'Especialista';

    const senderId = useMemo(() => user?.id || username || 'usuario', [user?.id, username]);
    const canSendMessages = Boolean(serviceOrderId && token);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    useEffect(() => {
        if (!serviceOrderId || !token) {
            setMessages(Array.isArray(conversationSeed) ? [...conversationSeed] : []);
            return;
        }

        setLoadingMessages(true);
        messagesApi
            .list(token, serviceOrderId, { page: 0, size: 100 })
            .then((response) => {
                const loadedMessages = Array.isArray(response?.content)
                    ? response.content.map((msg) => ({
                          id: msg.id,
                          text: msg.content,
                          sender: msg.senderType === 'USER' ? 'user' : 'professional',
                          createdAt: msg.createdAt,
                          attachmentUrl: msg.attachmentUrl,
                      }))
                    : [];
                setMessages(loadedMessages);
            })
            .catch((error) => {
                console.error('Error fetching chat messages', error);
                Alert.alert('No se pudieron cargar los mensajes, mostrando historial local.');
                setMessages(Array.isArray(conversationSeed) ? [...conversationSeed] : []);
            })
            .finally(() => {
                setLoadingMessages(false);
            });
    }, [serviceOrderId, token]); // Removida dependencia conversationSeed

    const handleSend = async () => {
        if (inputText.trim() === '' && !selectedImage) {
            return;
        }

        if (!canSendMessages) {
            Alert.alert('No puedes enviar mensajes todavía', 'Creá una solicitud para activar el chat.');
            return;
        }

        setSending(true);
        setUploadingImage(true);

        try {
            let attachmentUrl = null;

            // Si hay imagen seleccionada, subirla primero a Cloudinary
            if (selectedImage) {
                try {
                    attachmentUrl = await uploadImageToCloudinary(selectedImage);
                } catch (uploadError) {
                    Alert.alert('Error al subir imagen', 'No se pudo subir la imagen. Intenta nuevamente.');
                    setSending(false);
                    setUploadingImage(false);
                    return;
                }
            }

            const payload = {
                senderType: 'USER',
                senderId,
                content: inputText.trim() || '📷 Imagen',
                attachmentUrl,
            };

            const response = await messagesApi.send(token, serviceOrderId, payload);
            
            const newMessage = {
                id: response.id,
                text: response.content,
                sender: response.senderType === 'USER' ? 'user' : 'professional',
                createdAt: response.createdAt,
                attachmentUrl: response.attachmentUrl,
            };
            
            setMessages((prev) => [...prev, newMessage]);
            setInputText('');
            setSelectedImage(null);
            Keyboard.dismiss();
        } catch (error) {
            console.error('Error sending message', error);
            Alert.alert('No se pudo enviar el mensaje', error?.message ?? 'Intentá nuevamente más tarde.');
        } finally {
            setSending(false);
            setUploadingImage(false);
        }
    };

    const handleEmojiPress = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiSelect = (emoji) => {
        setInputText(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleSelectImage = async () => {
        if (!canSendMessages) {
            Alert.alert('No puedes enviar imágenes todavía', 'Creá una solicitud para activar el chat.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
                setShowEmojiPicker(false);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const uploadImageToCloudinary = async (imageUri) => {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();
        formData.append('file', { uri: imageUri, name: filename, type });
        formData.append('upload_preset', cloudinaryConfig.upload_preset);
        formData.append('cloud_name', cloudinaryConfig.cloud_name);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const data = await response.json();
            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error('No se pudo obtener la URL de la imagen');
            }
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    const handleViewProfile = () => {
        setMenuVisible(false);
        if (professional.id) {
            navigation.navigate('ProfessionalDetails', { professionalId: professional.id });
        } else {
            Alert.alert('Perfil no disponible', 'No se pudo cargar el perfil del profesional.');
        }
    };

    const handleDeleteConversation = () => {
        setMenuVisible(false);
        Alert.alert(
            'Borrar conversación',
            '¿Estás seguro de que querés borrar esta conversación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Borrar localmente primero para respuesta rápida
                            setMessages([]);
                            
                            // Si hay serviceOrderId y token, borrar del backend
                            if (serviceOrderId && token) {
                                await messagesApi.deleteAll(token, serviceOrderId);
                                Alert.alert('Conversación borrada', 'La conversación ha sido eliminada permanentemente.');
                            } else {
                                Alert.alert('Conversación borrada', 'La conversación ha sido eliminada localmente.');
                            }
                        } catch (error) {
                            console.error('Error deleting conversation:', error);
                            Alert.alert('Error', 'No se pudo borrar la conversación del servidor, pero se eliminó localmente.');
                        }
                    },
                },
            ]
        );
    };

    const handleCompleteJobPress = () => {
        if (jobStatus === 'COMPLETED') {
            Alert.alert('Trabajo ya completado', 'Este trabajo ya ha sido marcado como completado.');
            setMenuVisible(false);
            return;
        }
        setMenuVisible(false);
        setCompleteJobModalVisible(true);
    };

    const handleCompleteJob = async () => {
        if (jobStatus === 'COMPLETED') {
            Alert.alert('Error', 'Este trabajo ya ha sido completado.');
            setCompleteJobModalVisible(false);
            return;
        }
        
        if (rating === 0) {
            Alert.alert('Calificación requerida', 'Por favor seleccioná una calificación antes de continuar.');
            return;
        }

        setCompletingJob(true);
        try {
            // Llamar al endpoint del backend para completar el trabajo
            const response = await fetch(withBaseUrl(`/service-orders/${serviceOrderId}/complete`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating: rating,
                    comment: reviewComment.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error('No se pudo completar el trabajo');
            }

            Alert.alert(
                'Trabajo completado',
                '¡Gracias por tu calificación! El trabajo ha sido marcado como finalizado.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setCompleteJobModalVisible(false);
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error completing job:', error);
            Alert.alert('Error', 'No se pudo completar el trabajo. Intentá nuevamente.');
        } finally {
            setCompletingJob(false);
        }
    };

    const handleCancelJobPress = () => {
        if (jobStatus === 'COMPLETED') {
            Alert.alert('No se puede cancelar', 'No se puede cancelar un trabajo que ya ha sido completado.');
            setMenuVisible(false);
            return;
        }
        if (jobStatus === 'CANCELLED') {
            Alert.alert('Trabajo ya cancelado', 'Este trabajo ya ha sido cancelado.');
            setMenuVisible(false);
            return;
        }
        setMenuVisible(false);
        setCancelJobModalVisible(true);
    };

    const handleCancelJob = async () => {
        if (jobStatus === 'COMPLETED') {
            Alert.alert('Error', 'No se puede cancelar un trabajo que ya ha sido completado.');
            setCancelJobModalVisible(false);
            return;
        }
        if (jobStatus === 'CANCELLED') {
            Alert.alert('Error', 'Este trabajo ya ha sido cancelado.');
            setCancelJobModalVisible(false);
            return;
        }
        
        if (!cancelReason.trim()) {
            Alert.alert('Razón requerida', 'Por favor escribí la razón de la cancelación.');
            return;
        }

        setCancellingJob(true);
        try {
            const response = await fetch(withBaseUrl(`/service-orders/${serviceOrderId}/cancel`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: cancelReason.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('No se pudo cancelar el trabajo');
            }

            Alert.alert(
                'Trabajo cancelado',
                'El trabajo ha sido cancelado exitosamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setCancelJobModalVisible(false);
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error cancelling job:', error);
            Alert.alert('Error', 'No se pudo cancelar el trabajo. Intentá nuevamente.');
        } finally {
            setCancellingJob(false);
        }
    };

    const MessageBubble = ({ msg }) => {
        const isUser = msg.sender === 'user';
        const hasAttachment = msg.attachmentUrl || msg.image;
        
        return (
            <View style={[styles.messageRow, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>            
                {!isUser && <Image source={avatarSource} style={styles.avatar} />}
                <View
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userMessage : styles.professionalMessage,
                    ]}
                >
                    {hasAttachment && (
                        <TouchableOpacity onPress={() => setFullscreenImage(msg.attachmentUrl || msg.image)}>
                            <Image 
                                source={
                                    typeof (msg.attachmentUrl || msg.image) === 'string' 
                                        ? { uri: msg.attachmentUrl || msg.image }
                                        : msg.attachmentUrl || msg.image
                                } 
                                style={styles.messageImage} 
                            />
                        </TouchableOpacity>
                    )}
                    {msg.text && <Text style={styles.messageText}>{msg.text}</Text>}
                </View>
            </View>
        );
    };

    return (
        <LinearGradient colors={[colors.primaryBlue, colors.secondaryBlue]} style={styles.background}>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
            >
                {/* Header */}
                <View style={styles.header}>
                    <BackButton
                        navigation={navigation}
                        fallbackRoute="MyJobs"
                        style={styles.backButton}
                        iconSize={28}
                        backgroundColor="transparent"
                    />
                    <Image source={avatarSource} style={styles.headerAvatar} />
                    <View>
                        <Text style={styles.headerTitle}>{professionalName}</Text>
                        <Text style={styles.headerSubtitle}>{professionalProfession}</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => setMenuVisible(true)}>
                            <Ionicons name="ellipsis-vertical" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.jobSummary}>
                    <Ionicons name="briefcase-outline" size={18} color={colors.white} style={styles.jobSummaryIcon} />
                    <Text style={styles.jobSummaryText}>{jobSummary}</Text>
                </View>

                {/* Messages List */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {loadingMessages ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={colors.white} />
                            <Text style={styles.loadingText}>Cargando mensajes...</Text>
                        </View>
                    ) : (
                        messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
                    )}
                </ScrollView>

                {!canSendMessages && (
                    <View style={styles.chatNotice}>
                        <Ionicons name="information-circle" size={18} color={colors.white} />
                        <Text style={styles.chatNoticeText}>
                            Para continuar el chat necesitás generar una solicitud desde "Contratar".
                        </Text>
                    </View>
                )}

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <View style={styles.emojiPicker}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.emojiScrollContent}
                        >
                            {basicEmojis.map((emoji, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.emojiButton}
                                    onPress={() => handleEmojiSelect(emoji)}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Image Preview */}
                {selectedImage && (
                    <View style={styles.imagePreviewContainer}>
                        <View style={styles.imagePreviewWrapper}>
                            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                            <TouchableOpacity 
                                style={styles.removeImageButton}
                                onPress={() => setSelectedImage(null)}
                            >
                                <Ionicons name="close-circle" size={24} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                        {uploadingImage && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator color={colors.white} size="small" />
                                <Text style={styles.uploadingText}>Subiendo imagen...</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <TouchableOpacity 
                        style={styles.iconButton} 
                        onPress={handleSelectImage}
                        disabled={!canSendMessages || uploadingImage}
                    >
                        <Ionicons 
                            name="add-circle-outline" 
                            size={28} 
                            color={canSendMessages ? colors.greenButton : colors.mutedText} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.iconButton, 
                            showEmojiPicker && canSendMessages && styles.emojiButtonActive
                        ]} 
                        onPress={handleEmojiPress}
                        disabled={!canSendMessages}
                    >
                        <Ionicons 
                            name="happy" 
                            size={28} 
                            color={showEmojiPicker && canSendMessages ? colors.white : (canSendMessages ? "#FFD700" : colors.mutedText)} 
                        />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder={canSendMessages ? "Escribe un mensaje..." : "Crea una solicitud para habilitar el chat"}
                        placeholderTextColor={colors.mutedText}
                        value={inputText}
                        onChangeText={setInputText}
                        editable={canSendMessages && !sending}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!canSendMessages || sending) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!canSendMessages || sending}
                    >
                        {sending ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <Ionicons name="send" size={22} color={colors.white} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Fullscreen Image Modal */}
                <Modal
                    visible={fullscreenImage !== null}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setFullscreenImage(null)}
                >
                    <View style={styles.fullscreenModalContainer}>
                        <TouchableOpacity 
                            style={styles.closeFullscreenButton}
                            onPress={() => setFullscreenImage(null)}
                        >
                            <Ionicons name="close" size={30} color={colors.white} />
                        </TouchableOpacity>
                        {fullscreenImage && (
                            <Image 
                                source={
                                    typeof fullscreenImage === 'string' 
                                        ? { uri: fullscreenImage }
                                        : fullscreenImage
                                } 
                                style={styles.fullscreenImage} 
                            />
                        )}
                    </View>
                </Modal>

                {/* Menu Modal */}
                <Modal
                    visible={menuVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setMenuVisible(false)}
                    >
                        <View style={styles.menuContainer}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleViewProfile}
                            >
                                <Ionicons name="person-outline" size={22} color={colors.white} />
                                <Text style={styles.menuItemText}>Ver perfil</Text>
                            </TouchableOpacity>
                            {jobStatus !== 'COMPLETED' && (
                                <>
                                    <View style={styles.menuDivider} />
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={handleCompleteJobPress}
                                    >
                                        <Ionicons name="checkmark-circle-outline" size={22} color="#5cb85c" />
                                        <Text style={[styles.menuItemText, { color: '#5cb85c' }]}>Completar trabajo</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            {jobStatus !== 'COMPLETED' && jobStatus !== 'CANCELLED' && (
                                <>
                                    <View style={styles.menuDivider} />
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={handleCancelJobPress}
                                    >
                                        <Ionicons name="close-circle-outline" size={22} color="#ff9800" />
                                        <Text style={[styles.menuItemText, { color: '#ff9800' }]}>Cancelar trabajo</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            <View style={styles.menuDivider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleDeleteConversation}
                            >
                                <Ionicons name="trash-outline" size={22} color="#ff4757" />
                                <Text style={[styles.menuItemText, styles.menuItemDanger]}>Borrar conversación</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Complete Job Modal */}
                <Modal
                    visible={completeJobModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setCompleteJobModalVisible(false)}
                >
                    <View style={styles.completeModalOverlay}>
                        <View style={styles.completeModalContainer}>
                            <Text style={styles.completeModalTitle}>Completar Trabajo</Text>
                            <Text style={styles.completeModalSubtitle}>
                                ¿Cómo fue tu experiencia con {professionalName}?
                            </Text>

                            {/* Star Rating */}
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        style={styles.starButton}
                                    >
                                        <Ionicons
                                            name={star <= rating ? 'star' : 'star-outline'}
                                            size={40}
                                            color="#FFD700"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Comment Input */}
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Comentario (opcional)"
                                placeholderTextColor={colors.mutedText}
                                value={reviewComment}
                                onChangeText={setReviewComment}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            {/* Action Buttons */}
                            <View style={styles.completeModalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setCompleteJobModalVisible(false);
                                        setRating(0);
                                        setReviewComment('');
                                    }}
                                    disabled={completingJob}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.confirmButton, completingJob && styles.confirmButtonDisabled]}
                                    onPress={handleCompleteJob}
                                    disabled={completingJob}
                                >
                                    {completingJob ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.confirmButtonText}>Confirmar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Cancel Job Modal */}
                <Modal
                    visible={cancelJobModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setCancelJobModalVisible(false)}
                >
                    <View style={styles.completeModalOverlay}>
                        <View style={styles.completeModalContainer}>
                            <Text style={styles.completeModalTitle}>Cancelar Trabajo</Text>
                            <Text style={styles.completeModalSubtitle}>
                                ¿Por qué querés cancelar este trabajo?
                            </Text>

                            {/* Reason Input */}
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Escribí la razón de la cancelación..."
                                placeholderTextColor={colors.mutedText}
                                value={cancelReason}
                                onChangeText={setCancelReason}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            {/* Action Buttons */}
                            <View style={styles.completeModalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setCancelJobModalVisible(false);
                                        setCancelReason('');
                                    }}
                                    disabled={cancellingJob}
                                >
                                    <Text style={styles.cancelButtonText}>Volver</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.confirmButton, cancellingJob && styles.confirmButtonDisabled, { backgroundColor: '#ff9800' }]}
                                    onPress={handleCancelJob}
                                    disabled={cancellingJob}
                                >
                                    {cancellingJob ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.confirmButtonText}>Cancelar trabajo</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 12,
        paddingHorizontal: 10,
        backgroundColor: colors.primaryBlue,
    },
    backButton: {
        padding: 8,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: colors.lightGray,
        fontSize: 14,
    },
    jobSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingBottom: 10,
        paddingTop: 12,
        gap: 8,
    },
    jobSummaryIcon: {
        marginTop: 2,
    },
    jobSummaryText: {
        color: colors.white,
        fontSize: 14,
        flex: 1,
        opacity: 0.8,
    },
    headerIcons: {
        flexDirection: 'row',
        marginLeft: 'auto',
        alignItems: 'center',
        gap: 15,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    loadingText: {
        color: colors.white,
        opacity: 0.8,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
    },
    userMessage: {
        backgroundColor: colors.lightBlue,
        borderBottomRightRadius: 5,
    },
    professionalMessage: {
        backgroundColor: colors.greenButton,
        borderBottomLeftRadius: 5,
    },
    messageText: {
        color: colors.white,
        fontSize: 16,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 15,
        marginBottom: 5,
    },
    chatNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    chatNoticeText: {
        color: colors.white,
        flex: 1,
        fontSize: 13,
        opacity: 0.9,
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: colors.primaryBlue,
    },
    iconButton: {
        padding: 8,
    },
    emojiButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: colors.white,
        borderRadius: 22,
        paddingHorizontal: 18,
        fontSize: 16,
        marginHorizontal: 8,
    },
    sendButton: {
        backgroundColor: colors.greenButton,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        paddingRight: 20,
    },
    menuContainer: {
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        borderRadius: 12,
        minWidth: 220,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    menuItemText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '500',
    },
    menuItemDanger: {
        color: '#ff4757',
    },
    menuDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: 4,
    },
    completeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    completeModalContainer: {
        backgroundColor: colors.primaryBlue,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    completeModalTitle: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    completeModalSubtitle: {
        color: colors.mutedText,
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    starButton: {
        padding: 4,
    },
    commentInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 12,
        color: colors.white,
        fontSize: 14,
        minHeight: 100,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    completeModalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: colors.greenButton,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    emojiPicker: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 15,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 5,
    },
    emojiScrollContent: {
        paddingHorizontal: 8,
        gap: 8,
    },
    emojiButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 20,
    },
    imagePreviewContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    imagePreviewWrapper: {
        position: 'relative',
        alignSelf: 'flex-start',
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.white,
        borderRadius: 12,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadingText: {
        color: colors.white,
        fontSize: 12,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    fullscreenModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
    closeFullscreenButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
});
