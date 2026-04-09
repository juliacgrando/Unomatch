import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/atoms/AppText';
import { LoginForm } from '@/components/molecules/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (email: string, password: string) => {
    setLoading(true);
    login(email, password);
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <AppText variant="title" style={styles.title}>
          Unomatch
        </AppText>
        <AppText variant="body" style={styles.subtitle}>
          Entre com sua conta para continuar.
        </AppText>
      </View>
      <LoginForm onSubmit={handleSubmit} loading={loading} />
      <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(onboarding)/name')}>
        <AppText variant="caption" style={styles.linkText}>
          Nao tem conta? Criar conta
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F2F2F2',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#FF4B6E',
    opacity: 1,
  },
});
