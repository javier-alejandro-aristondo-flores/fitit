import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, FormCard, OptionChip, StepProgress } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { getOnboardingDraft, updateOnboardingDraft } from '../../src/features/onboarding/onboardingState';
import { colors, spacing, typography } from '../../src/constants/theme';

const EQUIPMENT_OPTIONS = ['Full gym', 'Dumbbells', 'Barbell', 'Resistance bands', 'Pull-up bar', 'Bodyweight only'];

export default function OnboardingEquipmentScreen() {
  const [selected, setSelected] = useState<string[]>(getOnboardingDraft().equipment);

  function toggle(item: string) {
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  }

  function generate() {
    updateOnboardingDraft({ equipment: selected });
    router.push('/onboarding/generating');
  }

  return (
    <ScreenScroll center>
      <FormCard wide>
        <StepProgress step={3} total={3} />
        <Text style={typography.heading}>What equipment do you have?</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>Select all that apply.</Text>
        <View style={styles.options}>
          {EQUIPMENT_OPTIONS.map((item) => (
            <OptionChip key={item} label={item} selected={selected.includes(item)} onPress={() => toggle(item)} />
          ))}
        </View>
        <View style={styles.row}>
          <Button label="Back" variant="ghost" onPress={() => router.back()} />
          <Button label="Generate my plan" onPress={generate} />
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
