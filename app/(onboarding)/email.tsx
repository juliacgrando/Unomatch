import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';

export default function EmailScreen() {
  const EMAIL_DOMAIN = '@unochapeco.edu.br';
  const router = useRouter();
  const { login } = useAuth();
  const [emailUser, setEmailUser] = useState('');

  const normalizedEmailUser = emailUser.trim().toLowerCase();
  const hasValidUserPart = /^[a-z0-9._-]+$/.test(normalizedEmailUser);
  const fullEmail = `${normalizedEmailUser}${EMAIL_DOMAIN}`;

  const handleContinue = () => {
    if (!normalizedEmailUser) {
      Alert.alert('Erro', 'Digite seu usuario institucional.');
      return;
    }

    if (!hasValidUserPart) {
      Alert.alert('E-mail invalido', 'Use apenas letras, numeros, ponto, underline ou hifen.');
      return;
    }

    login(fullEmail, 'placeholder-password');
    router.replace('/(tabs)');
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

        <TouchableOpacity
          style={[styles.button, (!normalizedEmailUser || !hasValidUserPart) && { opacity: 0.5 }]}
          disabled={!normalizedEmailUser || !hasValidUserPart}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
