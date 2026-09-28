import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

export type DayState = 'done' | 'missed' | 'today' | 'upcoming';

export interface WeekDay {
  label: string;
  sublabel?: string;
  state: DayState;
}

export function WeekDaysStrip({ days }: { days: WeekDay[] }) {
  return (
    <View style={styles.row}>
      {days.map((d, i) => (
        <View key={i} style={[styles.day, styles[d.state]]}>
          <Text style={styles.label}>{d.label}</Text>
          {d.sublabel ? <Text style={styles.sublabel}>{d.sublabel}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 11,
  },
  sublabel: {
    fontSize: 10,
  },
  done: {
    backgroundColor: colors.done,
  },
  missed: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  today: {
    borderWidth: 3,
    borderColor: colors.borderStrong,
  },
  upcoming: {},
});
