import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/atoms/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Profile, api } from '@/services/api';

const COURSE_FILTERS = ['Todos', 'Sistemas', 'Direito', 'Medicina', 'Arquitetura'];
const INTEREST_FILTERS = ['Todos', 'Tech', 'Musica', 'Cafe', 'Cinema', 'Academia'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('Todos');
  const [interestFilter, setInterestFilter] = useState('Todos');
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const loadProfiles = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await api.searchProfiles(token, {
        query: query.trim(),
        course: courseFilter,
        interest: interestFilter,
      });
      setProfiles(response.profiles);
    } catch (error) {
      Alert.alert('Erro ao buscar perfis', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }, [courseFilter, interestFilter, query, token]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const openProfile = (name: string) => {
    Alert.alert('Em breve', `Perfil completo de ${name} sera exibido na proxima etapa.`);
  };

  const likeProfile = async (profile: Profile) => {
    if (!token) {
      return;
    }

    try {
      const response = await api.swipeProfile(token, profile.id, 'like');
      Alert.alert(
        response.matched ? 'Match!' : 'Like enviado',
        response.matched
          ? `Voce e ${profile.name} deram match.`
          : `Voce demonstrou interesse em ${profile.name}.`
      );
    } catch (error) {
      Alert.alert('Erro ao curtir', error instanceof Error ? error.message : 'Tente novamente.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <AppText variant="title">Busca</AppText>
        <Pressable style={styles.iconButton} onPress={() => Alert.alert('Em breve', 'Filtros avancados serao adicionados.')}>
          <Ionicons name="options-outline" size={20} color={text} />
        </Pressable>
      </View>
      <AppText style={[styles.subtitle, { color: icon }]}>Encontre pessoas da UNOCHAPECO por afinidade.</AppText>

      <View style={[styles.searchRow, { backgroundColor: surface }]}>
        <Ionicons name="search-outline" size={18} color={icon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nome ou curso"
          placeholderTextColor={icon}
          style={[styles.searchInput, { color: text }]}
        />
      </View>

      <View style={[styles.filterSection, { backgroundColor: surface }]}>
        <AppText variant="subtitle" style={styles.sectionTitle}>Curso</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {COURSE_FILTERS.map((filter) => {
            const active = courseFilter === filter;
            return (
              <Pressable
                key={filter}
                style={[styles.filterChip, { borderColor: tint }, active && styles.filterChipActive]}
                onPress={() => setCourseFilter(filter)}
              >
                <AppText style={[styles.filterText, active && styles.filterTextActive]}>{filter}</AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <AppText variant="subtitle" style={styles.sectionTitle}>Interesses</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {INTEREST_FILTERS.map((filter) => {
            const active = interestFilter === filter;
            return (
              <Pressable
                key={filter}
                style={[styles.filterChip, { borderColor: tint }, active && styles.filterChipActive]}
                onPress={() => setInterestFilter(filter)}
              >
                <AppText style={[styles.filterText, active && styles.filterTextActive]}>{filter}</AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.resultsSection, { backgroundColor: surface }]}>
        <AppText variant="subtitle" style={styles.resultsTitle}>Resultados ({profiles.length})</AppText>
        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={24} color={icon} />
            <AppText style={[styles.emptyText, { color: icon }]}>Nenhum perfil encontrado com esses filtros.</AppText>
          </View>
        ) : (
          profiles.map((profile) => (
            <View key={profile.id} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <AppText style={styles.avatarText}>{profile.name.slice(0, 1)}</AppText>
                </View>
                <View style={styles.profileMeta}>
                  <AppText style={styles.profileName}>{profile.name}, {profile.age}</AppText>
                  <AppText style={[styles.profileCourse, { color: icon }]}>
                    {profile.course} • {profile.distanceKm} km
                  </AppText>
                </View>
              </View>

              <AppText style={styles.profileBio}>{profile.bio}</AppText>
              <View style={styles.interestRow}>
                {profile.interests.map((interest) => (
                  <View key={interest} style={styles.interestChip}>
                    <AppText style={styles.interestText}>{interest}</AppText>
                  </View>
                ))}
              </View>

              <View style={styles.actionsRow}>
                <Pressable style={styles.outlineAction} onPress={() => openProfile(profile.name)}>
                  <AppText style={styles.outlineActionText}>Ver perfil</AppText>
                </Pressable>
                <Pressable style={styles.fillAction} onPress={() => likeProfile(profile)}>
                  <AppText style={styles.fillActionText}>Curtir</AppText>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
  },
  searchRow: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterSection: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  filterRow: {
    gap: 8,
    marginBottom: 12,
    paddingRight: 6,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: '#FF4B6E',
  },
  filterText: {
    color: '#FF4B6E',
    fontWeight: '600',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  resultsSection: {
    borderRadius: 16,
    padding: 14,
  },
  resultsTitle: {
    marginBottom: 10,
  },
  profileCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    padding: 12,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B6E',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileMeta: {
    marginLeft: 10,
  },
  profileName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  profileCourse: {
    fontSize: 13,
  },
  profileBio: {
    fontSize: 14,
    marginBottom: 8,
  },
  interestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  interestChip: {
    backgroundColor: '#FF4B6E22',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A1F3A',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineAction: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#FF4B6E',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  outlineActionText: {
    color: '#FF4B6E',
    fontWeight: '600',
  },
  fillAction: {
    flex: 1,
    backgroundColor: '#FF4B6E',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  fillActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
  },
});
