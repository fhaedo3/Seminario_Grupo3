import React, { useMemo, useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { paymentsApi } from '../api';

export const PaymentScreen = ({ route, navigation }) => {
  const { hireSummary } = route.params;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para los datos de la tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const { token } = useAuth();

  const serviceOrderId = hireSummary?.serviceOrder?.id;
  const professionalId = hireSummary?.serviceOrder?.professionalId || hireSummary?.professional?.id;

  const paymentMethodType = useMemo(() => {
    switch (selectedPaymentMethod) {
      case 'card':
        return 'CARD';
      case 'mercadopago':
        return 'MERCADO_PAGO';
      case 'transfer':
        return 'BANK_TRANSFER';
      default:
        return 'CARD';
    }
  }, [selectedPaymentMethod]);

  // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // máximo 16 dígitos + 3 espacios
  };

  // Formatear fecha de expiración (MM/AA)
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\//g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (!token) {
      Alert.alert('Debes iniciar sesión', 'Iniciá sesión para completar el pago.');
      return;
    }

    if (!serviceOrderId) {
      Alert.alert('Falta información', 'No encontramos la solicitud de servicio asociada.');
      return;
    }

    // Validaciones básicas
    if (selectedPaymentMethod === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        Alert.alert('Error', 'Por favor completa todos los campos de la tarjeta');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Error', 'El número de tarjeta debe tener 16 dígitos');
        return;
      }
      if (cvv.length < 3) {
        Alert.alert('Error', 'El CVV debe tener al menos 3 dígitos');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const payload = {
        serviceOrderId,
        amount: Number(hireSummary?.totalAmount) || 0,
        currency: 'ARS',
        method: paymentMethodType,
        professionalId,
        cardNumber: selectedPaymentMethod === 'card' ? cardNumber.replace(/\s/g, '') : undefined,
        cardHolderName: selectedPaymentMethod === 'card' ? cardName : undefined,
        cardExpiry: selectedPaymentMethod === 'card' ? expiryDate : undefined,
        cardCvv: selectedPaymentMethod === 'card' ? cvv : undefined,
      };

      await paymentsApi.create(token, payload);

      Alert.alert(
        '¡Pago exitoso!',
        `Tu contratación de ${(hireSummary.professional.displayName || hireSummary.professional.name)} ha sido confirmada. El profesional se pondrá en contacto contigo pronto.`,
        [
          {
            text: 'Ver mis trabajos',
            onPress: () => navigation.navigate('MyJobs'),
          },
          {
            text: 'Volver al inicio',
            onPress: () => navigation.navigate('Homepage'),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Payment failed', error);
      Alert.alert('Error', error?.message ?? 'No se pudo procesar el pago.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Tarjeta de crédito/débito', icon: 'card' },
    { id: 'mercadopago', name: 'Mercado Pago', icon: 'wallet' },
    { id: 'transfer', name: 'Transferencia bancaria', icon: 'swap-horizontal' },
  ];

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.background}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton navigation={navigation} backgroundColor="rgba(0,0,0,0.3)" />
          <View style={styles.headerContent}>
            <Text style={styles.title}>Método de pago</Text>
            <Text style={styles.subtitle}>
              Seleccioná cómo querés pagar por el servicio
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Resumen de la contratación */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="receipt-outline" size={24} color={colors.white} />
              <Text style={styles.summaryTitle}>Resumen de contratación</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Profesional:</Text>
              <Text style={styles.summaryValue}>{hireSummary.professional.displayName || hireSummary.professional.name}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Servicio:</Text>
              <Text style={styles.summaryValue}>{hireSummary.clientData.serviceType}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fecha:</Text>
              <Text style={styles.summaryValue}>{hireSummary.clientData.preferredDate}</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total a pagar:</Text>
              <Text style={styles.totalValue}>ARS ${hireSummary.totalAmount}</Text>
            </View>
          </View>

          {/* Métodos de pago */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de pago</Text>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.paymentMethodCardSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={styles.paymentMethodLeft}>
                    <Ionicons 
                      name={method.icon} 
                      size={24} 
                      color={selectedPaymentMethod === method.id ? colors.greenButton : colors.white} 
                    />
                    <Text 
                      style={[
                        styles.paymentMethodName,
                        selectedPaymentMethod === method.id && styles.paymentMethodNameSelected,
                      ]}
                    >
                      {method.name}
                    </Text>
                  </View>
                  
                  <View 
                    style={[
                      styles.radioCircle,
                      selectedPaymentMethod === method.id && styles.radioCircleSelected,
                    ]}
                  >
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioCircleInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Formulario de tarjeta (solo si está seleccionado) */}
          {selectedPaymentMethod === 'card' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Datos de la tarjeta</Text>
              
              {/* Número de tarjeta */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número de tarjeta</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color={colors.white} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>
              </View>

              {/* Nombre en la tarjeta */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del titular</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.white} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="JUAN PEREZ"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Fecha y CVV */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Vencimiento</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar-outline" size={20} color={colors.white} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="MM/AA"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={expiryDate}
                      onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>CVV</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.white} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Información de Mercado Pago */}
          {selectedPaymentMethod === 'mercadopago' && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.white} />
              <Text style={styles.infoText}>
                Serás redirigido a Mercado Pago para completar el pago de forma segura.
              </Text>
            </View>
          )}

          {/* Información de Transferencia */}
          {selectedPaymentMethod === 'transfer' && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.white} />
              <Text style={styles.infoText}>
                Recibirás los datos bancarios por email para realizar la transferencia.
                El profesional será notificado una vez confirmado el pago.
              </Text>
            </View>
          )}

          {/* Términos y condiciones */}
          <View style={styles.termsBox}>
            <Ionicons name="shield-checkmark" size={20} color={colors.greenButton} />
            <Text style={styles.termsText}>
              Pago seguro. Al confirmar aceptás nuestros{' '}
              <Text style={styles.termsLink}>términos y condiciones</Text>.
            </Text>
          </View>
        </ScrollView>

        {/* Botón de pago */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]} 
            onPress={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.payButtonText}>Procesando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="card" size={24} color={colors.white} />
                <Text style={styles.payButtonText}>Confirmar pago de ARS ${hireSummary.totalAmount}</Text>
              </>
            )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    marginTop: 16,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.white,
    fontSize: 15,
    opacity: 0.85,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: colors.white,
    fontSize: 15,
    opacity: 0.8,
  },
  summaryValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
  },
  totalLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.greenButton,
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  paymentMethodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  paymentMethodCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.greenButton,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  paymentMethodName: {
    color: colors.white,
    fontSize: 16,
    opacity: 0.85,
  },
  paymentMethodNameSelected: {
    fontWeight: '600',
    opacity: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.greenButton,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.greenButton,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  termsText: {
    flex: 1,
    color: colors.white,
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.greenButton,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: colors.primaryBlue,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.greenButton,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.greenButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

