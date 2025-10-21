import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const BackButton = ({
  navigation,
  fallbackRoute,
  onPress,
  style,
  iconSize = 24,
  iconColor = colors.white,
  backgroundColor = 'rgba(15, 23, 42, 0.45)',
}) => {
  const handlePress = () => {
    if (typeof onPress === 'function') {
      onPress();
      return;
    }

    if (navigation?.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (fallbackRoute) {
      navigation.navigate(fallbackRoute);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <Ionicons name="arrow-back" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BackButton;
