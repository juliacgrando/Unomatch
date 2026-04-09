import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AppText } from '@/components/atoms/AppText';
import { useThemeColor } from '@/hooks/use-theme-color';

const APP_TITLE = 'Exemplo';

export type TopBarProps = {
  onNotificationsPress?: () => void;
};

export function TopBar({ onNotificationsPress }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          backgroundColor,
        },
      ]}
    >
      <AppText variant="title" style={styles.title}>
        {APP_TITLE}
      </AppText>
      <TouchableOpacity
        onPress={onNotificationsPress}
        style={styles.iconButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialIcons name="notifications-none" size={26} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    ...(Platform.OS === 'android' && { elevation: 2 }),
  },
  title: {
    fontSize: 22,
  },
  iconButton: {
    padding: 4,
  },
});
