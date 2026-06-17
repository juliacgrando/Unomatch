import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/atoms/AppText';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout, refreshUser, updateProfile, user } = useAuth();
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showOnlyUniversity, setShowOnlyUniversity] = useState(true);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      setNotificationsEnabled(user.notificationsEnabled);
      setShowOnlyUniversity(user.showOnlyUniversity);
    }
  }, [user]);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/(auth)/login');
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({ notificationsEnabled, showOnlyUniversity });
      Alert.alert('Pronto', 'Dados salvos no backend.');
    } catch (error) {
      Alert.alert('Erro ao salvar', error instanceof Error ? error.message : 'Tente novamente.');
    }
  };

  const handleEdit = (section: string) => {
    Alert.alert('Em breve', `Edicao de "${section}" chega na proxima versao.`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: surface }]}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{initials}</AppText>
        </View>
        <AppText variant="title" style={styles.name}>{user?.name || 'Perfil'}</AppText>
        <AppText style={[styles.meta, { color: icon }]}>
          {user ? `${user.age} anos • ${user.course} • ${user.university}` : 'Carregando perfil...'}
        </AppText>
        <View style={styles.heroActions}>
          <TouchableOpacity style={[styles.outlineButton, { borderColor: tint }]} onPress={() => handleEdit('dados basicos')}>
            <AppText style={[styles.outlineButtonText, { color: tint }]}>Editar perfil</AppText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: surface }]}>
          <AppText style={styles.statValue}>86%</AppText>
          <AppText style={[styles.statLabel, { color: icon }]}>Perfil completo</AppText>
        </View>
        <View style={[styles.statCard, { backgroundColor: surface }]}>
          <AppText style={styles.statValue}>12</AppText>
          <AppText style={[styles.statLabel, { color: icon }]}>Likes recebidos</AppText>
        </View>
        <View style={[styles.statCard, { backgroundColor: surface }]}>
          <AppText style={styles.statValue}>4</AppText>
          <AppText style={[styles.statLabel, { color: icon }]}>Matches</AppText>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: surface }]}>
        <AppText variant="subtitle">Sobre mim</AppText>
        <AppText style={[styles.sectionText, { color: text }]}>
          {user?.bio || 'Adicione uma bio para aparecer melhor no Unomatch.'}
        </AppText>
        <TouchableOpacity onPress={() => handleEdit('sobre mim')}>
          <AppText style={[styles.sectionAction, { color: tint }]}>Editar bio</AppText>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: surface }]}>
        <AppText variant="subtitle">Interesses</AppText>
        <View style={styles.chipsRow}>
          {(user?.interests || []).map((interest) => (
            <View key={interest} style={styles.chip}>
              <AppText style={styles.chipText}>{interest}</AppText>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={() => handleEdit('interesses')}>
          <AppText style={[styles.sectionAction, { color: tint }]}>Editar interesses</AppText>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: surface }]}>
        <AppText variant="subtitle">Preferencias de match</AppText>
        <View style={styles.preferenceRow}>
          <AppText style={styles.preferenceLabel}>Faixa etaria</AppText>
          <AppText style={[styles.preferenceValue, { color: icon }]}>
            {user ? `${user.minAge} - ${user.maxAge}` : '18 - 24'}
          </AppText>
        </View>
        <View style={styles.preferenceRow}>
          <AppText style={styles.preferenceLabel}>Distancia maxima</AppText>
          <AppText style={[styles.preferenceValue, { color: icon }]}>{user?.maxDistanceKm || 15} km</AppText>
        </View>
        <View style={styles.preferenceRow}>
          <AppText style={styles.preferenceLabel}>Somente UNOCHAPECO</AppText>
          <Switch
            value={showOnlyUniversity}
            onValueChange={setShowOnlyUniversity}
            trackColor={{ false: '#CFCFCF', true: '#FF4B6E88' }}
            thumbColor={showOnlyUniversity ? '#FF4B6E' : '#F4F4F4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: surface }]}>
        <AppText variant="subtitle">Conta e seguranca</AppText>
        <View style={styles.preferenceRow}>
          <AppText style={styles.preferenceLabel}>E-mail institucional</AppText>
          <AppText style={[styles.preferenceValue, { color: icon }]}>{user?.email || '@unochapeco.edu.br'}</AppText>
        </View>
        <View style={styles.preferenceRow}>
          <AppText style={styles.preferenceLabel}>Notificacoes de match</AppText>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#CFCFCF', true: '#FF4B6E88' }}
            thumbColor={notificationsEnabled ? '#FF4B6E' : '#F4F4F4'}
          />
        </View>
        <TouchableOpacity onPress={() => handleEdit('senha')}>
          <AppText style={[styles.sectionAction, { color: tint }]}>Alterar senha</AppText>
        </TouchableOpacity>
      </View>

      <Button
        title="Salvar alteracoes"
        onPress={handleSave}
        style={styles.saveButton}
      />
      <Button title="Sair da conta" onPress={handleLogout} variant="outline" style={styles.logoutButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  hero: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    height: 86,
    width: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B6E',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },
  name: {
    marginBottom: 4,
  },
  meta: {
    textAlign: 'center',
    marginBottom: 14,
  },
  heroActions: {
    width: '100%',
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionText: {
    marginTop: 6,
  },
  sectionAction: {
    marginTop: 10,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#FF4B6E22',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9A1F3A',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  preferenceLabel: {
    fontWeight: '500',
  },
  preferenceValue: {
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 6,
  },
  logoutButton: {
    marginTop: 10,
  },
});
