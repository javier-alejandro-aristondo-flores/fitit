import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { api } from '../../src/lib/api';
import { draftToWorkoutPlanInput } from '../../src/features/onboarding/onboardingState';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function GeneratingScreen() {
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    api.routines
      .generate(draftToWorkoutPlanInput())
      .then(() => {
        if (!cancelled) router.replace('/dashboard');
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <ScreenScroll center>
      <View style={styles.wrap}>
        {error ? (
          <>
            <Text style={typography.heading}>Something went wrong.</Text>
            <Text style={[typography.body, { color: colors.textMuted }]}>Could not generate your plan.</Text>
            <Button label="Try again" onPress={() => setAttempt((a) => a + 1)} />
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={colors.borderStrong} />
            <Text style={typography.heading}>Building your personalized plan…</Text>
            <Text style={[typography.body, { color: colors.textMuted }]}>This usually takes a few seconds.</Text>
          </>
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
  },
});
