import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const professional = {
    name: 'Jonathan Leguizamón',
    avatar: require('../assets/images/plomero3.png'),
    profession: 'Plomero',
};

const initialMessages = [
    { id: 1, text: 'Hola, en que puedo ayudarte?', sender: 'professional' },
    { id: 2, text: 'Estoy con una gotera', sender: 'user' },
    { id: 3, text: 'Si queres mandame una foto por aca así me fijo', sender: 'professional' },
    {
        id: 4,
        text: 'Es en el techo de la cocina',
        sender: 'user',
        image: require('../assets/images/gotera.png'),
    },
];
// --- Fin de Datos Mock ---



export const ChatScreen = ({ navigation }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef();

    const handleSend = () => {
        if (inputText.trim() === '') return;
        const newMessage = {
            id: messages.length + 1,
            text: inputText,
            sender: 'user',
        };
        setMessages([...messages, newMessage]);
        setInputText('');
        Keyboard.dismiss();
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const MessageBubble = ({ msg }) => {
        const isUser = msg.sender === 'user';
        return (
            <View style={[styles.messageRow, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
                {!isUser && <Image source={professional.avatar} style={styles.avatar} />}
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
                    {/* TODO CAMBIAR POR COMPONENTE DE MIS TRABAJOS CUANDO ESTE */}
                    <TouchableOpacity onPress={() => navigation.navigate('SearchProfessionals')} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={colors.white} />
                    </TouchableOpacity>
                    <Image source={professional.avatar} style={styles.headerAvatar} />
                    <View>
                        <Text style={styles.headerTitle}>{professional.name}</Text>
                        <Text style={styles.headerSubtitle}>{professional.profession}</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity>
                            <Ionicons name="ellipsis-vertical" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Messages List */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                </ScrollView>

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add-circle-outline" size={28} color={colors.mutedText} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="happy-outline" size={28} color={colors.mutedText} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor={colors.mutedText}
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="send" size={22} color={colors.white} />
                    </TouchableOpacity>
                </View>
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
});
