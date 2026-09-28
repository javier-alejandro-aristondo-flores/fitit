import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

interface StepProgressProps {
  step: number;
  total: number;
}

export function StepProgress({ step, total }: StepProgressProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.segment, i < step && styles.segmentOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 6,
    backgroundColor: '#cccccc',
  },
  segmentOn: {
    backgroundColor: colors.borderStrong,
  },
});
