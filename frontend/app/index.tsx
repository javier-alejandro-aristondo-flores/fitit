import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/ui';
import { ScreenScroll } from '../src/components/layout/ScreenScroll';
import { colors, spacing, typography } from '../src/constants/theme';

export default function LandingScreen() {
  return (
    <ScreenScroll center>
      <View style={styles.hero}>
        <Text style={styles.brand}>FitIT</Text>
        <Text style={typography.title}>Your AI fitness coach</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Personalized workouts, meal plans, and progress tracking.
        </Text>
        <View style={styles.actions}>
          <Button label="Get started — it's free" onPress={() => router.push('/signup')} />
          <Button label="Log in" variant="ghost" onPress={() => router.push('/login')} />
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 480,
  },
  brand: {
    fontWeight: '700',
    borderWidth: 2,
    borderColor: colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.lg,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
});
