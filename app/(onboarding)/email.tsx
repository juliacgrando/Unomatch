import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';

export default function EmailScreen() {
  const EMAIL_DOMAIN = '@unochapeco.edu.br';
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const { register } = useAuth();
  const [emailUser, setEmailUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedEmailUser = emailUser.trim().toLowerCase();
  const hasValidUserPart = /^[a-z0-9._-]+$/.test(normalizedEmailUser);
  const fullEmail = `${normalizedEmailUser}${EMAIL_DOMAIN}`;
  const hasPassword = password.length >= 6;
  const canSubmit = normalizedEmailUser.length > 0 && hasValidUserPart && hasPassword && password === confirmPassword;

  const handleContinue = async () => {
    if (!normalizedEmailUser) {
      Alert.alert('Erro', 'Digite seu usuario institucional.');
      return;
    }

    if (!hasValidUserPart) {
      Alert.alert('E-mail invalido', 'Use apenas letras, numeros, ponto, underline ou hifen.');
      return;
    }

    if (!hasPassword) {
      Alert.alert('Senha invalida', 'Digite uma senha com pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Senhas diferentes', 'Confirme a mesma senha nos dois campos.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: params.name || 'Novo usuario',
        email: fullEmail,
        password,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Nao foi possivel criar a conta', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Insira seu e-mail:</Text>
        <Text style={styles.helper}>Digite apenas a parte antes do dominio institucional.</Text>

        <View style={styles.emailRow}>
          <TextInput
            style={styles.input}
            placeholder="seu.nome"
            value={emailUser}
            onChangeText={setEmailUser}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.domain}>{EMAIL_DOMAIN}</Text>
        </View>

        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, !canSubmit && { opacity: 0.5 }]}
          disabled={loading || !canSubmit}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>{loading ? 'Criando conta...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F2F2F2' },
  content: { marginTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  helper: { opacity: 0.7, marginBottom: 12 },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
    marginBottom: 24,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    padding: 14,
    minWidth: 120,
  },
  passwordInput: {
    backgroundColor: '#E9ECEF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  domain: {
    opacity: 0.8,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FF4B6E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});
