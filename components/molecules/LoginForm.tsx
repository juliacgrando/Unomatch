import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/atoms/AppText';
import { Button } from '@/components/atoms/Button';
import { InputWithLabel } from '@/components/molecules/InputWithLabel';

export type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
};

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const EMAIL_DOMAIN = '@unochapeco.edu.br';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const normalizedEmail = email.trim().toLowerCase();
  const fullEmail = normalizedEmail.includes('@') ? normalizedEmail : `${normalizedEmail}${EMAIL_DOMAIN}`;
  const hasValidEmail = /^[a-z0-9._-]+@unochapeco\.edu\.br$/.test(fullEmail);
  const canSubmit = normalizedEmail.length > 0 && hasValidEmail && password.length > 0;

  const handleSubmit = () => {
    onSubmit(fullEmail, password);
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
        <TextInput
          style={styles.emailInput}
          value={email}
          onChangeText={setEmail}
          placeholder="julia.teste@unochapeco.edu.br"
          placeholderTextColor="#7A7A7A"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <InputWithLabel
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Senha"
          secureTextEntry
        />
        <Button
          title="Entrar"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
          style={[styles.button, !canSubmit && styles.disabledButton]}
        />
        {!hasValidEmail && normalizedEmail.length > 0 ? (
          <AppText variant="caption" style={styles.errorText}>
            Use um e-mail @unochapeco.edu.br.
          </AppText>
        ) : null}
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
    maxWidth: 360,
    alignSelf: 'center',
  },
  label: {
    marginBottom: 6,
  },
  emailInput: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#E9ECEF',
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    borderWidth: 1.5,
    color: '#1B1B1B',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
  errorText: {
    color: '#9A1F3A',
    marginTop: 10,
    opacity: 1,
    textAlign: 'center',
  },
});
