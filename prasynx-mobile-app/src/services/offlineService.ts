import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

export function addNetworkListener(callback: (isConnected: boolean) => void) {
  return NetInfo.addEventListener((state) => {
    callback(state.isConnected ?? false);
  });
}

const OFFLINE_PREFIX = 'offline_';

export async function saveOffline(key: string, data: any): Promise<void> {
  await AsyncStorage.setItem(`${OFFLINE_PREFIX}${key}`, JSON.stringify({
    data,
    timestamp: Date.now(),
  }));
}

export async function getOffline<T>(key: string): Promise<{ data: T; timestamp: number } | null> {
  try {
    const str = await AsyncStorage.getItem(`${OFFLINE_PREFIX}${key}`);
    if (str) return JSON.parse(str);
  } catch {}
  return null;
}

export async function clearOffline(key?: string): Promise<void> {
  if (key) {
    await AsyncStorage.removeItem(`${OFFLINE_PREFIX}${key}`);
  } else {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter((k) => k.startsWith(OFFLINE_PREFIX));
    await AsyncStorage.multiRemove(offlineKeys);
  }
}

export async function getQueuedActions(): Promise<any[]> {
  try {
    const str = await AsyncStorage.getItem('offline_actions');
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
}

export async function queueAction(action: any): Promise<void> {
  const actions = await getQueuedActions();
  actions.push({ ...action, queuedAt: Date.now() });
  await AsyncStorage.setItem('offline_actions', JSON.stringify(actions));
}

export async function clearProcessedActions(): Promise<void> {
  await AsyncStorage.removeItem('offline_actions');
}
