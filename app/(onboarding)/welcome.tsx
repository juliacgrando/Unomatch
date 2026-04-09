import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
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
          <Text style={styles.title}>Unomatch</Text>
          <Text style={styles.subtitle}>
            Conecte-se com pessoas da sua universidade.
          </Text>

          <Text style={styles.ruleTitle}>Seja voce</Text>
          <Text style={styles.ruleDesc}>
            Sua foto, idade e descricao devem ser reais.
          </Text>

          <Text style={styles.ruleTitle}>Mantenha-se seguro</Text>
          <Text style={styles.ruleDesc}>
            Nao forneca informacoes pessoais.
          </Text>

          <Text style={styles.ruleTitle}>Respeite os outros</Text>
          <Text style={styles.ruleDesc}>
            Trate as pessoas da mesma forma que deseja ser tratado.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/(onboarding)/name')}
      >
        <Text style={styles.primaryButtonText}>Criar conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.secondaryButtonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    backgroundColor: '#F2F2F2',
  },
  content: {
    marginTop: 70,
    marginBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    fontSize: 16,
  },
  ruleTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
  },
  ruleDesc: {
    opacity: 0.7,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#FF4B6E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#FF4B6E',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#FF4B6E',
    fontWeight: 'bold',
  },
});
