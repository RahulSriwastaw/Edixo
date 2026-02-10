import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useAppContext } from './src/context/AppContext';
import AdminNavigator from './src/navigation/AdminNavigator';

const Stack = createNativeStackNavigator();

import LoginScreen from './src/screens/auth/LoginScreen';

function AppShell() {
  const { theme, session, loading } = useAppContext();
  const themed = theme === 'dark' ? DarkTheme : DefaultTheme;

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer theme={themed}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="AdminRoot" component={AdminNavigator} />
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
