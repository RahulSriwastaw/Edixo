import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AppProvider, useAppContext } from './src/context/AppContext';
import RootTabs from './src/navigation/RootTabs';
import TestRunnerScreen from './src/screens/TestRunnerScreen';
import TestListScreen from './src/screens/TestListScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import CourseDetailScreen from './src/screens/courses/CourseDetailScreen';
import ContentScreen from './src/screens/ContentScreen';

const Stack = createNativeStackNavigator();

function AppShell() {
  const { theme, session, isLoading } = useAppContext();
  const themed = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#FF5A1F',
      background: '#F9FAFB',
      card: '#FFFFFF',
      text: '#111827',
      border: '#E5E7EB',
      notification: '#F97316',
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={themed}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Root" component={RootTabs} />
            <Stack.Screen name="TestList" component={TestListScreen} />
            <Stack.Screen name="TestRunner" component={TestRunnerScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="Content" component={ContentScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
