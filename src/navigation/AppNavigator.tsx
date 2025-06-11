import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../store';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PackageSelectionScreen from '../screens/main/PackageSelectionScreen';
import LandingScreen from '../screens/main/LandingScreen';
import LessonDetailsScreen from '../screens/LessonDetailsScreen';
import PackageDetailsScreen from '../screens/PackageDetailsScreen';
import MyPackagesScreen from '../screens/main/MyPackagesScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PackageDetails: { packageId: string };
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
  MyPackages: undefined;
  Profile: undefined;
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

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
      },
      headerShown: false,
    }}
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
      name="MyPackages"
      component={MyPackagesScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="package-variant-closed" size={size} color={color} />
        ),
        tabBarLabel: 'My Packages',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen
      name="MainTabs"
      component={MainTabNavigator}
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 