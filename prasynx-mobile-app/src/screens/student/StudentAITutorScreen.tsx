import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  text: "Hello! I'm Prasynx AI Tutor. I can help you with your studies, homework, and exam preparation. Select a subject or ask me anything!",
  sender: 'ai',
  timestamp: new Date(),
};

export function StudentAITutorScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Great question about "${trimmed}"! I'm analyzing this for you. In a full implementation, I would provide a detailed step-by-step explanation with examples, formulas, and practice problems. Feel free to ask for more details!`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    const msg: Message = {
      id: Date.now().toString(),
      text: `I'd like help with ${subject}.`,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Great choice! I'm ready to help you with ${subject}. What specific topic or problem would you like to work on? I can help with concepts, practice questions, or homework problems.`,
        sender: 'ai' as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title="AI Tutor" subtitle="Ask me anything!" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.subjectChips, { paddingHorizontal: spacing.md }]}
      >
        {SUBJECTS.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.subjectChip,
              {
                backgroundColor: selectedSubject === subject ? colors.primary : colors.surfaceVariant,
                borderColor: selectedSubject === subject ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleSubjectSelect(subject)}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedSubject === subject ? '#FFF' : colors.text },
              ]}
            >
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === 'user' ? styles.userRow : styles.aiRow,
            ]}
          >
            {msg.sender === 'ai' && (
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>AI</Text>
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user'
                  ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                  : { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: msg.sender === 'user' ? '#FFF' : colors.text },
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  { color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
                ]}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
            <View style={[styles.messageBubble, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 }]}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.textSecondary, opacity: 0.6 }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.textSecondary, opacity: 0.3 }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
          placeholder="Type your question..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.surfaceVariant }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={[styles.sendIcon, { color: inputText.trim() ? '#FFF' : colors.textSecondary }]}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subjectChips: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  subjectChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1 },
  chipText: { fontSize: fontSize.sm, fontWeight: '500' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: spacing.md, paddingBottom: spacing.lg },
  messageRow: { flexDirection: 'row', marginBottom: spacing.md, maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end' },
  aiRow: { alignSelf: 'flex-start' },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm, marginTop: 4 },
  avatarText: { color: '#FFF', fontSize: fontSize.xs, fontWeight: '700' },
  messageBubble: { padding: spacing.md, borderRadius: borderRadius.lg, maxWidth: '100%' },
  messageText: { fontSize: fontSize.sm, lineHeight: 20 },
  messageTime: { fontSize: fontSize.xs, marginTop: spacing.xs, alignSelf: 'flex-end' },
  typingDots: { flexDirection: 'row', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontSize: fontSize.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendIcon: { fontSize: 18 },
});
