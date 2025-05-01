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

const dummyFriends = [
  { id: '1', name: 'Gojo', languages: ['Spanish'] },
  { id: '2', name: 'Muffin Man',    languages: ['French','German'] },
  { id: '3', name: 'Meow',  languages: ['Meow'] },
];

export default function FriendsScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  const styles = createStyles(fontSize, isGreyscale);

  const shortMessage = "Friends"
  const message =
    'Now viewing: Friends. Your connections are listed below. Tap back to return to Community. Press top right to repeat this message.';
  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
      }}
      onPress={() => {/* you could navigate to a detailed profile if you want */}}
    >
      <FontAwesome5 name="user-circle" size={32} color="#007AFF" style={{ marginRight: 12 }} />
      <View>
        <Text style={[styles.titleText, { marginBottom: 4 }]}>{item.name}</Text>
        <Text style={{ color: '#555' }}>
          {item.languages.length
            ? item.languages.join(', ')
            : 'No languages added'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
            <View style={styles.topBanner}>
              <TouchableOpacity onPress={() => speak(shortMessage)}>
                <Text style={styles.titleText}>Friends</Text>
              </TouchableOpacity>
      
              <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
                <Image source={require('../assets/volume.png')} />
              </TouchableOpacity>
      
              <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Home")}>
                <Image source={require('../assets/back.png')} />
              </TouchableOpacity>
            </View>

      <FlatList
        data={dummyFriends}
        keyExtractor={f => f.id}
        renderItem={renderFriend}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => navigate(navigation, 'Home')}
      >
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
