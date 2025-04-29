import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../backend/config/firebaseConfig';
import createStyles from '../styles.js';
import { recordStart, recordStop, getTranscription } from '../voice';
import { navigate, speak } from '../functions.js';

// LoginScreen component
export default function LoginScreen({ navigation }) {
  createStyles("Large", false); // Create styles with default font size and greyscale
  
  message = "Now viewing: Login. Press mid-upper left to enter email. Press mid-upper right to speak email. Press mid-lower left to enter password. Press mid-lower right to speak password. Press bottom left to login or sign up. Press bottom right to switch between login and sign up. Press top right banner to repeat this message.";
  useEffect(() => {speak(message);}, []);
  
  // State variables for email, password, error message, sign-up mode, and recording state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecordingEmail, setIsRecordingEmail] = useState(false);
  const [isRecordingPassword, setIsRecordingPassword] = useState(false);

  // Function to handle login
  const handleLogin = () => {
    if (!validatePassword(password)) {
      setError('Invalid password.');
      speak('Password must be at least 6 characters long and contain a number.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigation.replace('Home');
      })
      .catch((error) => {
        if (error.message.includes('invalid-credential')) {
          setError('Invalid email or password.');
          speak('Invalid email or password. Please try again.');
        }
        else {
          setError(error.message);
          speak(error.message);
        }
      });
  };

  // Function to handle sign-up
  const handleSignUp = () => {
    if (!validatePassword(password)) {
      setError('Invalid password.');
      speak('Password must be at least 6 characters long and contain a number.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigation.replace('Home');
      })
      .catch((error) => {
        if (error.message.includes('invalid-email')) {
          setError('Invalid email address.');
          speak('Invalid email address. Please try again.');
        } 
        else if (error.message.includes('email-already-in-use')) {
          setError('Email already in use.');
          speak('Email already in use. Please try again.');
        }
        else {
          setError(error.message);
          speak(error.message);
        }
      });
  };

  // Function to validate password
  const validatePassword = (password) => {
    return password.length >= 6 && /\d/.test(password);
  };

  // Function to handle email speech recognition
  const handleEmailSpeech = async () => {
    if (isRecordingEmail) {
      const uri = await recordStop();
      if (uri) {
        let recognizedEmail = (await getTranscription(uri)).trim();
        // replate "at" with '@', "dot" with '.', and delete spaces between characters
        recognizedEmail = recognizedEmail.replace(/at/g, '@').replace(/dot/g, '.').replace(/\s+/g, '');
        setEmail(recognizedEmail);
      }
      setIsRecordingEmail(false);
    } else {
      const recordingStarted = await recordStart();
      if (recordingStarted) {
        setIsRecordingEmail(true);
      }
    }
  };

  // Function to handle password speech recognition
  const handlePasswordSpeech = async () => {
    if (isRecordingPassword) {
      const uri = await recordStop();
      if (uri) {
        let recognizedPassword = (await getTranscription(uri)).trim();
        // replace "capital (letter)" with the uppercase version said letter, and delete spaces between characters
        recognizedPassword = recognizedPassword.replace(/capital\s([a-z])/gi, (match, p1) => p1.toUpperCase()).replace(/\s+/g, '');
        setPassword(recognizedPassword);
      }
      setIsRecordingPassword(false);
    } else {
      const recordingStarted = await recordStart();
      if (recordingStarted) {
        setIsRecordingPassword(true);
      }
    }
  };

  // Display everything on the screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Login</Text>
        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>
      </View>
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
      {error ? <Text style={loginStyles.error}>{error}</Text> : null}
      <TouchableOpacity style={[loginStyles.button, loginStyles.loginButton]} onPress={isSignUp ? handleSignUp : handleLogin}>
        <Text style={loginStyles.buttonText}>{isSignUp ? "Sign Up" : "Login"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[loginStyles.button, loginStyles.switchButton]}
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={loginStyles.buttonText}>{isSignUp ? "Switch to Login" : "Switch to Sign Up"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles for the component
const loginStyles = StyleSheet.create({
  input: { // style for input fields
    height: '25%',
    width: '45%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  emailInput: {
    position: 'absolute',
    bottom: '60%',
    left: 10,
  },
  speakEmailButton: {
    position: 'absolute',
    bottom: '60%',
    right: 10,
  },  
  passwordInput: { // style for password input
    position: 'absolute',
    bottom: '31.5%',
    left: 10,
  },
  speakPasswordButton: { // style for speak password button
    position: 'absolute',
    bottom: '31.5%',
    right: 10,
  },
  button: { // style for speach and login/sign up buttons
    backgroundColor: 'red',
    height: '25%',
    width: '45%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { // style for button text
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  error: { // error messages
    color: 'red',
    bottom: '28.5%',
    width: '100%',
    left: 10,
  },
  loginButton: { // style for login button
    position: 'absolute',
    bottom: '3%',
    left: 10,
  },
  switchButton: { // style for switch button
    position: 'absolute',
    bottom: '3%',
    right: 10,
  },
});
