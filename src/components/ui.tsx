import React, { ComponentProps, PropsWithChildren, useState } from 'react';
import { ActivityIndicator, Image, ImageStyle, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, moods, moodStyle } from '../theme';
import { demoMode } from '../config';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export function Icon({ name, size = 22, color = colors.ink }: { name: IconName; size?: number; color?: string }) { return <Ionicons name={name} size={size} color={color} />; }
export function Screen({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={[ui.screen, style]}>{children}</SafeAreaView>;
}
export function Header({ title = 'MoodMesh', subtitle, action }: { title?: string; subtitle?: string; action?: React.ReactNode }) {
  return <View style={ui.header}><View style={{ flex: 1 }}><Text style={title === 'MoodMesh' ? ui.brand : ui.heading}>{title}</Text>{subtitle && <Text style={ui.subtitle}>{subtitle}</Text>}</View>{action}</View>;
}
export function DemoBanner() { return demoMode ? <View style={ui.demo}><View style={ui.dot} /><Text style={ui.demoText}>Preview mode · sample places · changes reset on reload</Text></View> : null; }
export function IconButton({ icon, label, onPress, active, disabled }: { icon: IconName; label: string; onPress: () => void; active?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, selected: !!active }} onPress={onPress} disabled={disabled} style={({ pressed }) => [ui.iconButton, active && { backgroundColor: '#EAF0FF' }, { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }]}><Icon name={icon} color={active ? colors.blue : colors.ink} /></Pressable>;
}
export function Button({ title, onPress, busy, disabled, secondary, icon }: { title: string; onPress: () => void; busy?: boolean; disabled?: boolean; secondary?: boolean; icon?: IconName }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }} disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [ui.button, secondary && ui.secondary, { opacity: disabled || busy ? 0.5 : pressed ? 0.75 : 1 }]}>{busy ? <ActivityIndicator color={secondary ? colors.blue : colors.white} /> : <>{icon && <Icon name={icon} color={secondary ? colors.blue : colors.white} size={19} />}<Text style={[ui.buttonText, secondary && { color: colors.blue }]}>{title}</Text></>}</Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 8 }}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[ui.input, props.multiline && { minHeight: 100, textAlignVertical: 'top' }, props.style]} /></View>;
}
export function Message({ title, detail, action, onAction, loading }: { title: string; detail?: string; action?: string; onAction?: () => void; loading?: boolean }) {
  return <View style={ui.message} accessibilityLiveRegion="polite">{loading ? <ActivityIndicator color={colors.blue} size="large" /> : <View style={ui.messageIcon}><Icon name="compass-outline" color={colors.blue} size={28} /></View>}<Text style={ui.messageTitle}>{title}</Text>{detail && <Text style={ui.messageDetail}>{detail}</Text>}{action && onAction && <Button title={action} onPress={onAction} secondary />}</View>;
}
export function ErrorNotice({ message, retry }: { message: string | null; retry?: () => void }) {
  return message ? <View style={ui.error} accessibilityRole="alert"><Text style={ui.errorText}>{message}</Text>{retry && <Pressable onPress={retry} accessibilityRole="button" style={{ paddingVertical: 12 }}><Text style={{ color: colors.blue, fontWeight: '700' }}>Try again</Text></Pressable>}</View> : null;
}
export function MoodChip({ name }: { name: string }) { const mood = moodStyle(name); return <View style={[ui.chip, { backgroundColor: mood.background }]}><Text style={{ color: mood.color, fontSize: 11, fontWeight: '600' }}>{name}</Text></View>; }
export function MoodPicker({ selected, onSelect, includeAll = false }: { selected: string[]; onSelect: (name: string) => void; includeAll?: boolean }) {
  const options = includeAll ? [{ name: 'All', icon: 'apps-outline' as const, color: colors.blue, background: '#E6EEFF' }, ...moods] : moods;
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ui.moodList}>{options.map(mood => {
    const active = selected.includes(mood.name);
    return <Pressable key={mood.name} onPress={() => onSelect(mood.name)} accessibilityRole="button" accessibilityLabel={`${mood.name} mood`} accessibilityState={{ selected: active }} style={ui.moodOption}><View style={[ui.moodCircle, { backgroundColor: active && mood.name === 'All' ? colors.blue : mood.background, borderColor: active ? colors.blue : 'transparent' }]}><Icon name={mood.icon} color={active && mood.name === 'All' ? colors.white : mood.color} size={23} /></View><Text style={[ui.moodName, active && { color: colors.blue, fontWeight: '700' }]}>{mood.name}</Text></Pressable>;
  })}</ScrollView>;
}
export function Segments<T extends string>({ options, selected, onSelect }: { options: readonly T[]; selected: T; onSelect: (value: T) => void }) {
  return <View style={ui.segments}>{options.map(option => <Pressable accessibilityRole="tab" accessibilityState={{ selected: option === selected }} key={option} onPress={() => onSelect(option)} style={[ui.segment, selected === option && { backgroundColor: colors.blue }]}><Text style={[ui.segmentText, selected === option && { color: colors.white }]}>{option}</Text></Pressable>)}</View>;
}
export function Photo({ uri, style, label }: { uri?: string; style?: StyleProp<ImageStyle>; label: string }) {
  const [failed, setFailed] = useState(false);
  return uri && !failed ? <Image key={uri} source={{ uri }} accessibilityLabel={label} resizeMode="cover" style={[{ backgroundColor: colors.field }, style]} onError={() => setFailed(true)} /> : <View style={[{ backgroundColor: colors.field, alignItems: 'center', justifyContent: 'center' }, style as StyleProp<ViewStyle>]} accessibilityLabel="Photo unavailable"><Icon name="image-outline" size={30} color={colors.muted} /></View>;
}
export function Avatar({ name, large }: { name: string; large?: boolean }) {
  return <View style={[ui.avatar, large && { width: 84, height: 84, borderRadius: 42 }]}><Text style={{ color: colors.blue, fontSize: large ? 29 : 14, fontWeight: '700' }}>{name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'M'}</Text></View>;
}
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: 22, paddingTop: 15, paddingBottom: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { fontSize: 27, fontWeight: '800', color: colors.blue, letterSpacing: -1.1 },
  heading: { fontSize: 25, fontWeight: '700', color: colors.ink, letterSpacing: -0.7 },
  subtitle: { fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 5 },
  demo: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 20, backgroundColor: '#EEF3FF' },
  demoText: { fontSize: 10, color: '#395686', flex: 1 }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.blue },
  iconButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: colors.blue, borderRadius: 28, minHeight: 50, paddingHorizontal: 22, paddingVertical: 13, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: '#EAF0FF' }, buttonText: { fontSize: 14, fontWeight: '700', color: colors.white },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.white, padding: 14, fontSize: 14, minHeight: 50, color: colors.ink },
  message: { padding: 28, alignItems: 'center', gap: 12 }, messageIcon: { padding: 18, borderRadius: 40, backgroundColor: '#EAF0FF' },
  messageTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, textAlign: 'center' }, messageDetail: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 360 },
  error: { padding: 14, margin: 16, borderRadius: 14, backgroundColor: '#FFF0F2' }, errorText: { color: '#9E2E48', fontSize: 13, lineHeight: 19 },
  chip: { borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 },
  moodList: { paddingHorizontal: 18, gap: 13, paddingVertical: 13 }, moodOption: { minWidth: 54, alignItems: 'center', gap: 7 },
  moodCircle: { width: 49, height: 49, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2 }, moodName: { fontSize: 10, color: colors.ink },
  segments: { flexDirection: 'row', backgroundColor: colors.field, borderRadius: 24, padding: 4, marginHorizontal: 20, marginBottom: 16 },
  segment: { flex: 1, borderRadius: 20, minHeight: 38, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }, segmentText: { fontSize: 12, color: colors.ink, fontWeight: '500' },
  avatar: { width: 37, height: 37, borderRadius: 19, backgroundColor: '#E3EBFD', alignItems: 'center', justifyContent: 'center' },
});
