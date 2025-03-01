import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsProvider } from './settings.js';

// IMPORT ALL SCREENS HERE
import LaunchScreen from './screens/LaunchScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import PracticeScreen from './screens/PracticeScreen';
import CommunityScreen from './screens/CommunityScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import VisualSettingsScreen from './screens/VisualSettingsScreen';
import AudioSettingsScreen from './screens/AudioSettingsScreen';
import NavigateScreen from './screens/NavigateScreen';

const Stack = createStackNavigator();

export default function App() {
  return ( 
    // headerShown: false removes react native default header
    // gestureEnabled: false removes the swipe to go back feature
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="Launch" component={LaunchScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Learn" component={LearnScreen} />
          <Stack.Screen name="Practice" component={PracticeScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="Preferences" component={PreferencesScreen} />
          <Stack.Screen name="Visual Settings" component={VisualSettingsScreen} />
          <Stack.Screen name="Audio Settings" component={AudioSettingsScreen} />
          <Stack.Screen name="Navigate" component={NavigateScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
