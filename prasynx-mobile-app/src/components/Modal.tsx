import React from 'react';
import { Modal as RNModal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing } from '../theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: height * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.xl, fontWeight: '600' },
  closeBtn: { fontSize: fontSize.md, fontWeight: '500' },
  content: {},
});
