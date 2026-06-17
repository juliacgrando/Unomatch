import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/atoms/AppText';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

type ProfileForm = {
  name: string;
  age: string;
  course: string;
  bio: string;
  interests: string;
  minAge: string;
  maxAge: string;
  maxDistanceKm: string;
};

const emptyForm: ProfileForm = {
  name: '',
  age: '',
  course: '',
  bio: '',
  interests: '',
  minAge: '',
  maxAge: '',
  maxDistanceKm: '',
};

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
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>(emptyForm);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user && !isEditing) {
      setNotificationsEnabled(user.notificationsEnabled);
      setShowOnlyUniversity(user.showOnlyUniversity);
      setForm({
        name: user.name,
        age: String(user.age),
        course: user.course,
        bio: user.bio,
        interests: user.interests.join(', '),
        minAge: String(user.minAge),
        maxAge: String(user.maxAge),
        maxDistanceKm: String(user.maxDistanceKm),
      });
    }
  }, [isEditing, user]);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const startEditing = () => {
    if (user) {
      setForm({
        name: user.name,
        age: String(user.age),
        course: user.course,
        bio: user.bio,
        interests: user.interests.join(', '),
        minAge: String(user.minAge),
        maxAge: String(user.maxAge),
        maxDistanceKm: String(user.maxDistanceKm),
      });
    }

    setIsEditing(true);
  };

  const asPositiveNumber = (value: string, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/(auth)/login');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const patch = isEditing
        ? {
            name: form.name.trim(),
            age: asPositiveNumber(form.age, user?.age || 20),
            course: form.course.trim(),
            bio: form.bio.trim(),
            interests: form.interests
              .split(',')
              .map((interest) => interest.trim())
              .filter(Boolean)
              .slice(0, 12),
            minAge: asPositiveNumber(form.minAge, user?.minAge || 18),
            maxAge: asPositiveNumber(form.maxAge, user?.maxAge || 24),
            maxDistanceKm: asPositiveNumber(form.maxDistanceKm, user?.maxDistanceKm || 15),
            notificationsEnabled,
            showOnlyUniversity,
          }
        : { notificationsEnabled, showOnlyUniversity };

      if (isEditing && (!patch.name || !patch.course || !patch.bio || patch.interests.length === 0)) {
        Alert.alert('Revise o perfil', 'Preencha nome, curso, bio e pelo menos um interesse.');
        return;
      }

      await updateProfile(patch);
      setIsEditing(false);
      Alert.alert('Pronto', 'Dados salvos no backend.');
    } catch (error) {
      Alert.alert('Erro ao salvar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
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
          {user ? `${user.age} anos - ${user.course} - ${user.university}` : 'Carregando perfil...'}
        </AppText>
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: tint }]}
            onPress={isEditing ? () => setIsEditing(false) : startEditing}
          >
            <AppText style={[styles.outlineButtonText, { color: tint }]}>
              {isEditing ? 'Cancelar edicao' : 'Editar perfil'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {isEditing ? (
        <View style={[styles.section, { backgroundColor: surface }]}>
          <AppText variant="subtitle">Editar informacoes</AppText>

          <AppText style={styles.inputLabel}>Nome</AppText>
          <TextInput
            value={form.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Seu nome"
            placeholderTextColor={icon}
            style={[styles.input, { color: text }]}
          />

          <View style={styles.inputGrid}>
            <View style={styles.inputColumn}>
              <AppText style={styles.inputLabel}>Idade</AppText>
              <TextInput
                value={form.age}
                onChangeText={(value) => updateField('age', value)}
                keyboardType="number-pad"
                placeholder="20"
                placeholderTextColor={icon}
                style={[styles.input, { color: text }]}
              />
            </View>
            <View style={styles.inputColumn}>
              <AppText style={styles.inputLabel}>Curso</AppText>
              <TextInput
                value={form.course}
                onChangeText={(value) => updateField('course', value)}
                placeholder="Seu curso"
                placeholderTextColor={icon}
                style={[styles.input, { color: text }]}
              />
            </View>
          </View>

          <AppText style={styles.inputLabel}>Bio</AppText>
          <TextInput
            value={form.bio}
            onChangeText={(value) => updateField('bio', value)}
            placeholder="Conte algo sobre voce"
            placeholderTextColor={icon}
            multiline
            style={[styles.input, styles.multilineInput, { color: text }]}
          />

          <AppText style={styles.inputLabel}>Interesses</AppText>
          <TextInput
            value={form.interests}
            onChangeText={(value) => updateField('interests', value)}
            placeholder="Cafe, tecnologia, musica"
            placeholderTextColor={icon}
            style={[styles.input, { color: text }]}
          />
          <AppText style={[styles.helperText, { color: icon }]}>Separe os interesses por virgula.</AppText>

          <View style={styles.inputGrid}>
            <View style={styles.inputColumn}>
              <AppText style={styles.inputLabel}>Idade min.</AppText>
              <TextInput
                value={form.minAge}
                onChangeText={(value) => updateField('minAge', value)}
                keyboardType="number-pad"
                placeholder="18"
                placeholderTextColor={icon}
                style={[styles.input, { color: text }]}
              />
            </View>
            <View style={styles.inputColumn}>
              <AppText style={styles.inputLabel}>Idade max.</AppText>
              <TextInput
                value={form.maxAge}
                onChangeText={(value) => updateField('maxAge', value)}
                keyboardType="number-pad"
                placeholder="24"
                placeholderTextColor={icon}
                style={[styles.input, { color: text }]}
              />
            </View>
          </View>

          <AppText style={styles.inputLabel}>Distancia maxima em km</AppText>
          <TextInput
            value={form.maxDistanceKm}
            onChangeText={(value) => updateField('maxDistanceKm', value)}
            keyboardType="number-pad"
            placeholder="15"
            placeholderTextColor={icon}
            style={[styles.input, { color: text }]}
          />
        </View>
      ) : null}

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
        <TouchableOpacity onPress={startEditing}>
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
        <TouchableOpacity onPress={startEditing}>
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
      </View>

      <Button
        title={saving ? 'Salvando...' : 'Salvar alteracoes'}
        onPress={handleSave}
        disabled={saving}
        loading={saving}
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
  inputLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9DDE3',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  inputColumn: {
    flex: 1,
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
    gap: 10,
  },
  preferenceLabel: {
    fontWeight: '500',
    flexShrink: 0,
  },
  preferenceValue: {
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  saveButton: {
    marginTop: 6,
  },
  logoutButton: {
    marginTop: 10,
  },
});
