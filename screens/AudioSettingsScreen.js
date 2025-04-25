import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

export default function AudioSettingsScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, toggleAutoRead, isSound, toggleSound } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Audio Settings. Press top left to toggle automatic audio guide. Press bottom banner to return home. Press top right banner to repeat this message.";
  const shortMessage = "Audio Settings";
  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Audio Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Preferences")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton4} onPress={toggleAutoRead}>
          <Text style={styles.buttonText}>Automatic Audio Guide{'\n'}</Text>
          <Text style={styles.buttonText}>{isAutoRead}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={toggleSound}>
          <Text style={styles.buttonText}>Sound Effects{'\n'}</Text>
          <Text style={styles.buttonText}>{isSound ? "On" : "Off"}</Text>
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Home")}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
