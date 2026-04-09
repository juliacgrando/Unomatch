import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const tint = useThemeColor({}, 'tint');
  const background = useThemeColor({}, 'background');

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: tint },
      text: { color: '#fff', fontWeight: '600' },
    },
    secondary: {
      container: { backgroundColor: background },
      text: { color: tint, fontWeight: '600' },
    },
    outline: {
      container: { backgroundColor: 'transparent', borderWidth: 2, borderColor: tint },
      text: { color: tint, fontWeight: '600' },
    },
  };

  const { container: variantContainer, text: variantText } = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[styles.container, variantContainer, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : tint} />
      ) : (
        <Text style={[styles.text, variantText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
  },
});
