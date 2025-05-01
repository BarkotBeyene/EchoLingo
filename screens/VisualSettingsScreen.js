import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak, sound } from '../functions.js';

export default function VisualSettingsScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, toggleFontSize, toggleGreyscale, isSound } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Visual Settings. Press top left to toggle font size. Press top right to toggle greyscale mode. Press bottom banner to return home. Press top right banner to repeat this message.";
  const shortMessage = "Visual Settings";
  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Visual Settings</Text>
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
        <TouchableOpacity style={styles.gridButton4} onPress={() => {sound(require("../assets/toggle.wav"), isSound); toggleFontSize();}}>
          <Text style={styles.buttonText}>Interface Font Size{'\n'}</Text>
          <Text style={styles.buttonText}>{fontSize}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={() => {sound(require("../assets/toggle.wav"), isSound); toggleGreyscale();}}>
          <Text style={styles.buttonText}>Greyscale Mode{'\n'}</Text>
          <Text style={styles.buttonText}>{isGreyscale ? "On" : "Off"}</Text>
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
