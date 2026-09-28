import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', fullWidth, disabled }: ButtonProps) {
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isGhost ? styles.ghost : styles.primary,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, isGhost ? styles.labelGhost : styles.labelPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  ghost: {
    backgroundColor: colors.surface,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  labelPrimary: {
    color: colors.accentText,
  },
  labelGhost: {
    color: colors.text,
  },
});
