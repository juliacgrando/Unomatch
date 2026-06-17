import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/atoms/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ChatItem, Message, api } from '@/services/api';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');

  const loadChats = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await api.chats(token);
      setChats(response.chats);
    } catch (error) {
      Alert.alert('Erro ao carregar chats', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }, [token]);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  const newMatches = useMemo(
    () => chats.filter((chat) => chat.isNewMatch),
    [chats]
  );

  const openChat = async (chat: ChatItem) => {
    if (!token) {
      return;
    }

    setSelectedChat(chat);
    setLoadingMessages(true);

    try {
      const response = await api.messages(token, chat.id);
      setMessages(response.messages);
      setChats((current) =>
        current.map((item) =>
          item.id === chat.id ? { ...item, unreadCount: 0, isNewMatch: false } : item
        )
      );
    } catch (error) {
      Alert.alert('Erro ao abrir conversa', error instanceof Error ? error.message : 'Tente novamente.');
      setSelectedChat(null);
    } finally {
      setLoadingMessages(false);
    }
  };

  const closeChat = () => {
    setSelectedChat(null);
    setMessages([]);
    setDraft('');
    void loadChats();
  };

  const sendMessage = async () => {
    const textToSend = draft.trim();
    if (!token || !selectedChat || !textToSend || sending) {
      return;
    }

    setSending(true);

    try {
      const response = await api.sendMessage(token, selectedChat.id, textToSend);
      setMessages((current) => [...current, response.message]);
      setDraft('');
      setChats((current) =>
        current.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, message: textToSend, time: 'Agora', unreadCount: 0, isNewMatch: false }
            : chat
        )
      );
    } catch (error) {
      Alert.alert('Erro ao enviar mensagem', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (selectedChat) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: background }]}
      >
        <View style={[styles.chatHeader, { paddingTop: insets.top + 12, backgroundColor: surface }]}>
          <Pressable style={styles.backButton} onPress={closeChat}>
            <Ionicons name="chevron-back" size={22} color={text} />
          </Pressable>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{selectedChat.name.slice(0, 1)}</AppText>
          </View>
          <View style={styles.headerText}>
            <AppText variant="subtitle">{selectedChat.name}</AppText>
            <AppText style={[styles.statusText, { color: icon }]}>
              {selectedChat.online ? 'Online agora' : 'Conversa do match'}
            </AppText>
          </View>
        </View>

        <ScrollView
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {loadingMessages ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#FF4B6E" />
              <AppText style={[styles.emptyText, { color: icon }]}>Carregando conversa...</AppText>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color={icon} />
              <AppText style={[styles.emptyText, { color: icon }]}>Comece a conversa.</AppText>
            </View>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === user?.id;
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    isMine ? styles.myMessage : styles.theirMessage,
                    { backgroundColor: isMine ? '#FF4B6E' : surface },
                  ]}
                >
                  <AppText style={[styles.messageText, { color: isMine ? '#FFFFFF' : text }]}>
                    {message.text}
                  </AppText>
                  <AppText style={[styles.messageTime, { color: isMine ? '#FFE3EA' : icon }]}>
                    {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </AppText>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.composer, { paddingBottom: insets.bottom + 12, backgroundColor: background }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Digite uma mensagem"
            placeholderTextColor={icon}
            multiline
            style={[styles.composerInput, { backgroundColor: surface, color: text }]}
          />
          <Pressable
            style={[styles.sendButton, (!draft.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!draft.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <AppText variant="title">Chats</AppText>
      </View>
      <AppText style={[styles.subtitle, { color: icon }]}>Abra uma conversa e envie mensagens pelo backend online.</AppText>

      {newMatches.length > 0 ? (
        <View style={[styles.section, { backgroundColor: surface }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Matches novos</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchList}>
            {newMatches.map((match) => (
              <Pressable key={match.id} style={styles.matchPill} onPress={() => openChat(match)}>
                <View style={styles.avatar}>
                  <AppText style={styles.avatarText}>{match.name.slice(0, 1)}</AppText>
                </View>
                <AppText style={styles.matchName}>{match.name}</AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={[styles.section, { backgroundColor: surface }]}>
        <AppText variant="subtitle" style={styles.sectionTitle}>Conversas</AppText>
        {chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={icon} />
            <AppText style={[styles.emptyText, { color: icon }]}>Nenhuma conversa encontrada.</AppText>
          </View>
        ) : (
          chats.map((chat) => (
            <Pressable key={chat.id} style={styles.chatRow} onPress={() => openChat(chat)}>
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
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 14,
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
  chatHeader: {
    minHeight: 86,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  statusText: {
    fontSize: 13,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 10,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  composer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  composerInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF4B6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
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
