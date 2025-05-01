import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak, sound } from '../functions.js';
import * as TTS from "expo-speech"; // TTS needs to be manually imported here so that TTS.stop() can be used

export default function HomeScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, isSound } = useContext(Settings);

  createStyles(fontSize, isGreyscale);

  message = "Now viewing: Home. Press top left to visit learn. Press top right to visit practice. Press bottom left to visit community. Press bottom right to visit preferences. Press bottom banner to visit navigate. Press top right banner to repeat this message.";
  const shortMessage = "Home";
  useEffect(() => { TTS.stop(); if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>EchoLingo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Learn")}>
          <Text style={styles.buttonText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Practice")}>
          <Text style={styles.buttonText}>Practice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Community")}>
          <Text style={styles.buttonText}>Community</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Preferences")}>
          <Text style={styles.buttonText}>Preferences</Text>
        </TouchableOpacity>
      </View>

      {/* Navigate Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Navigate")}>
        <Text style={styles.buttonText}>Navigate</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
