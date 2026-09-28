import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../constants/theme';

export function ChatBubble({ text, fromMe }: { text: string; fromMe?: boolean }) {
  return (
    <View style={[styles.bubble, fromMe && styles.me]}>
      <Text style={typography.small}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    paddingHorizontal: 10,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: '#eeeeee',
  },
});
