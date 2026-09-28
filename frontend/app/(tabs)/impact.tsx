import { StyleSheet, Text, View } from 'react-native';
import { EventRow, Panel, StatTile } from '../../src/components/ui';
import { ScreenScroll } from '../../src/components/layout/ScreenScroll';
import { colors, spacing, typography } from '../../src/constants/theme';

// No backing data model exists yet for progress/impact tracking (SCRUM-27 covers
// nutrition, SCRUM-18 covers workout-plan generation only) — this screen renders
// against static placeholder numbers matching docs/wireframes/dashboard.html until
// that schema and its endpoint exist.
export default function ImpactScreen() {
  return (
    <ScreenScroll>
      <Text style={typography.heading}>Your progress</Text>
      <View style={styles.statsRow}>
        <StatTile value="+0.6 lb" label="muscle gained (est.)" />
        <StatTile value="−2.1 lb" label="fat lost (est.)" />
        <StatTile value="Dec 14" label="projected goal date (was Dec 13)" />
      </View>
      <Panel>
        <Text style={typography.subheading}>Projection</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={[typography.small, { color: colors.textFaint }]}>
            line chart: original plan (dashed) vs actual progress (solid)
          </Text>
        </View>
      </Panel>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Panel>
            <Text style={typography.subheading}>Timeline</Text>
            <EventRow tag="Sat 9/19" note="Extra mile: +2 sets on lower day. Goal moved up 1 day." variant="good" />
            <EventRow tag="Wed 9/16" note="Skipped leg day. Goal moved back 2 days." variant="bad" />
            <EventRow tag="Mon 9/14" note="Hit a protein target 5 days in a row." variant="good" />
          </Panel>
        </View>
        <View style={styles.gridItem}>
          <Panel>
            <Text style={typography.subheading}>Consistency</Text>
            <StatTile value="86%" label="workouts completed this month" />
            <StatTile value="78%" label="days on calorie target" />
            <Text style={[typography.small, { color: colors.textMuted }]}>
              Estimates come from the AI and are not medical measurements.
            </Text>
          </Panel>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chartPlaceholder: {
    height: 200,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 300,
    gap: spacing.sm,
  },
});
