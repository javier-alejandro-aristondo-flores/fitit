import { StyleSheet, Text, View } from 'react-native';
import { typography } from '../../constants/theme';
import { Meter } from './Meter';

interface MacroRowProps {
  label: string;
  currentG: number;
  targetG: number;
}

export function MacroRow({ label, currentG, targetG }: MacroRowProps) {
  return (
    <View style={styles.row}>
      <Text style={typography.small}>{label}</Text>
      <View style={styles.meterWrap}>
        <Meter value={currentG} max={targetG} />
      </View>
      <Text style={typography.small}>
        {currentG}/{targetG} g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meterWrap: {
    flex: 1,
  },
});
