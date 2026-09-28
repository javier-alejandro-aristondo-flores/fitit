import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, FormCard, OptionChip, StepProgress } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { getOnboardingDraft, updateOnboardingDraft } from '../../src/features/onboarding/onboardingState';
import { spacing, typography } from '../../src/constants/theme';

const GOALS = ['Lose fat', 'Build muscle', 'Get stronger', 'General fitness'];

export default function OnboardingGoalScreen() {
  const [goal, setGoal] = useState(getOnboardingDraft().goal || GOALS[0]);

  function next() {
    updateOnboardingDraft({ goal });
    router.push('/onboarding/about');
  }

  return (
    <ScreenScroll center>
      <FormCard wide>
        <StepProgress step={1} total={3} />
        <Text style={typography.heading}>What's your main goal?</Text>
        <View style={styles.options}>
          {GOALS.map((g) => (
            <OptionChip key={g} label={g} selected={g === goal} onPress={() => setGoal(g)} />
          ))}
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
});
