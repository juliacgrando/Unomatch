import React from 'react';
import {
  TextInput,
  StyleSheet,
  type TextInputProps,
  View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type InputProps = TextInputProps & {
  error?: boolean;
};

export function Input({ style, error, secureTextEntry, ...rest }: InputProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'surface');
  const placeholderColor = useThemeColor({}, 'icon');
  const borderColor = error ? '#e74c3c' : 'rgba(0,0,0,0.1)';

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
});
