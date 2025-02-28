import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import styles from '../styles.js';
import { navigate, speak } from '../functions.js';
import * as TTS from "expo-speech"; // TTS needs to be manually imported here so that TTS.stop() can be used
import { recordStart, recordStop, getTranscription } from "../voice.js";

export default function NavigateScreen({ navigation }) {
  const message = "Now viewing: Navigate. Press bottom button to start and stop voice recording. Press bottom banner to return home. Press top right banner to repeat this message.";
  useEffect(() => { speak(message); }, []); // useEffect ensures it doesn't play each time the buttons are re-rendered

  const [recording, setRecording] = useState(false); // Recording state hook

  const navigateRecord = async () => { // Recording handler
    TTS.stop();
    if (await recordStart()) {
      setRecording(true);
      console.log("Recording started!");
    } else {
      console.error("navigateRecord error: Recording did not start.");
    }
  };

  const navigateTranscribe = async () => { // Transcription handler
    setRecording(false);
    const uri = await recordStop();
    if (!uri) {
      console.error("navigateTranscribe error: Recording URI not located.");
      return false;
    }

    const transcriptText = await getTranscription(uri);
    searchTranscript(transcriptText);
    console.log(transcriptText);
  };

  const handleNavigation = async () => { // If the user tries to leave the page during recording it will first stop the recording
    if (recording) {
      await recordStop();
      setRecording(false);
    }
    navigate(navigation, "Home");
  };

  const keywords = { // Navigation keywords
    "home": "Home",
    "learn": "Learn",
    "practice": "Practice",
    "community": "Community",
    "preferences": "Preferences",
    "navigate": "Navigate",
    "text": "TextMaterials",
    "audio": "AudioMaterials",
    "notes": "Notes"
  };

  const searchTranscript = (transcriptText) => {
    for (const [key, screen] of Object.entries(keywords)) {
      if (transcriptText.includes(key)) {
        navigate(navigation, screen);
        return true;
      }
    }

    if (transcriptText.includes("<Empty>")) {
      speak("No speech was detected. Please try again.");
      return false;
    } else {
      speak("Your request could not be understood. Please clearly state the name of the screen you would like to navigate to.");
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Navigate</Text>

        {recording ? ( // If the user presses the TTS button during recording it will act as if they stopped the recording
          <TouchableOpacity style={styles.topRightBannerButton} onPress={navigateTranscribe}>
            <Image source={require('../assets/volume.png')} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
            <Image source={require('../assets/volume.png')} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={handleNavigation}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGrid}>
        {/* Empty space. */}
        <View style={{ width: '98%', height: '49.5%' }} />
        
        {/* Microphone image. */}
        <Image source={require('../assets/mic.png')} style={{ position: 'absolute', top: '0%', left: '25%', width: '50%', height: '50%' }} />

        {/* Recording Button */}
          {recording ? (
            <TouchableOpacity style={[styles.gridButton2, { backgroundColor: 'blue' }]} onPress={navigateTranscribe}>
              <Text style={styles.buttonText}>Stop Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.gridButton2, { backgroundColor: 'red' }]} onPress={navigateRecord}>
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          )}
      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={handleNavigation}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
