import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/src/components/ui';
import { colors } from '@/src/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabs: { name: string; icon: IconName; active: IconName }[] = [
    { name: 'Explore', icon: 'compass-outline', active: 'compass' },
    { name: 'Feed', icon: 'albums-outline', active: 'albums' },
    { name: 'Add', icon: 'add', active: 'add' },
    { name: 'Leagues', icon: 'trophy-outline', active: 'trophy' },
    { name: 'Profile', icon: 'person-outline', active: 'person' },
  ];
  return <Tabs initialRouteName="Explore" screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: colors.muted,
    tabBarHideOnKeyboard: true, tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line, height: 66 + insets.bottom, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 6) },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '500' } }}>{tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.name === 'Add' ? 'Add place' : tab.name,
      tabBarIcon: ({ color, focused }) => tab.name === 'Add' ? <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.blue, justifyContent: 'center', alignItems: 'center', marginTop: -20, borderWidth: 4, borderColor: colors.paper }}><Icon name="add" color={colors.white} size={27} /></View> : <Icon name={focused ? tab.active : tab.icon} color={color} size={22} /> }} />)}</Tabs>;
}
