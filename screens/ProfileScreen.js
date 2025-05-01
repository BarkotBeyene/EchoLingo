import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

export default function ProfileScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  const styles = createStyles(fontSize, isGreyscale);


  const [isEditingMode, setIsEditingMode] = useState(true);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [languagesLearned, setLanguagesLearned] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);

  const shortMessage = "Profile"
  useEffect(() => {
    const message = isEditingMode
      ? 'Now editing profile. Fill in your name, bio, languages, search learners, and save.'
      : 'Profile saved. Viewing your profile details.';
    if (isAutoRead) speak(message);
  }, [isEditingMode]);

  const handleAddLanguage = () => {
    const lang = languageInput.trim();
    if (lang && !languagesLearned.includes(lang)) {
      setLanguagesLearned([...languagesLearned, lang]);
      setLanguageInput('');
    }
  };

  const handleSaveProfile = () => {
    speak('Profile saved.');
    //TODO: save to backend
    setIsEditingMode(false);
  };

  const handleSearch = () => {
    const dummyUsers = [
      { id: '1', name: 'Alice Johnson' },
      { id: '2', name: 'Bob Smith' },
      { id: '3', name: 'Charlie Lee' },
    ];
    const results = dummyUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !friends.some((f) => f.id === u.id)
    );
    setSearchResults(results);
    if (results.length === 0) speak('No users found.');
  };

  const handleAddFriend = (user) => {
    setFriends([...friends, user]);
    setSearchResults(searchResults.filter((u) => u.id !== user.id));
    speak(`Friend request sent to ${user.name}.`);
  };

  const handleRemoveFriend = (id) => {
    setFriends(friends.filter((f) => f.id !== id));
    speak('Friend removed.');
  };

 
  if (!isEditingMode) {
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
        
                <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => setIsEditingMode(true)}>
                  <Image source={require('../assets/gear.png')} />
                </TouchableOpacity>
              </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={profileStyles.section}>
            <Text style={styles.titleText}>Name</Text>
            <Text style={[styles.buttonText, { color: '#000' }]}>{name}</Text>
          </View>

          <View style={profileStyles.section}>
            <Text style={styles.titleText}>Bio</Text>
            <Text style={[styles.buttonText, { color: '#000' }]}>{bio}</Text>
          </View>

          <View style={profileStyles.section}>
            <Text style={styles.titleText}>Languages</Text>
            {languagesLearned.length > 0 ? (
              languagesLearned.map((lang, idx) => (
                <Text key={idx} style={[styles.buttonText, { color: '#000' }]}>
                  {lang}
                </Text>
              ))
            ) : (
              <Text style={[styles.buttonText, { color: '#000' }]}>None added</Text>
            )}
          </View>

          <View style={profileStyles.section}>
            <Text style={styles.titleText}>Friends</Text>
            <Text style={[styles.buttonText, { color: '#000' }]}>
              {friends.length}
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigate(navigation, 'Community')}
        >
          <Text style={styles.buttonText}>Return to Community</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity
          style={styles.topLeftBannerButton}
          onPress={() => navigate(navigation, 'Community')}
        >
          <Image source={require('../assets/back.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Profile</Text>
        <TouchableOpacity
          style={styles.topRightBannerButton}
          onPress={() => speak('Profile screen')}
        >
          <Image source={require('../assets/volume.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
        <View style={profileStyles.section}>
          <Text style={styles.titleText}>Your Profile</Text>
          <TextInput
            style={profileStyles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[profileStyles.input, { height: 80 }]}
            placeholder="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
          />
          <View style={profileStyles.languageRow}>
            <TextInput
              style={[profileStyles.input, { flex: 1 }]}
              placeholder="Add Language"
              value={languageInput}
              onChangeText={setLanguageInput}
            />
            <TouchableOpacity
              style={profileStyles.addButtonSmall}
              onPress={handleAddLanguage}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
          </View>
          {languagesLearned.length > 0 && (
            <View style={profileStyles.tagsContainer}>
              {languagesLearned.map((lang, idx) => (
                <View key={idx} style={profileStyles.tag}>
                  <Text style={{ color: '#fff' }}>{lang}</Text>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={profileStyles.saveButton}
            onPress={handleSaveProfile}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={profileStyles.section}>
          <Text style={styles.titleText}>Search Learners</Text>
          <View style={profileStyles.languageRow}>
            <TextInput
              style={[profileStyles.input, { flex: 1 }]}
              placeholder="Search by name"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={profileStyles.addButtonSmall}
              onPress={handleSearch}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Search</Text>
            </TouchableOpacity>
          </View>
          {searchResults.map((user) => (
            <View key={user.id} style={profileStyles.card}>
              <Text style={styles.titleText}>{user.name}</Text>
              <TouchableOpacity
                style={profileStyles.actionButton}
                onPress={() => handleAddFriend(user)}
              >
                <Text style={{ color: '#007AFF', fontWeight: '600' }}>Add Friend</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={profileStyles.section}>
          <Text style={styles.titleText}>Your Friends</Text>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <View key={friend.id} style={profileStyles.card}>
                <Text style={styles.titleText}>{friend.name}</Text>
                <TouchableOpacity
                  style={[profileStyles.actionButton, { backgroundColor: '#ffe6e6' }]} 
                  onPress={() => handleRemoveFriend(friend.id)}
                >
                  <Text style={{ color: '#FF3B30', fontWeight: '600' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={{ color: '#555', marginTop: 8 }}>No friends yet.</Text>
          )}
        </View>
      </ScrollView>

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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonSmall: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButton: {
    backgroundColor: '#e6f0ff',
    padding: 8,
    borderRadius: 8,
  },
});
