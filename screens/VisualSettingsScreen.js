import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

export default function VisualSettingsScreen({ navigation }) {
  const { fontSize, isGreyscale, toggleFontSize, toggleGreyscale } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Visual Settings. Press bottom banner to return home. Press top right banner to repeat this message.";
  speak(message);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Visual Settings</Text>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Preferences")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton4} onPress={toggleFontSize}>
          <Text style={styles.buttonText}>Interface Font Size{'\n'}</Text>
          <Text style={styles.buttonText}>{fontSize}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={toggleGreyscale}>
          <Text style={styles.buttonText}>Greyscale Mode{'\n'}</Text>
          <Text style={styles.buttonText}>{isGreyscale ? "On" : "Off"}</Text>
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Home")}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
