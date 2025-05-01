import React, { useEffect, useContext, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import { FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from '../backend/config/firebaseConfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';

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
    <View style={profileStyles.card}>
      <View style={profileStyles.friendInfo}>
        <Text style={[styles.titleText, profileStyles.name]}>{item.name}</Text>
        <Text style={profileStyles.username}>@{item.username}</Text>
        <Text style={profileStyles.languages}>
          Learning: {item.languagesLearned?.join(', ') || 'No languages added'}
        </Text>
      </View>
      <TouchableOpacity
        style={[profileStyles.actionButton, { backgroundColor: '#ffe6e6' }]}
        onPress={() => handleRemoveFriend(item.id)}
      >
        <Text style={profileStyles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={profileStyles.safeArea}>
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Community")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={profileStyles.scrollView}
          contentContainerStyle={profileStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={profileStyles.section}>
            {friends.length > 0 ? (
              friends.map((friend) => renderFriend({ item: friend }))
            ) : (
              <Text style={profileStyles.emptyText}>No friends yet.</Text>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.bottomButton, profileStyles.bottomButton]}
          onPress={() => navigate(navigation, 'Home')}
        >
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const profileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: '5%',
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: '3%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
  },
  friendInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: Platform.select({ web: 20, default: 16 }),
    marginBottom: 2,
  },
  username: {
    fontSize: Platform.select({ web: 16, default: 14 }),
    color: '#666',
    marginBottom: 4,
  },
  languages: {
    fontSize: Platform.select({ web: 14, default: 12 }),
    color: '#444',
  },
  actionButton: {
    backgroundColor: '#ffe6e6',
    padding: Platform.select({ web: 10, default: 8 }),
    borderRadius: 8,
  },
  removeText: {
    color: '#FF3B30',
    fontSize: Platform.select({ web: 16, default: 14 }),
    fontWeight: '600',
  },
  emptyText: {
    color: '#555',
    marginTop: 8,
    fontSize: Platform.select({ web: 16, default: 14 }),
  },
  bottomButton: {
    marginBottom: Platform.select({ ios: 20, android: 16, default: 20 }),
    alignSelf: 'center',
  }
});