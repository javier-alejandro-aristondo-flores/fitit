import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

interface MeterProps {
  value: number;
  max: number;
}

export function Meter({ value, max }: MeterProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#eeeeee',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.done,
  },
});
