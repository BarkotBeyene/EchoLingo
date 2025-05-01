import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import { FontAwesome5 } from '@expo/vector-icons';

const dummyNotifications = [
  { id: 'a', text: 'Gojo commented on your note.' },
  { id: 'b', text: 'New language lesson available.' },
  { id: 'c', text: 'Muffin Man sent you a friend request.' },
];

export default function NotificationsScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  const styles = createStyles(fontSize, isGreyscale);

  const shortMessage = "Notifications"
  const message =
    'Now viewing: Notifications. Your recent alerts are listed below. Press back to return to Community. Press top right to repeat this message.';

  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  const renderNotification = ({ item }) => (
    <View
      style={{
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 10,
        elevation: 2,
      }}
    >
      <Text style={[styles.buttonText, { color: '#000' }]}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner */}
            <View style={styles.topBanner}>
              <TouchableOpacity onPress={() => speak(shortMessage)}>
                <Text style={styles.titleText}>Notifications</Text>
              </TouchableOpacity>
      
              <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
                <Image source={require('../assets/volume.png')} />
              </TouchableOpacity>
      
              <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Home")}>
                <Image source={require('../assets/back.png')} />
              </TouchableOpacity>
            </View>

      {/* Notifications List */}
      <FlatList
        data={dummyNotifications}
        keyExtractor={n => n.id}
        renderItem={renderNotification}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

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
