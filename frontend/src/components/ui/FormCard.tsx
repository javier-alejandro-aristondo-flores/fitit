import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';

interface FormCardProps {
  children: ReactNode;
  wide?: boolean;
}

export function FormCard({ children, wide }: FormCardProps) {
  return <View style={[styles.card, wide && styles.wide]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  wide: {
    maxWidth: 560,
  },
});
