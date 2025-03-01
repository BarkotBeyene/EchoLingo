import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

export default function CommunityScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Community. Press bottom banner to return home. Press top right banner to repeat this message.";
  useEffect(() => { if (isAutoRead) {speak(message);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Community</Text>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Home")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Home")}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

