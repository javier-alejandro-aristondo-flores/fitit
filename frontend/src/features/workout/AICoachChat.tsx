import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../lib/api';
import { colors, spacing, typography } from '../../constants/theme';
import { Button, Panel } from '../../components/ui';
import { ChatBubble } from './ChatBubble';

interface Message {
  text: string;
  fromMe?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { text: 'You missed leg day Wednesday. Want me to add it to Saturday?' },
  { text: 'Yes, but keep it under an hour.', fromMe: true },
  { text: 'Done. Saturday is now a 55-min lower-body session.' },
];

export function AICoachChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  function send() {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { text: draft, fromMe: true }]);
    setDraft('');
  }

  async function regenerate() {
    setRegenerating(true);
    try {
      await api.routines.generate({
        goal: 'Build muscle',
        experienceLevel: 'Beginner',
        daysPerWeek: 4,
        sessionLengthMinutes: 45,
        equipment: ['Dumbbells', 'Bench'],
        limitations: 'No known injuries',
        preferredTrainingStyle: 'Strength training',
      });
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <Panel>
      <Text style={typography.subheading}>AI Coach</Text>
      <View style={styles.chat}>
        {messages.map((m, i) => (
          <ChatBubble key={i} text={m.text} fromMe={m.fromMe} />
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message your coach"
          style={styles.input}
        />
        <Button label="Send" onPress={send} />
      </View>
      <Button
        label={regenerating ? 'Regenerating…' : 'Regenerate my weekly plan'}
        variant="ghost"
        onPress={regenerate}
        disabled={regenerating}
      />
    </Panel>
  );
}

const styles = StyleSheet.create({
  chat: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fafafa',
    paddingHorizontal: spacing.sm,
  },
});
