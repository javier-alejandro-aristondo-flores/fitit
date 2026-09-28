import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface EventRowProps {
  tag: string;
  note: string;
  variant?: 'good' | 'bad' | 'neutral';
}

export function EventRow({ tag, note, variant = 'neutral' }: EventRowProps) {
  return (
    <View style={[styles.row, variant === 'good' && styles.good, variant === 'bad' && styles.bad]}>
      <Text style={styles.tag}>{tag}</Text>
      <Text style={[typography.small, styles.note]}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#bbbbbb',
  },
  tag: {
    ...typography.small,
    fontWeight: '700',
    minWidth: 78,
  },
  note: {
    flex: 1,
  },
  good: {
    borderLeftWidth: 4,
    borderLeftColor: colors.good,
  },
  bad: {
    borderLeftWidth: 4,
    borderLeftColor: colors.bad,
    borderStyle: 'dashed',
  },
});
