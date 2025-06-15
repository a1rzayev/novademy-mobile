import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, useTheme, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { setLanguage, Language } from '../../store/slices/languageSlice';
import { logout } from '../../store/slices/authSlice';
import { getTranslation } from '../../translations';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigation = useNavigation();
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);

  const handleLanguageChange = (language: Language) => {
    dispatch(setLanguage(language));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert(
        getTranslation('common.error', currentLanguage),
        getTranslation('common.error', currentLanguage)
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>{getTranslation('settings.language', currentLanguage)}</List.Subheader>
        <List.Item
          title="English"
          onPress={() => handleLanguageChange('en')}
          right={() => currentLanguage === 'en' && <List.Icon icon="check" />}
        />
        <List.Item
          title="Русский"
          onPress={() => handleLanguageChange('ru')}
          right={() => currentLanguage === 'ru' && <List.Icon icon="check" />}
        />
        <List.Item
          title="Azərbaycan"
          onPress={() => handleLanguageChange('az')}
          right={() => currentLanguage === 'az' && <List.Icon icon="check" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>{getTranslation('settings.notifications', currentLanguage)}</List.Subheader>
        <List.Item
          title={getTranslation('settings.notifications', currentLanguage)}
          right={() => <Switch value={true} onValueChange={() => {}} />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>{getTranslation('settings.about', currentLanguage)}</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
        />
      </List.Section>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          {getTranslation('settings.logout', currentLanguage)}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutContainer: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
});

export default SettingsScreen; 