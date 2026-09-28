import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../lib/api';
import type { Exercise } from '../../lib/types/routine';
import { colors, spacing, typography } from '../../constants/theme';

export function ExerciseLogTable({ exercises }: { exercises: Exercise[] }) {
  const [logs, setLogs] = useState<Record<string, { reps: string; weight: string }>>({});

  function updateLog(name: string, field: 'reps' | 'weight', value: string) {
    setLogs((prev) => ({ ...prev, [name]: { reps: prev[name]?.reps ?? '', weight: prev[name]?.weight ?? '', [field]: value } }));
  }

  function commit(name: string) {
    const entry = logs[name];
    const reps = Number(entry?.reps);
    const weight = Number(entry?.weight);
    if (Number.isFinite(reps) && Number.isFinite(weight) && reps > 0) {
      api.workouts.logSet(name, reps, weight);
    }
  }

  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[typography.small, styles.cellExercise, styles.headerText]}>Exercise</Text>
        <Text style={[typography.small, styles.cellTarget, styles.headerText]}>Target</Text>
        <Text style={[typography.small, styles.cellLog, styles.headerText]}>Log (reps × lb)</Text>
      </View>
      {exercises.map((ex) => (
        <View key={ex.name} style={styles.row}>
          <Text style={[typography.small, styles.cellExercise]}>{ex.name}</Text>
          <Text style={[typography.small, styles.cellTarget]}>{ex.sets} × {ex.repetitions}</Text>
          <View style={[styles.cellLog, styles.logInputs]}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="reps"
              onChangeText={(v) => updateLog(ex.name, 'reps', v)}
              onBlur={() => commit(ex.name)}
            />
            <Text> × </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="lb"
              onChangeText={(v) => updateLog(ex.name, 'weight', v)}
              onBlur={() => commit(ex.name)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    backgroundColor: '#eeeeee',
  },
  headerText: {
    fontWeight: '700',
  },
  cellExercise: {
    flex: 2,
    padding: spacing.sm,
  },
  cellTarget: {
    flex: 1,
    padding: spacing.sm,
  },
  cellLog: {
    flex: 2,
    padding: spacing.sm,
  },
  logInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    width: 50,
    height: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fafafa',
    paddingHorizontal: 4,
  },
});
