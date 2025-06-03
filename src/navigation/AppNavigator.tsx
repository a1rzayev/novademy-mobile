import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PackageSelectionScreen from '../screens/main/PackageSelectionScreen';
import LandingScreen from '../screens/main/LandingScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
};

export type MainStackParamList = {
  Landing: undefined;
  Dashboard: undefined;
  Profile: undefined;
  PackageSelection: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="EmailVerification" component={EmailVerificationScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Packages" component={PackageSelectionScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 