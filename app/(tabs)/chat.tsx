import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/atoms/AppText';
import { useThemeColor } from '@/hooks/use-theme-color';

type ChatItem = {
  id: string;
  name: string;
  message: string;
  time: string;
  unreadCount: number;
  online: boolean;
  isNewMatch?: boolean;
};

const MOCK_CHATS: ChatItem[] = [
  { id: '1', name: 'Ana', message: 'Vamos no cafe da UNO depois da aula?', time: '09:14', unreadCount: 2, online: true, isNewMatch: true },
  { id: '2', name: 'Pedro', message: 'Gostei da sua ideia sobre o projeto final.', time: 'Ontem', unreadCount: 0, online: false },
  { id: '3', name: 'Luiza', message: 'Tu vai no evento de tecnologia hoje?', time: 'Ontem', unreadCount: 1, online: true },
  { id: '4', name: 'Rafael', message: 'Fechou, te encontro na biblioteca.', time: 'Seg', unreadCount: 0, online: false },
  { id: '5', name: 'Camila', message: 'Match novo! Bora conversar?', time: 'Seg', unreadCount: 4, online: true, isNewMatch: true },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');

  const filteredChats = useMemo(() => {
    return MOCK_CHATS.filter((chat) => {
      const matchesQuery = chat.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesUnread = showUnreadOnly ? chat.unreadCount > 0 : true;
      return matchesQuery && matchesUnread;
    });
  }, [query, showUnreadOnly]);

  const newMatches = useMemo(
    () => MOCK_CHATS.filter((chat) => chat.isNewMatch),
    []
  );

  const openChat = (name: string) => {
    Alert.alert('Em breve', `Conversa com ${name} sera habilitada na proxima etapa.`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <AppText variant="title">Chats</AppText>
        <Pressable style={styles.iconButton} onPress={() => Alert.alert('Em breve', 'Filtro avancado sera adicionado.')}>
          <Ionicons name="options-outline" size={20} color={text} />
        </Pressable>
      </View>
      <AppText style={[styles.subtitle, { color: icon }]}>Converse com seus matches da UNOCHAPECO.</AppText>

      <View style={[styles.searchRow, { backgroundColor: surface }]}>
        <Ionicons name="search-outline" size={18} color={icon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar conversa"
          placeholderTextColor={icon}
          style={[styles.searchInput, { color: text }]}
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterButton, { borderColor: tint }, !showUnreadOnly && { backgroundColor: '#FF4B6E' }]}
          onPress={() => setShowUnreadOnly(false)}
        >
          <AppText style={[styles.filterText, !showUnreadOnly && styles.filterTextActive]}>Todas</AppText>
        </Pressable>
        <Pressable
          style={[styles.filterButton, { borderColor: tint }, showUnreadOnly && { backgroundColor: '#FF4B6E' }]}
          onPress={() => setShowUnreadOnly(true)}
        >
          <AppText style={[styles.filterText, showUnreadOnly && styles.filterTextActive]}>Nao lidas</AppText>
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: surface }]}>
        <AppText variant="subtitle" style={styles.sectionTitle}>Matches novos</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchList}>
          {newMatches.map((match) => (
            <Pressable key={match.id} style={styles.matchPill} onPress={() => openChat(match.name)}>
              <View style={styles.avatar}>
                <AppText style={styles.avatarText}>{match.name.slice(0, 1)}</AppText>
              </View>
              <AppText style={styles.matchName}>{match.name}</AppText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.section, { backgroundColor: surface }]}>
        <AppText variant="subtitle" style={styles.sectionTitle}>Conversas</AppText>
        {filteredChats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={icon} />
            <AppText style={[styles.emptyText, { color: icon }]}>Nenhuma conversa encontrada.</AppText>
          </View>
        ) : (
          filteredChats.map((chat) => (
            <Pressable key={chat.id} style={styles.chatRow} onPress={() => openChat(chat.name)}>
              <View style={styles.chatLeft}>
                <View style={styles.avatar}>
                  <AppText style={styles.avatarText}>{chat.name.slice(0, 1)}</AppText>
                  {chat.online && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.chatInfo}>
                  <AppText style={styles.chatName}>{chat.name}</AppText>
                  <AppText
                    numberOfLines={1}
                    style={[styles.chatMessage, { color: chat.unreadCount > 0 ? text : icon }]}
                  >
                    {chat.message}
                  </AppText>
                </View>
              </View>
              <View style={styles.chatRight}>
                <AppText style={[styles.chatTime, { color: icon }]}>{chat.time}</AppText>
                {chat.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <AppText style={styles.badgeText}>{chat.unreadCount}</AppText>
                  </View>
                )}
              </View>
            </Pressable>
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
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterText: {
    color: '#FF4B6E',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  matchList: {
    gap: 12,
    paddingRight: 4,
  },
  matchPill: {
    alignItems: 'center',
    width: 70,
  },
  matchName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B6E',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#2ECC71',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  chatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatInfo: {
    marginLeft: 10,
    flex: 1,
    paddingRight: 8,
  },
  chatName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  chatMessage: {
    fontSize: 14,
  },
  chatRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 52,
  },
  chatTime: {
    fontSize: 12,
    marginBottom: 6,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4B6E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
