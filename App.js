import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsProvider } from './settings.js';

import LaunchScreen from './screens/LaunchScreen';
import LoginScreen from './screens/LoginScreen.js';
import SignupScreen from './screens/SignupScreen';
import AIChatScreen from './screens/AIChatScreen';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import PracticeScreen from './screens/PracticeScreen';
import QuizScreen from './screens/QuizScreen';
import ExamScreen from './screens/ExamScreen'
import CommunityScreen from './screens/CommunityScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import VisualSettingsScreen from './screens/VisualSettingsScreen';
import AudioSettingsScreen from './screens/AudioSettingsScreen';
import NavigateScreen from './screens/NavigateScreen';
import TextMaterialsScreen from './screens/TextMaterialsScreen';
import VideoMaterialsScreen from './screens/VideoMaterialsScreen';
import GrammarScreen from './screens/GrammarScreen';
import VocabPronunciationScreen from './screens/VocabPronunciationScreen';
const Stack = createStackNavigator();

export default function App() {
  return ( 
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="Launch" component={LaunchScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Learn" component={LearnScreen} />
          <Stack.Screen name="Practice" component={PracticeScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Exam" component={ExamScreen} />
          <Stack.Screen name="Text Materials" component={TextMaterialsScreen} />
          <Stack.Screen name="AI Chat" component={AIChatScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="Preferences" component={PreferencesScreen} />
          <Stack.Screen name="Visual Settings" component={VisualSettingsScreen} />
          <Stack.Screen name="Audio Settings" component={AudioSettingsScreen} />
          <Stack.Screen name="Navigate" component={NavigateScreen} />
          <Stack.Screen name="VideoMaterials" component={VideoMaterialsScreen} />
          <Stack.Screen name="Grammar" component={GrammarScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VocabPronunciation" component={VocabPronunciationScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}


