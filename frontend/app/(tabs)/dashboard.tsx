import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MacroRow, Meter, Panel, WeekDaysStrip } from '../../src/components/ui';
import type { WeekDay } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { api } from '../../src/lib/api';
import type { DailyNutritionalSummary } from '../../src/lib/types/nutrition';
import type { WorkoutPlanOutput } from '../../src/lib/types/routine';
import { colors, spacing, typography } from '../../src/constants/theme';

const WEEK: WeekDay[] = [
  { label: 'M', state: 'done' },
  { label: 'T', state: 'today' },
  { label: 'W', state: 'missed' },
  { label: 'T', state: 'upcoming' },
  { label: 'F', state: 'upcoming' },
  { label: 'S', state: 'upcoming' },
  { label: 'S', state: 'upcoming' },
];

export default function DashboardScreen() {
  const [plan, setPlan] = useState<WorkoutPlanOutput | null>(null);
  const [summary, setSummary] = useState<DailyNutritionalSummary | null>(null);

  useEffect(() => {
    api.routines.getCurrent().then(setPlan);
    api.logs.getDailySummary(new Date().toISOString().slice(0, 10)).then(setSummary);
  }, []);

  const todayFocus = plan?.days.find((d) => d.day.toLowerCase() === 'tuesday') ?? plan?.days[0];

  return (
    <ScreenScroll>
      <View>
        <Text style={typography.title}>Welcome back</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>Week 3 of your plan · 🔥 4-day streak</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
        <Panel onPress={() => router.push('/workout')}>
          <View style={styles.panelHeader}>
            <Text style={typography.subheading}>Workout / Trainer</Text>
            <Text style={styles.arrow}>View all →</Text>
          </View>
          {todayFocus ? (
            <>
              <Text style={typography.body}>
                Today: <Text style={{ fontWeight: '700' }}>{todayFocus.focus}</Text>
              </Text>
              <Text style={[typography.small, { color: colors.textMuted }]}>
                {todayFocus.exercises.length} exercises
              </Text>
            </>
          ) : (
            <Text style={[typography.small, { color: colors.textMuted }]}>Loading…</Text>
          )}
          <WeekDaysStrip days={WEEK} />
        </Panel>
        </View>

        <View style={styles.gridItem}>
        <Panel onPress={() => router.push('/diet')}>
          <View style={styles.panelHeader}>
            <Text style={typography.subheading}>Diet / Meals</Text>
            <Text style={styles.arrow}>View all →</Text>
          </View>
          {summary ? (
            <>
              <Text style={{ fontWeight: '700' }}>
                {summary.totalCalories} / {summary.calorieTargetAtDate} kcal
              </Text>
              <Meter value={summary.totalCalories} max={summary.calorieTargetAtDate} />
              <MacroRow label="Protein" currentG={summary.totalProteinG} targetG={160} />
              <MacroRow label="Carbs" currentG={summary.totalCarbsG} targetG={250} />
              <MacroRow label="Fat" currentG={summary.totalFatG} targetG={70} />
            </>
          ) : (
            <Text style={[typography.small, { color: colors.textMuted }]}>Loading…</Text>
          )}
        </Panel>
        </View>

        {/* Impact has no backing data model yet — SCRUM-27/18 cover nutrition and
            workout-plan input/output only. These numbers are illustrative placeholders
            until a progress-tracking schema exists. */}
        <View style={styles.gridItem}>
        <Panel onPress={() => router.push('/impact')}>
          <View style={styles.panelHeader}>
            <Text style={typography.subheading}>Impact</Text>
            <Text style={styles.arrow}>View all →</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.statValue}>+0.6 lb</Text>
            <Text style={styles.statValue}>−2.1 lb</Text>
          </View>
          <View style={styles.row}>
            <Text style={typography.small}>muscle (est.)</Text>
            <Text style={typography.small}>fat (est.)</Text>
          </View>
        </Panel>
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
    flexBasis: 280,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrow: {
    color: colors.textFaint,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 18,
  },
});
