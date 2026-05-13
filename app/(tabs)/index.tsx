import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/atoms/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Profile, api } from '@/services/api';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { token } = useAuth();
  const swipeThreshold = width * 0.26;
  const position = useRef(new Animated.ValueXY()).current;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<'like' | 'pass' | null>(null);
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const icon = useThemeColor({}, 'icon');

  const loadProfiles = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await api.discoverProfiles(token);
      setProfiles(response.profiles);
      setCurrentIndex(0);
    } catch (error) {
      Alert.alert('Erro ao carregar perfis', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }, [token]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-18deg', '0deg', '18deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, swipeThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-swipeThreshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      bounciness: 8,
    }).start();
  }, [position]);

  const handleSwipeComplete = useCallback((action: 'like' | 'pass', profileId?: string) => {
    setLastAction(action);
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);

    if (token && profileId) {
      void api.swipeProfile(token, profileId, action).then((response) => {
        if (response.matched) {
          Alert.alert('Match!', 'A afinidade foi reciproca. A conversa ja esta nos chats.');
        }
      }).catch((error) => {
        Alert.alert('Erro ao registrar acao', error instanceof Error ? error.message : 'Tente novamente.');
      });
    }
  }, [position, token]);

  const forceSwipe = useCallback((action: 'like' | 'pass') => {
    const profile = visibleProfiles[0];
    const toX = action === 'like' ? width + 120 : -width - 120;

    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => handleSwipeComplete(action, profile?.id));
  }, [handleSwipeComplete, position, visibleProfiles, width]);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
      onPanResponderMove: (_evt, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.2 });
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dx > swipeThreshold) {
          forceSwipe('like');
          return;
        }

        if (gesture.dx < -swipeThreshold) {
          forceSwipe('pass');
          return;
        }

        resetPosition();
      },
    }),
    [forceSwipe, position, resetPosition, swipeThreshold]
  );

  const restartDeck = () => {
    setCurrentIndex(0);
    setLastAction(null);
    position.setValue({ x: 0, y: 0 });
  };

  return (
    <View style={[styles.container, { backgroundColor: background, paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <AppText variant="title">Descobrir</AppText>
        <View style={styles.badge}>
          <Ionicons name="flame" size={14} color="#FF4B6E" />
          <AppText style={styles.badgeText}>UNOCHAPECO</AppText>
        </View>
      </View>

      {lastAction && currentIndex < profiles.length && (
        <AppText style={[styles.lastAction, { color: icon }]}>
          Ultima acao: {lastAction === 'like' ? 'curtiu' : 'passou'}
        </AppText>
      )}

      <View style={styles.deckContainer}>
        {visibleProfiles.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: surface }]}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#FF4B6E" />
            <AppText variant="subtitle" style={styles.emptyTitle}>Voce viu todo mundo por hoje</AppText>
            <AppText style={[styles.emptyText, { color: icon }]}>
              Novos perfis aparecerao em breve.
            </AppText>
            <Pressable style={styles.restartButton} onPress={restartDeck}>
              <AppText style={styles.restartButtonText}>Reiniciar deck</AppText>
            </Pressable>
            <Pressable style={styles.reloadButton} onPress={loadProfiles}>
              <AppText style={styles.reloadButtonText}>Atualizar perfis</AppText>
            </Pressable>
          </View>
        ) : (
          visibleProfiles
            .map((profile, index) => {
              const isTop = index === 0;
              const cardStyle = isTop
                ? {
                    transform: [
                      { translateX: position.x },
                      { translateY: position.y },
                      { rotate },
                    ],
                  }
                : {
                    transform: [{ scale: 1 - index * 0.04 }],
                    top: index * 10,
                  };

              return (
                <Animated.View
                  key={profile.id}
                  style={[
                    styles.card,
                    { backgroundColor: surface, zIndex: 100 - index, width: width - 48 },
                    cardStyle,
                  ]}
                  {...(isTop ? panResponder.panHandlers : {})}
                >
                  {isTop && (
                    <>
                      <Animated.View style={[styles.stampLike, { opacity: likeOpacity }]}>
                        <AppText style={styles.stampLikeText}>CURTI</AppText>
                      </Animated.View>
                      <Animated.View style={[styles.stampPass, { opacity: passOpacity }]}>
                        <AppText style={styles.stampPassText}>PASSAR</AppText>
                      </Animated.View>
                    </>
                  )}

                  <View style={styles.avatar}>
                    <AppText style={styles.avatarText}>{profile.name.slice(0, 1)}</AppText>
                  </View>

                  <AppText variant="title" style={styles.name}>
                    {profile.name}, {profile.age}
                  </AppText>
                  <AppText style={[styles.course, { color: icon }]}>{profile.course}</AppText>
                  <AppText style={styles.bio}>{profile.bio}</AppText>

                  <View style={styles.interestsRow}>
                    {profile.interests.map((interest) => (
                      <View key={interest} style={styles.interestChip}>
                        <AppText style={styles.interestText}>{interest}</AppText>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              );
            })
            .reverse()
        )}
      </View>

      {visibleProfiles.length > 0 && (
        <View style={[styles.actions, { paddingBottom: insets.bottom + 8 }]}>
          <Pressable style={styles.passButton} onPress={() => forceSwipe('pass')}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.likeButton} onPress={() => forceSwipe('like')}>
            <Ionicons name="heart" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => Alert.alert('Dica', 'Arraste para a direita para curtir e para a esquerda para passar.')}
        style={styles.hint}
      >
        <Ionicons name="information-circle-outline" size={16} color={icon} />
        <AppText style={[styles.hintText, { color: icon }]}>Como funciona</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE7ED',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: '#9A1F3A',
    fontSize: 12,
    fontWeight: '700',
  },
  lastAction: {
    marginBottom: 8,
  },
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 440,
  },
  card: {
    position: 'absolute',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    minHeight: 430,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  avatar: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FF4B6E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  name: {
    textAlign: 'center',
    marginBottom: 4,
  },
  course: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  bio: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 14,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  interestChip: {
    backgroundColor: '#FF4B6E22',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  interestText: {
    color: '#9A1F3A',
    fontSize: 12,
    fontWeight: '700',
  },
  stampLike: {
    position: 'absolute',
    top: 22,
    right: 18,
    borderWidth: 2,
    borderColor: '#2ECC71',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    transform: [{ rotate: '12deg' }],
  },
  stampLikeText: {
    color: '#2ECC71',
    fontSize: 18,
    fontWeight: '800',
  },
  stampPass: {
    position: 'absolute',
    top: 22,
    left: 18,
    borderWidth: 2,
    borderColor: '#E74C3C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    transform: [{ rotate: '-12deg' }],
  },
  stampPassText: {
    color: '#E74C3C',
    fontSize: 18,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 22,
    marginTop: 8,
  },
  passButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FF4B6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  hintText: {
    fontSize: 13,
  },
  emptyState: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 14,
  },
  restartButton: {
    backgroundColor: '#FF4B6E',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reloadButton: {
    marginTop: 10,
  },
  reloadButtonText: {
    color: '#FF4B6E',
    fontWeight: '700',
  },
});
