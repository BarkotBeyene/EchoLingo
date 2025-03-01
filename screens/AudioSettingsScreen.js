import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

export default function AudioSettingsScreen({ navigation }) {
  const { fontSize, isGreyscale } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Audio Settings. Press bottom banner to return home. Press top right banner to repeat this message.";
  speak(message);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Audio Settings</Text>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Preferences")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton4} onPress={() => speak("Placeholder.")}>
          <Text style={styles.buttonText}>Automatic Audio Guide{'\n'}</Text>
          <Text style={styles.buttonText}>On</Text>
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Home")}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
