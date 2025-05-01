import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings';
import createStyles from '../styles.js';
import { navigate, speak, sound } from '../functions.js';

export default function PreferencesScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage, changeLanguage, isSound } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Preferences. Press top left to edit visual settings. Press top right to edit audio settings. Press bottom to toggle your selected language. Press bottom banner to return home. Press top right banner to repeat this message.";
  const shortMessage = "Preferences";
  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Home")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Visual Settings")}>
          <Text style={styles.buttonText}>Visual Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Audio Settings")}>
          <Text style={styles.buttonText}>Audio Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButtonBig} onPress={() => {sound(require("../assets/toggle.wav"), isSound); if (selectedLanguage === "Spanish") {changeLanguage("French"); speak("French");} else {changeLanguage("Spanish"); speak("Spanish");}}}>
          <Text style={styles.buttonText}>Language{'\n'}</Text>
          <Text style={styles.buttonText}>{selectedLanguage}</Text>
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}