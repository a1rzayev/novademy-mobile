import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../store';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { getTranslation } from '../translations';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import PackageSelectionScreen from '../screens/main/PackageSelectionScreen';
import LandingScreen from '../screens/main/LandingScreen';
import LessonDetailsScreen from '../screens/LessonDetailsScreen';
import PackageDetailsScreen from '../screens/PackageDetailsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PackageDetails: { packageId: string };
  Payment: { packageId: string; packageName: string; amount: number };
  EditProfile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { userId: string };
};

export type MainStackParamList = {
  MainTabs: undefined;
  LessonDetails: { lessonId: string };
  PackageDetails: { packageId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Packages: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="VerifyEmail" component={EmailVerificationScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => {
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Packages"
        component={PackageSelectionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: getTranslation('common.profile', currentLanguage),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: getTranslation('common.settings', currentLanguage),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <MainStack.Screen
      name="LessonDetails"
      component={LessonDetailsScreen}
      options={{ title: 'Lesson Details' }}
    />
  </MainStack.Navigator>
);

const AppNavigator = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="PackageDetails"
            component={PackageDetailsScreen}
            options={{ 
              headerShown: true,
              title: 'Package Details',
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ 
              headerShown: true,
              title: 'Payment',
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ 
              headerShown: true,
              title: 'Edit Profile',
              presentation: 'modal'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 