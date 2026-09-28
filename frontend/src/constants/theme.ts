// Palette mirrors the grayscale wireframes in docs/wireframes/*.html. Intentionally
// low-fidelity until a visual design pass replaces these tokens.
export const colors = {
  background: '#f2f2f2',
  surface: '#ffffff',
  text: '#222222',
  textMuted: '#666666',
  textFaint: '#777777',
  border: '#888888',
  borderStrong: '#444444',
  borderDashed: '#999999',
  accent: '#444444',
  accentText: '#ffffff',
  done: '#555555',
  good: '#222222',
  bad: '#222222',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 4,
  md: 6,
  full: 999,
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '700' as const },
  subheading: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};
