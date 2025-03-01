import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

export default function LearnScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Learn. Press top left to view text materials. Press top right to view audio materials. Press bottom left to view notes. Press bottom banner to return home. Press top right banner to repeat this message.";
  useEffect(() => { if (isAutoRead) {speak(message);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Learn</Text>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Home")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton4} onPress={() => speak("Placeholder.")}>
          <Text style={styles.buttonText}>Text Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={() => speak("Placeholder.")}>
          <Text style={styles.buttonText}>Audio Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton4} onPress={() => speak("Placeholder.")}>
          <Text style={styles.buttonText}>Notes</Text>
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Home")}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

