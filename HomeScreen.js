import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import styles from './styles.js';
import { navigate, speak } from './functions.js';

export default function HomeScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>EchoLingo</Text>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak("Now viewing: Home. Press top left to visit learn. Press top right to visit practice. Press bottom left to visit community. Press bottom right to visit preferences. Press bottom banner to visit navigate. Press top right banner to repeat this message.")}>
          <Image source={require('./assets/volume.png')} style={styles.icon} />
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
      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, "Learn")}>
        <Text style={styles.buttonText}>Navigate</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
