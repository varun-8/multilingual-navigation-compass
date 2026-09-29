import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SupportedLanguage } from '../types/compass';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { getSupportedLanguagesList, t } from '../i18n';
import { Check, Globe, X } from 'lucide-react-native';

interface LanguageBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageBottomSheet: React.FC<LanguageBottomSheetProps> = ({
  visible,
  onClose,
}) => {
  const { language, setLanguage } = useLanguage();
  const { colors } = useTheme();
  const languages = getSupportedLanguagesList();

  const handleSelect = async (code: SupportedLanguage) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {/* Drag Handle Indicator */}
              <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />

              {/* Sheet Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Globe size={20} color={colors.accent} style={styles.icon} />
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    {t('select_language')}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Language Options List */}
              <View style={styles.list}>
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: isSelected ? colors.accentLight : 'transparent',
                          borderColor: isSelected ? colors.accent : colors.cardBorder,
                        },
                      ]}
                      onPress={() => handleSelect(lang.code)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionTextCol}>
                        <Text
                          style={[
                            styles.nativeLabel,
                            { color: isSelected ? colors.accent : colors.textPrimary },
                          ]}
                        >
                          {lang.nativeLabel}
                        </Text>
                        <Text style={[styles.englishLabel, { color: colors.textSecondary }]}>
                          {lang.label}
                        </Text>
                      </View>

                      {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: colors.accent }]}>
                          <Check size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  optionTextCol: {
    flexDirection: 'column',
  },
  nativeLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  englishLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
