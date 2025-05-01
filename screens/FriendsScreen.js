import React, { useEffect, useContext, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import { FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from '../backend/config/firebaseConfig';
import { collection, getDoc, doc, updateDoc } from 'firebase/firestore';

export default function FriendsScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  const styles = createStyles(fontSize, isGreyscale);

  const shortMessage = "Friends";
  const message =
    'Now viewing: Friends. Your connections are listed below. Tap back to return to Community. Press top right to repeat this message.';

  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (isAutoRead === "Long") {
      speak(message);
    } else if (isAutoRead === "Short") {
      speak(shortMessage);
    }
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.friends && Array.isArray(userData.friends)) {
            setFriends(userData.friends);
          }
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        speak('Error loading friends');
      }
    };

    fetchFriends();
  }, []);

  const handleRemoveFriend = async (friendId) => {
    try {
      const updatedFriends = friends.filter(f => f.id !== friendId);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        friends: updatedFriends
      });
      setFriends(updatedFriends);
      speak('Friend removed');
    } catch (err) {
      console.error('Error removing friend:', err);
      speak('Error removing friend');
    }
  };

  const renderFriend = ({ item }) => (
    <View style={profileStyles.section}>
      <View style={profileStyles.card}>
        <View style={profileStyles.friendInfo}>
          <Text style={[styles.titleText, { fontSize: 20 }]}>{item.name}</Text>
          <Text style={profileStyles.username}>@{item.username}</Text>
          <Text style={profileStyles.languages}>
            Learning: {item.languagesLearned?.join(', ') || 'No languages added'}
          </Text>
        </View>
        <TouchableOpacity
          style={[profileStyles.actionButton, { backgroundColor: '#ffe6e6' }]} 
          onPress={() => handleRemoveFriend(item.id)}
        >
          <Text style={{ color: '#FF3B30', fontWeight: '600' }}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        data={friends}
        keyExtractor={f => f.id || f.uid}
        renderItem={renderFriend}
        contentContainerStyle={profileStyles.listContainer}
        showsVerticalScrollIndicator={false}
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

const profileStyles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  languages: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#e6f0ff',
    padding: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  listContainer: {
    paddingVertical: 12,
  }
});
