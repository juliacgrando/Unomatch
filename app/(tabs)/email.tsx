import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const alreadyRegistered = registeredUsers.includes(email.toLowerCase());

  const handleContinue = () => {
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Digite um e-mail válido.');
      return;
    }

    if (alreadyRegistered) {
      Alert.alert('Erro', 'Este usuário já está cadastrado.');
      return;
    }

    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Insira seu e-mail:</Text>

        <TextInput
          style={styles.input}
          placeholder="email@exemplo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.button, (!email || alreadyRegistered) && { opacity: 0.5 }]}
          disabled={!email || alreadyRegistered}
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
  input: {
    backgroundColor: '#E9ECEF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF4B6E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});