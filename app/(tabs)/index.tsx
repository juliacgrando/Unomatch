import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={40} color="#FF4B6E" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>unomatch</Text>
          <Text style={styles.subtitle}>Siga essas regras.</Text>

          <Text style={styles.ruleTitle}>Seja você</Text>
          <Text style={styles.ruleDesc}>
            Sua foto, idade e descrição devem ser reais.
          </Text>

          <Text style={styles.ruleTitle}>Mantenha-se seguro</Text>
          <Text style={styles.ruleDesc}>
            Não forneça informações pessoais.
          </Text>

          <Text style={styles.ruleTitle}>Fique de boa</Text>
          <Text style={styles.ruleDesc}>
            Respeite os outros da maneira que gostaria de ser respeitado.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(onboarding)/name')}
      >
        <Text style={styles.buttonText}>Concordo</Text>
      </TouchableOpacity>
    </View>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#0000',
  },
  content: {
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  ruleTitle: {
    fontWeight: 'bold',
    marginTop: 15,
  },
  ruleDesc: {
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#FF4B6E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});