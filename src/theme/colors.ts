export const lightColors = {
  background: '#F4F6FB',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  accent: '#0284C7',
  accentLight: '#E0F2FE',
  northAccent: '#DC2626', // Vibrant Red for North
  cardinalText: '#0F172A',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  compassDialBg: '#FFFFFF',
  compassRing: '#CBD5E1',
  compassRingGlow: '#0284C733',
  compassTick: '#94A3B8',
  compassTickMajor: '#1E293B',
  levelBubble: '#10B981',
  levelBubbleTilt: '#F59E0B',
  lockBannerBg: '#E0F2FE',
  lockBannerText: '#0369A1',
  statusBar: 'dark-content' as const,
};

export const darkColors = {
  background: '#070A11',
  card: '#111722',
  cardBorder: '#1E293D',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#38BDF8',
  accentLight: '#0F2942',
  northAccent: '#FF3B30', // Glowing Neon Crimson for North
  cardinalText: '#F8FAFC',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#FF3B30',
  compassDialBg: '#0D131E',
  compassRing: '#1E293D',
  compassRingGlow: '#38BDF840',
  compassTick: '#334155',
  compassTickMajor: '#CBD5E1',
  levelBubble: '#34D399',
  levelBubbleTilt: '#FBBF24',
  lockBannerBg: '#0F2942',
  lockBannerText: '#7DD3FC',
  statusBar: 'light-content' as 'dark-content' | 'light-content',
};

export type ThemeColors = Omit<typeof lightColors, 'statusBar'> & {
  statusBar: 'dark-content' | 'light-content';
};

