import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, FormCard } from '../src/components/ui';
import { ScreenScroll } from '../src/components/layout/ScreenScroll';
import { api } from '../src/lib/api';
import { colors, spacing, typography } from '../src/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await api.auth.login({ email, password });
      router.replace(result.onboardingComplete ? '/dashboard' : '/onboarding/goal');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenScroll center>
      <FormCard>
        <Text style={typography.heading}>Welcome back</Text>
        <View style={styles.field}>
          <Text style={typography.small}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.field}>
          <Text style={typography.small}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={submitting ? 'Logging in…' : 'Log in'} fullWidth onPress={handleSubmit} disabled={submitting} />
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
          New here?{' '}
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={styles.link}>Create an account</Text>
          </Pressable>
        </Text>
      </FormCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 4,
  },
  input: {
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fafafa',
    paddingHorizontal: spacing.sm,
  },
  error: {
    color: '#b00020',
    fontSize: 13,
  },
  link: {
    textDecorationLine: 'underline',
    color: colors.text,
  },
});
