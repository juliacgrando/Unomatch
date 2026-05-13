import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Meu nome é:</Text>

        <TextInput
          style={styles.input}
          placeholder="Alan Turing"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.helper}>
          E assim que seu nome vai aparecer.
        </Text>

        <TouchableOpacity
          style={[styles.button, !name && { opacity: 0.5 }]}
          disabled={!name}
          onPress={() => router.push({ pathname: '/(onboarding)/email', params: { name: name.trim() } })}
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
    marginBottom: 8,
  },
  helper: { opacity: 0.7, marginBottom: 24 },
  button: {
    backgroundColor: '#FF4B6E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});
