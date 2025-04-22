import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../backend/config/firebaseConfig';
import createStyles from '../styles.js';
import { recordStart, recordStop, getTranscription } from '../voice';
import { navigate, speak } from '../functions.js';

// LoginScreen component
export default function LoginScreen({ navigation }) {
  // Apply default styles
  createStyles("Large", false);

  // Message spoken aloud on screen load
  const message = "Now viewing: Login. Press mid-upper left to enter email. Press mid-upper right to speak email. Press mid-lower left to enter password. Press mid-lower right to speak password. Press bottom left to login or sign up. Press bottom right to switch between login and sign up. Press top right banner to repeat this message.";
  useEffect(() => { speak(message); }, []);

  // State variables for login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRecordingEmail, setIsRecordingEmail] = useState(false);
  const [isRecordingPassword, setIsRecordingPassword] = useState(false);

  // Validate password format
  const validatePassword = (password) => password.length >= 6 && /\d/.test(password);

  // Handle login with Firebase Auth
  const handleLogin = () => {
    if (!validatePassword(password)) {
      setError('Invalid password.');
      speak('Password must be at least 6 characters long and contain a number.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigation.replace('Home'))
      .catch((error) => {
        if (error.message.includes('invalid-credential')) {
          setError('Invalid email or password.');
          speak('Invalid email or password. Please try again.');
        } else {
          setError(error.message);
          speak(error.message);
        }
      });
  };

  // Convert recorded email input to text
  const handleEmailSpeech = async () => {
    if (isRecordingEmail) {
      const uri = await recordStop();
      if (uri) {
        let text = (await getTranscription(uri)).trim();
        text = text.replace(/at/g, '@').replace(/dot/g, '.').replace(/\s+/g, '');
        setEmail(text);
      }
      setIsRecordingEmail(false);
    } else {
      const started = await recordStart();
      if (started) setIsRecordingEmail(true);
    }
  };

  // Convert recorded password input to text
  const handlePasswordSpeech = async () => {
    if (isRecordingPassword) {
      const uri = await recordStop();
      if (uri) {
        let text = (await getTranscription(uri)).trim();
        text = text.replace(/capital\s([a-z])/gi, (match, p1) => p1.toUpperCase()).replace(/\s+/g, '');
        setPassword(text);
      }
      setIsRecordingPassword(false);
    } else {
      const started = await recordStart();
      if (started) setIsRecordingPassword(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Login</Text>
        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>
      </View>

      {/* Email Input and Voice Button */}
      <TextInput
        style={[loginStyles.input, loginStyles.emailInput]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={[loginStyles.button, loginStyles.speakEmailButton]} onPress={handleEmailSpeech}>
        <Text style={loginStyles.buttonText}>{isRecordingEmail ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {/* Password Input and Voice Button */}
      <TextInput
        style={[loginStyles.input, loginStyles.passwordInput]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={[loginStyles.button, loginStyles.speakPasswordButton]} onPress={handlePasswordSpeech}>
        <Text style={loginStyles.buttonText}>{isRecordingPassword ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error ? <Text style={loginStyles.error}>{error}</Text> : null}

      {/* Login and Switch to Signup Buttons */}
      <TouchableOpacity style={[loginStyles.button, loginStyles.loginButton]} onPress={handleLogin}>
        <Text style={loginStyles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[loginStyles.button, loginStyles.switchButton]}
        onPress={() => navigation.navigate('SignupScreen')}
      >
        <Text style={loginStyles.buttonText}>Switch to Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Login screen styling definitions
const loginStyles = StyleSheet.create({
  input: {
    height: '25%',
    width: '45%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  emailInput: {
    position: 'absolute',
    top: '15%',
    left: 10,
  },
  speakEmailButton: {
    position: 'absolute',
    top: '15%',
    right: 10,
  },
  passwordInput: {
    position: 'absolute',
    bottom: '31.5%',
    left: 10,
  },
  speakPasswordButton: {
    position: 'absolute',
    bottom: '31.5%',
    right: 10,
  },
  button: {
    backgroundColor: 'red',
    height: '25%',
    width: '45%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  error: {
    color: 'red',
    bottom: '28.5%',
    width: '100%',
    left: 10,
  },
  loginButton: {
    position: 'absolute',
    bottom: '3%',
    left: 10,
  },
  switchButton: {
    position: 'absolute',
    bottom: '3%',
    right: 10,
  },
});