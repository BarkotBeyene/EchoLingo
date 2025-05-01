import React, { useEffect, useContext } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import { FontAwesome5 } from '@expo/vector-icons';

export default function CommunityScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  const styles = createStyles(fontSize, isGreyscale);

  const shortMessage = "Community"
  const message =
    'Now viewing: Community. Press Friends to manage connections, Notifications to view alerts, Profile to update or view your profile. Press bottom banner to return home. Press top right to repeat this message.';

  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Community</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Home")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Three-option layout */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity
          style={styles.gridButton4}
          onPress={() => navigate(navigation, 'Friends')}
        >
          <FontAwesome5 name="user-friends" size={24} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.buttonText}>Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridButton4}
          onPress={() => navigate(navigation, 'Notifications')}
        >
          <FontAwesome5 name="bell" size={24} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.buttonText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridButtonBig}
          onPress={() => navigate(navigation, 'Profile')}
        >
          <FontAwesome5 name="user-circle" size={24} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Return Button */}
      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => navigate(navigation, 'Home')}
      >
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
