import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput } from 'react-native';

import { AppText } from '@/components/atoms/AppText';
import { Button } from '@/components/atoms/Button';
import { InputWithLabel } from '@/components/molecules/InputWithLabel';

export type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
};

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const EMAIL_DOMAIN = '@unochapeco.edu.br';
  const [emailUser, setEmailUser] = useState('');
  const [password, setPassword] = useState('');
  const normalizedEmailUser = emailUser.trim().toLowerCase();
  const hasValidUserPart = /^[a-z0-9._-]+$/.test(normalizedEmailUser);
  const canSubmit = normalizedEmailUser.length > 0 && hasValidUserPart && password.length > 0;

  const handleSubmit = () => {
    onSubmit(`${normalizedEmailUser}${EMAIL_DOMAIN}`, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <AppText variant="caption" style={styles.label}>
          E-mail institucional
        </AppText>
        <View style={styles.emailRow}>
          <TextInput
            style={styles.emailInput}
            value={emailUser}
            onChangeText={setEmailUser}
            placeholder="seu.nome"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <AppText style={styles.domain}>{EMAIL_DOMAIN}</AppText>
        </View>
        <InputWithLabel
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <Button
          title="Entrar"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  form: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  label: {
    marginBottom: 6,
  },
  emailRow: {
    width: '100%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    paddingRight: 12,
  },
  emailInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1B1B1B',
  },
  domain: {
    opacity: 0.8,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
});
