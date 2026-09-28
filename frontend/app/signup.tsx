import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, FormCard } from '../src/components/ui';
import { ScreenScroll } from '../src/components/layout/ScreenScroll';
import { api } from '../src/lib/api';
import { colors, spacing, typography } from '../src/constants/theme';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.auth.signup({ fullName, email, password });
      router.push('/onboarding/goal');
    } catch {
      setError('Could not create your account. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenScroll center>
      <FormCard>
        <Text style={typography.heading}>Create your account</Text>
        <View style={styles.field}>
          <Text style={typography.small}>Full name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
        </View>
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
        <View style={styles.field}>
          <Text style={typography.small}>Confirm password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={submitting ? 'Creating…' : 'Create account'} fullWidth onPress={handleSubmit} disabled={submitting} />
        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
          Already have an account?{' '}
          <Pressable onPress={() => router.push('/login')}>
            <Text style={styles.link}>Log in</Text>
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
