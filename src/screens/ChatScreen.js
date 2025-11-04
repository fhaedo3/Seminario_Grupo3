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
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../components/BackButton';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { messagesApi } from '../api';
import { withBaseUrl } from '../config/api';

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
    const scrollViewRef = useRef();

    const avatarSource = professional.avatar || require('../assets/images/plomero1.png');
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

    const handleSend = () => {
        if (inputText.trim() === '') {
            return;
        }

        if (!canSendMessages) {
            Alert.alert('No puedes enviar mensajes todavía', 'Creá una solicitud para activar el chat.');
            return;
        }

        const payload = {
            senderType: 'USER',
            senderId,
            content: inputText,
        };

        setSending(true);
        messagesApi
            .send(token, serviceOrderId, payload)
            .then((response) => {
                const newMessage = {
                    id: response.id,
                    text: response.content,
                    sender: response.senderType === 'USER' ? 'user' : 'professional',
                    createdAt: response.createdAt,
                };
                setMessages((prev) => [...prev, newMessage]);
                setInputText('');
                Keyboard.dismiss();
            })
            .catch((error) => {
                console.error('Error sending message', error);
                Alert.alert('No se pudo enviar el mensaje', error?.message ?? 'Intentá nuevamente más tarde.');
            })
            .finally(() => {
                setSending(false);
            });
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
        setMenuVisible(false);
        setCompleteJobModalVisible(true);
    };

    const handleCompleteJob = async () => {
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
        setMenuVisible(false);
        setCancelJobModalVisible(true);
    };

    const handleCancelJob = async () => {
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
        return (
            <View style={[styles.messageRow, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>            
                {!isUser && <Image source={avatarSource} style={styles.avatar} />}
                <View
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userMessage : styles.professionalMessage,
                    ]}
                >
                    {msg.image && <Image source={msg.image} style={styles.messageImage} />}
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

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.iconButton} disabled>
                        <Ionicons name="add-circle-outline" size={28} color={colors.mutedText} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} disabled>
                        <Ionicons name="happy-outline" size={28} color={colors.mutedText} />
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
                            <View style={styles.menuDivider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleCompleteJobPress}
                            >
                                <Ionicons name="checkmark-circle-outline" size={22} color="#5cb85c" />
                                <Text style={[styles.menuItemText, { color: '#5cb85c' }]}>Completar trabajo</Text>
                            </TouchableOpacity>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleCancelJobPress}
                            >
                                <Ionicons name="close-circle-outline" size={22} color="#ff9800" />
                                <Text style={[styles.menuItemText, { color: '#ff9800' }]}>Cancelar trabajo</Text>
                            </TouchableOpacity>
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
        padding: 5,
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
});
