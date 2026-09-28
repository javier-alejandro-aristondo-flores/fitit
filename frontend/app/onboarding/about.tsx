import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, FormCard, OptionChip, StepProgress } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { getOnboardingDraft, updateOnboardingDraft } from '../../src/features/onboarding/onboardingState';
import { colors, spacing, typography } from '../../src/constants/theme';

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DAYS_OPTIONS = [2, 3, 4, 5];

export default function OnboardingAboutScreen() {
  const draft = getOnboardingDraft();
  const [experienceLevel, setExperienceLevel] = useState(draft.experienceLevel || EXPERIENCE_LEVELS[1]);
  const [age, setAge] = useState(draft.age);
  const [height, setHeight] = useState(draft.height);
  const [weight, setWeight] = useState(draft.weight);
  const [daysPerWeek, setDaysPerWeek] = useState(draft.daysPerWeek || 4);

  function next() {
    updateOnboardingDraft({ experienceLevel, age, height, weight, daysPerWeek });
    router.push('/onboarding/equipment');
  }

  return (
    <ScreenScroll center>
      <FormCard wide>
        <StepProgress step={2} total={3} />
        <Text style={typography.heading}>Tell us about you</Text>

        <View style={styles.field}>
          <Text style={typography.small}>Experience level</Text>
          <View style={styles.options}>
            {EXPERIENCE_LEVELS.map((level) => (
              <OptionChip key={level} label={level} selected={level === experienceLevel} onPress={() => setExperienceLevel(level)} />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={typography.small}>Age</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={typography.small}>Height</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={typography.small}>Weight</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={typography.small}>Workout days per week</Text>
          <View style={styles.options}>
            {DAYS_OPTIONS.map((d) => (
              <OptionChip key={d} label={d === 5 ? '5+' : String(d)} selected={d === daysPerWeek} onPress={() => setDaysPerWeek(d)} />
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <Button label="Back" variant="ghost" onPress={() => router.back()} />
          <Button label="Next" onPress={next} />
        </View>
      </FormCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  input: {
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fafafa',
    paddingHorizontal: spacing.sm,
  },
});
