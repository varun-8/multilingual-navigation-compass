import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LocationData } from '../types/compass';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { t } from '../i18n';
import { MapPin, Copy, Share2 } from 'lucide-react-native';

interface LocationCardProps {
  location: LocationData | null;
  hasPermission: boolean;
  onRequestPermission: () => void;
}

const LocationCardComponent: React.FC<LocationCardProps> = ({
  location,
  hasPermission,
  onRequestPermission,
}) => {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const formatCoord = (deg: number, positiveDirection: string, negativeDirection: string) => {
    const abs = Math.abs(deg).toFixed(4);
    const dir = deg >= 0 ? positiveDirection : negativeDirection;
    return `${abs}° ${dir}`;
  };

  const handleCopy = async () => {
    if (!location) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    const text = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!location) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    const text = `My Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} (https://maps.google.com/?q=${location.latitude},${location.longitude})`;
    try {
      await Share.share({
        message: text,
        title: t('share_location'),
      });
    } catch (e) {
      Alert.alert(t('share_location'), text);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MapPin size={18} color={colors.accent} style={styles.icon} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('location')}</Text>
        </View>

        {location && (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: 'transparent',
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Copy size={13} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>
                {copied ? '✓' : t('copy_coordinates')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: 'transparent',
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={13} color={colors.accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!hasPermission ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('location_permission_explanation')}
          </Text>
          <TouchableOpacity
            style={[styles.requestBtn, { backgroundColor: colors.accent }]}
            onPress={onRequestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.requestBtnText}>{t('request_permission')}</Text>
          </TouchableOpacity>
        </View>
      ) : !location ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('location_unavailable')}
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          <View style={[styles.gridItem, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('latitude')}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {formatCoord(location.latitude, 'N', 'S')}
            </Text>
          </View>

          <View style={[styles.gridItem, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('longitude')}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {formatCoord(location.longitude, 'E', 'W')}
            </Text>
          </View>

          <View style={[styles.gridItem, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('altitude')}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {location.altitude != null ? `${location.altitude} m` : '—'}
            </Text>
          </View>

          <View style={[styles.gridItem, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('declination')}</Text>
            <Text style={[styles.value, { color: colors.accent }]}>
              {location.declination > 0 ? `+${location.declination}°` : `${location.declination}°`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export const LocationCard = React.memo(LocationCardComponent);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: typography.fontFamily.headingBold,
    backgroundColor: 'transparent',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  actionText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    marginLeft: 4,
    backgroundColor: 'transparent',
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
    backgroundColor: 'transparent',
  },
  requestBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    backgroundColor: 'transparent',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  value: {
    fontSize: 15,
    fontFamily: typography.fontFamily.headingBold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
    backgroundColor: 'transparent',
  },
});
