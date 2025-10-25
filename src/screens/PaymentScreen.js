import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { BackButton } from '../components/BackButton';
import { MercadoPagoLogo } from '../components/MercadoPagoLogo';

export const PaymentScreen = ({ route, navigation }) => {
  const { professional, selectedDate, selectedTime, amount } = route.params || {};

  const [redirecting, setRedirecting] = useState(false);

  const handleSelectPaymentMethod = async (method) => {
    if (method === 'mercadopago') {
      // Mostrar overlay de redirección
      setRedirecting(true);

      // Esperar un momento y abrir el navegador
      setTimeout(async () => {
        try {
          const url = 'https://www.mercadopago.com.ar/';
          const supported = await Linking.canOpenURL(url);

          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert('Error', 'No se pudo abrir el navegador');
          }

          // Simular que el usuario completa el pago en el navegador y vuelve
          setTimeout(() => {
            setRedirecting(false);
            Alert.alert(
              '¡Pago exitoso!',
              `Tu pago de $${amount} fue procesado con éxito a través de Mercado Pago.\n\nEl profesional ${professional?.name} se pondrá en contacto contigo para tu cita el ${selectedDate} a las ${selectedTime}.`,
              [
                {
                  text: 'Volver al inicio',
                  onPress: () => navigation.navigate('Homepage'),
                },
              ]
            );
          }, 3000); // Simular 3 segundos de proceso de pago
        } catch (error) {
          setRedirecting(false);
          Alert.alert('Error', 'Hubo un problema al procesar el pago');
        }
      }, 1500);
    } else {
      Alert.alert('Método no disponible', 'Este método de pago estará disponible próximamente');
    }
  };

  return (
    <LinearGradient
      colors={[colors.primaryBlue, colors.secondaryBlue]}
      style={styles.container}
    >
      <BackButton
        navigation={navigation}
        style={styles.backButton}
        backgroundColor="rgba(0,0,0,0.3)"
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="wallet" size={40} color="#fff" />
          <Text style={styles.title}>Método de Pago</Text>
          <Text style={styles.subtitle}>
            Elige cómo deseas pagar tu servicio
          </Text>
        </View>

        {/* Resumen de la compra */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de tu compra</Text>
          <View style={styles.summaryRow}>
            <Ionicons name="person" size={20} color={colors.primaryBlue} />
            <Text style={styles.summaryText}>{professional?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="briefcase" size={20} color={colors.primaryBlue} />
            <Text style={styles.summaryText}>{professional?.profession}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar" size={20} color={colors.primaryBlue} />
            <Text style={styles.summaryText}>{selectedDate} - {selectedTime}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${amount}</Text>
          </View>
        </View>

        {/* Métodos de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona tu método de pago</Text>

          {/* MercadoPago */}
          <TouchableOpacity
            style={styles.paymentMethodCard}
            onPress={() => handleSelectPaymentMethod('mercadopago')}
            disabled={redirecting}
          >
            <View style={styles.mpFullLogoContainer}>
              <MercadoPagoLogo size="large" />
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          {/* Otros métodos */}
          <TouchableOpacity
            style={[styles.paymentMethodCard, styles.disabledMethod]}
            onPress={() => handleSelectPaymentMethod('transferencia')}
          >
            <View style={styles.mpLogoContainer}>
              <View style={[styles.mpLogoBadge, { backgroundColor: '#f0f0f0' }]}>
                <Ionicons name="swap-horizontal" size={28} color="#999" />
              </View>
              <View style={styles.mpLogoText}>
                <Text style={styles.paymentMethodTitle}>Transferencia Bancaria</Text>
                <Text style={styles.paymentMethodSubtitle}>Próximamente</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentMethodCard, styles.disabledMethod]}
            onPress={() => handleSelectPaymentMethod('efectivo')}
          >
            <View style={styles.mpLogoContainer}>
              <View style={[styles.mpLogoBadge, { backgroundColor: '#f0f0f0' }]}>
                <Ionicons name="cash" size={28} color="#999" />
              </View>
              <View style={styles.mpLogoText}>
                <Text style={styles.paymentMethodTitle}>Efectivo</Text>
                <Text style={styles.paymentMethodSubtitle}>Próximamente</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Seguridad */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#fff" />
          <Text style={styles.securityText}>
            Todos tus pagos están protegidos con encriptación
          </Text>
        </View>
      </ScrollView>

      {/* Modal de redirección simulado */}
      {redirecting && (
        <View style={styles.redirectOverlay}>
          <View style={styles.redirectCard}>
            <View style={styles.redirectLogoContainer}>
              <MercadoPagoLogo size="xlarge" />
            </View>
            <ActivityIndicator size="large" color="#009EE3" style={styles.loader} />
            <Text style={styles.redirectText}>Redirigiendo a Mercado Pago...</Text>
            <Text style={styles.redirectSubtext}>
              Completa tu pago de forma segura
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009EE3',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paymentMethodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledMethod: {
    opacity: 0.6,
  },
  mpLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mpFullLogoContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  mpLogoBadge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mpLogoText: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  securityText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.9,
  },
  redirectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redirectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  redirectLogoContainer: {
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  redirectText: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  redirectSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
