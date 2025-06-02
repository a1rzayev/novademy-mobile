import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { store } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4CAF50', backgroundColor: '#E8F5E9' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: '600' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#F44336', backgroundColor: '#FFEBEE' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: '600' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FFA000', backgroundColor: '#FFF3E0' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: '600', color: '#E65100' }}
      text2Style={{ fontSize: 14, color: '#E65100' }}
    />
  ),
};

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
            <Toast config={toastConfig} />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}
