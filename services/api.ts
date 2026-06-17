import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExpoRuntimeConstants = typeof Constants & {
  manifest?: {
    debuggerHost?: string;
  };
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string;
      };
    };
  };
};

function apiUrlFromHostUri(hostUri?: string | null) {
  const host = hostUri?.split('/')[0]?.split(':')[0];
  return host ? `http://${host}:3333` : null;
}

function getExpoHostUri() {
  const runtimeConstants = Constants as ExpoRuntimeConstants;
  return (
    runtimeConstants.expoConfig?.hostUri ||
    runtimeConstants.manifest2?.extra?.expoClient?.hostUri ||
    runtimeConstants.manifest?.debuggerHost ||
    null
  );
}

function getDefaultApiUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:3333`;
  }

  const expoHostApiUrl = apiUrlFromHostUri(getExpoHostUri());
  if (expoHostApiUrl) {
    return expoHostApiUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3333';
  }

  return 'http://localhost:3333';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

export type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  course: string;
  bio: string;
  interests: string[];
  university: string;
  distanceKm: number;
  notificationsEnabled: boolean;
  showOnlyUniversity: boolean;
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  online: boolean;
};

export type Profile = {
  id: string;
  name: string;
  age: number;
  course: string;
  bio: string;
  interests: string[];
  university: string;
  distanceKm: number;
  online: boolean;
};

export type ChatItem = {
  id: string;
  profileId: string;
  name: string;
  message: string;
  time: string;
  unreadCount: number;
  online: boolean;
  isNewMatch?: boolean;
};

export type Message = {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  readBy: string[];
  createdAt: string;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...fetchOptions } = options;
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (_error) {
    throw new Error(`Nao foi possivel conectar a API em ${API_URL}.`);
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Nao foi possivel conectar ao Unomatch.');
  }

  return payload;
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(input: { name: string; email: string; password: string }) {
    return request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  logout(token: string) {
    return request<{ ok: true }>('/auth/logout', {
      method: 'POST',
      token,
    });
  },

  me(token: string) {
    return request<{ user: User }>('/me', { token });
  },

  updateMe(token: string, patch: Partial<User>) {
    return request<{ user: User }>('/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(patch),
    });
  },

  discoverProfiles(token: string) {
    return request<{ profiles: Profile[] }>('/profiles/discover', { token });
  },

  searchProfiles(
    token: string,
    filters: { query?: string; course?: string; interest?: string }
  ) {
    const params = new URLSearchParams();

    if (filters.query) {
      params.set('query', filters.query);
    }

    if (filters.course && filters.course !== 'Todos') {
      params.set('course', filters.course);
    }

    if (filters.interest && filters.interest !== 'Todos') {
      params.set('interest', filters.interest);
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';
    return request<{ profiles: Profile[] }>(`/profiles${suffix}`, { token });
  },

  swipeProfile(token: string, profileId: string, action: 'like' | 'pass') {
    return request<{ ok: boolean; matched: boolean }>('/swipes', {
      method: 'POST',
      token,
      body: JSON.stringify({ profileId, action }),
    });
  },

  chats(token: string) {
    return request<{ chats: ChatItem[] }>('/chats', { token });
  },

  messages(token: string, chatId: string) {
    return request<{ messages: Message[] }>(`/chats/${chatId}/messages`, { token });
  },

  sendMessage(token: string, chatId: string, text: string) {
    return request<{ message: Message }>(`/chats/${chatId}/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ text }),
    });
  },
};
