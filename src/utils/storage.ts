import EncryptedStorage from 'react-native-encrypted-storage';

export const Storage = {
  async set(key: string, value: string): Promise<void> {
    await EncryptedStorage.setItem(key, value);
  },

  async get(key: string): Promise<string | null> {
    return EncryptedStorage.getItem(key);
  },

  async remove(key: string): Promise<void> {
    await EncryptedStorage.removeItem(key);
  },

  async clearAll(): Promise<void> {
    await EncryptedStorage.clear();
  },
};
