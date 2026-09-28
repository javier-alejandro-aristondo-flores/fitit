import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, EventRow, Panel, StatTile } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { api } from '../../src/lib/api';
import type { DailyNutritionalSummary } from '../../src/lib/types/nutrition';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function DietScreen() {
  const [summary, setSummary] = useState<DailyNutritionalSummary | null>(null);
  const [logText, setLogText] = useState('');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    api.logs.getDailySummary(new Date().toISOString().slice(0, 10)).then(setSummary);
  }, []);

  async function handleLog() {
    if (!logText.trim()) return;
    setLogging(true);
    try {
      await api.logs.logFoodFromText(logText);
      setLogText('');
    } finally {
      setLogging(false);
    }
  }

  const remaining = summary ? summary.calorieTargetAtDate - summary.totalCalories : null;

  return (
    <ScreenScroll>
      <Text style={typography.heading}>Today's nutrition</Text>
      <View style={styles.statsRow}>
        <StatTile value={summary ? String(summary.calorieTargetAtDate) : '—'} label="daily kcal target" />
        <StatTile value="160 / 250 / 70 g" label="protein / carbs / fat" />
        <StatTile value={remaining !== null ? String(remaining) : '—'} label="kcal remaining" />
      </View>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Panel>
            <Text style={typography.subheading}>Meal plan</Text>
            <EventRow tag="Breakfast" note="Greek yogurt, oats, berries · 480 kcal · ✓ eaten" variant="good" />
            <EventRow tag="Lunch" note="Turkey wrap, apple · 550 kcal · ✓ eaten" variant="good" />
            <EventRow tag="Dinner" note="Chicken rice bowl · 620 kcal" />
            <EventRow tag="Snack" note="Protein shake, almonds · 350 kcal" />
            <View style={styles.actions}>
              <Button label="Swap a meal" variant="ghost" />
              <Button label="Regenerate plan" variant="ghost" />
            </View>
          </Panel>
        </View>
        <View style={styles.gridItem}>
          <Panel>
            <Text style={typography.subheading}>Log food</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                value={logText}
                onChangeText={setLogText}
                placeholder='e.g. "2 eggs and toast"'
              />
              <Button label={logging ? 'Adding…' : 'Add'} onPress={handleLog} disabled={logging} />
            </View>
            <Text style={[typography.small, { color: colors.textMuted }]}>
              Type something like "2 eggs and toast" and the AI estimates calories and macros.
            </Text>
            <Text style={typography.subheading}>Preferences</Text>
            <Text style={typography.small}>Diet: No restrictions · Allergies: None · Meals per day: 4</Text>
          </Panel>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 300,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fafafa',
    paddingHorizontal: spacing.sm,
  },
});
