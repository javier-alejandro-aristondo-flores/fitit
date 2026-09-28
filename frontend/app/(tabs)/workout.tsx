import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, WeekDaysStrip } from '../../src/components/ui';
import type { WeekDay } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { AICoachChat } from '../../src/features/workout/AICoachChat';
import { ExerciseLogTable } from '../../src/features/workout/ExerciseLogTable';
import { api } from '../../src/lib/api';
import type { WorkoutPlanOutput } from '../../src/lib/types/routine';
import { spacing, typography } from '../../src/constants/theme';

const WEEK: WeekDay[] = [
  { label: 'Mon', sublabel: 'Pull', state: 'done' },
  { label: 'Tue', sublabel: 'Push', state: 'today' },
  { label: 'Wed', sublabel: 'Legs', state: 'missed' },
  { label: 'Thu', sublabel: 'Rest', state: 'upcoming' },
  { label: 'Fri', sublabel: 'Upper', state: 'upcoming' },
  { label: 'Sat', sublabel: 'Lower', state: 'upcoming' },
  { label: 'Sun', sublabel: 'Rest', state: 'upcoming' },
];

export default function WorkoutScreen() {
  const [plan, setPlan] = useState<WorkoutPlanOutput | null>(null);

  useEffect(() => {
    api.routines.getCurrent().then(setPlan);
  }, []);

  const todayFocus = plan?.days.find((d) => d.day.toLowerCase() === 'tuesday') ?? plan?.days[0];

  return (
    <ScreenScroll>
      <Text style={typography.heading}>This week's plan</Text>
      <WeekDaysStrip days={WEEK} />
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={[typography.subheading, styles.spacer]}>
            Today: {todayFocus?.focus ?? '…'}
          </Text>
          {todayFocus ? <ExerciseLogTable exercises={todayFocus.exercises} /> : null}
          <View style={styles.actions}>
            <Button label="Finish workout" onPress={() => api.workouts.finishWorkout()} />
            <Button label="Skip today" variant="ghost" onPress={() => api.workouts.skipToday()} />
          </View>
        </View>
        <View style={styles.gridItem}>
          <AICoachChat />
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 300,
    gap: spacing.md,
  },
  spacer: {
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
