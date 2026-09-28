import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface OptionChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function OptionChip({ label, selected, onPress }: OptionChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.option, selected && styles.selected]}>
      <Text style={[typography.body, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 120,
    flexGrow: 1,
  },
  selected: {
    borderWidth: 3,
    borderColor: colors.borderStrong,
  },
  selectedLabel: {
    fontWeight: '600',
  },
});
