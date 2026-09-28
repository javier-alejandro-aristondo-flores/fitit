import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../../constants/theme';

export function BackLink({ label = '← Back to dashboard' }: { label?: string }) {
  return (
    <Pressable onPress={() => router.back()} style={styles.wrap}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  text: {
    ...typography.body,
    color: colors.text,
    textDecorationLine: 'underline',
  },
});
