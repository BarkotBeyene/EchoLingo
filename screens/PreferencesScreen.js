import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import { Picker } from '@react-native-picker/picker';

export default function PreferencesScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage, changeLanguage } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Preferences. Press top left to edit visual settings. Press top right to edit audio settings. Press bottom banner to return home. Press top right banner to repeat this message.";
  useEffect(() => { if (isAutoRead) {speak(message);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Preferences</Text>

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
      </View>

      {/* Language Selection Section */}
      <Text style={styles.subtitleText}>Select Language:</Text> {/* Label for language selection */}
      <Picker
        selectedValue={selectedLanguage} 
        onValueChange={(itemValue) => changeLanguage(itemValue)} // Update language selection
        style={styles.picker}
      >
        <Picker.Item label="English" value="English" />
        <Picker.Item label="Spanish" value="Spanish" />
        <Picker.Item label="French" value="French" />
        <Picker.Item label="German" value="German" />
        <Picker.Item label="Mandarin" value="Mandarin" />
      </Picker>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Home")}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}