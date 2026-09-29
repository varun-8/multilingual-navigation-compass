import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LocationData } from '../types/compass';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { MapPin, Copy, Share2, Compass } from 'lucide-react-native';

interface LocationCardProps {
  location: LocationData | null;
  hasPermission: boolean;
  onRequestPermission: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
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
    const text = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!location) return;
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
              style={[styles.actionBtn, { backgroundColor: colors.accentLight }]}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Copy size={14} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>
                {copied ? '✓' : t('copy_coordinates')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconActionBtn, { backgroundColor: colors.accentLight }]}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={14} color={colors.accent} />
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
          <View style={styles.gridItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('latitude')}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {formatCoord(location.latitude, 'N', 'S')}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('longitude')}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {formatCoord(location.longitude, 'E', 'W')}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('altitude')}</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>
              {location.altitude != null ? `${location.altitude} m` : '—'}
            </Text>
          </View>

          <View style={styles.gridItem}>
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

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
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
    fontWeight: '700',
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
    borderRadius: 8,
    marginRight: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  requestBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
});
