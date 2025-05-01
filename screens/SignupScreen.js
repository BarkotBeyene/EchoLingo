import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../backend/config/firebaseConfig';
import createStyles from '../styles.js';
import { recordStart, recordStop, getTranscription } from '../voice';
import { speak } from '../functions.js';

// SignupScreen component
export default function SignupScreen({ navigation }) {
  createStyles("Large", false);
  const message = "Now viewing: Sign Up. Press to enter or speak your first name, last name, username, email, and password. Bottom left to submit. Bottom right to switch to login.";
  useEffect(() => { speak(message); }, []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRecordingFirst, setIsRecordingFirst] = useState(false);
  const [isRecordingLast, setIsRecordingLast] = useState(false);
  const [isRecordingUser, setIsRecordingUser] = useState(false);
  const [isRecordingEmail, setIsRecordingEmail] = useState(false);
  const [isRecordingPassword, setIsRecordingPassword] = useState(false);

  const handleRecording = async (isRecording, setIsRecording, setter, type) => {
    if (isRecording) {
      const uri = await recordStop();
      if (uri) {
        let text = (await getTranscription(uri)).trim();
        if (type === 'email') text = text.replace(/at/g, '@').replace(/dot/g, '.').replace(/\s+/g, '');
        if (type === 'password') text = text.replace(/capital\s([a-z])/gi, (m, p1) => p1.toUpperCase()).replace(/\s+/g, '');
        setter(text);
      }
      setIsRecording(false);
    } else {
      const started = await recordStart();
      if (started) setIsRecording(true);
    }
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !username || !email || !password) {
      setError('All fields are required.');
      speak('Please fill out all fields.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters and contain a number.');
      speak('Invalid password.');
      return;
    }

    try {
      // Check username availability
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const snapshot = await getDocs(usernameQuery);
      if (!snapshot.empty) {
        setError('Username already taken.');
        speak('Username already taken.');
        return;
      }

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        username,
        name: `${firstName} ${lastName}`,
        created_at: new Date().toISOString(),
        // Optional fields with default/empty values
        bio: '',
        role: 'student',
        preferred_language: 'Spanish',
        languagesLearned: ['Spanish'],
        profile_pic: '',
        friends: []
      });

      speak('Sign up successful. You can now log in.');
      alert('Sign up successful! You can now log in.');

      // Reset form
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setError('');

      // Navigate to login
      navigation.navigate('Login');
    } catch (error) {
      console.error('Signup Error:', error);
      setError(error.message);
      speak('Error during sign up. Please try again.');
    }
  };

  const validatePassword = (password) => password.length >= 6 && /\d/.test(password);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Sign Up</Text>
        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>
      </View>

      {/* First Name */}
      <TextInput style={[styles.input, styles.rowLeft]} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TouchableOpacity style={[styles.button, styles.rowRight]} onPress={() => handleRecording(isRecordingFirst, setIsRecordingFirst, setFirstName)}>
        <Text style={styles.buttonText}>{isRecordingFirst ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {/* Last Name */}
      <TextInput style={[styles.input, styles.rowLeft2]} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TouchableOpacity style={[styles.button, styles.rowRight2]} onPress={() => handleRecording(isRecordingLast, setIsRecordingLast, setLastName)}>
        <Text style={styles.buttonText}>{isRecordingLast ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {/* Username */}
      <TextInput style={[styles.input, styles.rowLeft3]} placeholder="Username" value={username} onChangeText={setUsername} />
      <TouchableOpacity style={[styles.button, styles.rowRight3]} onPress={() => handleRecording(isRecordingUser, setIsRecordingUser, setUsername)}>
        <Text style={styles.buttonText}>{isRecordingUser ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {/* Email */}
      <TextInput style={[styles.input, styles.rowLeft4]} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TouchableOpacity style={[styles.button, styles.rowRight4]} onPress={() => handleRecording(isRecordingEmail, setIsRecordingEmail, setEmail, 'email')}>
        <Text style={styles.buttonText}>{isRecordingEmail ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {/* Password */}
      <TextInput style={[styles.input, styles.rowLeft5]} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={[styles.button, styles.rowRight5]} onPress={() => handleRecording(isRecordingPassword, setIsRecordingPassword, setPassword, 'password')}>
        <Text style={styles.buttonText}>{isRecordingPassword ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Submit and Navigation Buttons */}
      <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.switchButton]} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Switch to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: '12%',
    width: '45%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    position: 'absolute',
  },
  button: {
    backgroundColor: 'red',
    height: '12%',
    width: '45%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topBanner: {
    width: '100%',
    height: '10%',
    backgroundColor: '#FFC0CB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightBannerButton: {
    position: 'absolute',
    top: '20%',
    right: 10,
  },
  rowLeft: { top: '13%', left: 10 },
  rowRight: { top: '13%', right: 10 },
  rowLeft2: { top: '26%', left: 10 },
  rowRight2: { top: '26%', right: 10 },
  rowLeft3: { top: '39%', left: 10 },
  rowRight3: { top: '39%', right: 10 },
  rowLeft4: { top: '52%', left: 10 },
  rowRight4: { top: '52%', right: 10 },
  rowLeft5: { top: '65%', left: 10 },
  rowRight5: { top: '65%', right: 10 },
  loginButton: { bottom: '3%', left: 10 },
  switchButton: { bottom: '3%', right: 10 },
  error: {
    color: 'red',
    bottom: '18%',
    width: '100%',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  }
});