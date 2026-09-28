import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';

interface PanelProps {
  children: ReactNode;
  onPress?: () => void;
}

export function Panel({ children, onPress }: PanelProps) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.panel}>
        {children}
      </Pressable>
    );
  }
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
});
