import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { CLOUD_API_KEY } from '@env';

const audioOptions = { // Google Cloud Voice-to-Text requires .WAV files.
  ios: {
    extension: ".wav",
  },
  android: {
    extension: ".wav",
  },
};

let recordingPointer = null; // Holds active recording object.

export const recordStart = async () => {
  try {
    if (Platform.OS === 'web') {
      console.warn('Voice recording is not available on web');
      return false;
    }
    await Audio.requestPermissionsAsync(); // Ask for audio permissions. Will simply be ignored if permission is already granted.
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true }); // Additional settings for IOS.

    const {recording} = await Audio.Recording.createAsync(audioOptions); // Create recording object (will use .WAV)
    recordingPointer = recording; // Store recording object in recordingPointer so that if multiple recordings are somehow started only the most recent one is referred to.

    return true; // Recording success

  } catch (error) {

    console.error("recordStart error: ", error);

    return false; // Recording failure
  }
};

export const recordStop = async () => {
  if (!recordingPointer) return false; // If no recording is active abort the function.

  await recordingPointer.stopAndUnloadAsync(); // Stop recording and release resources
  const uri = recordingPointer.getURI(); // Store recordings location in device cache as uri
  recordingPointer = null; // Empty recordingPointer

  await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: false }); // Reset sound settings

  const { sound } = await Audio.Sound.createAsync(require("./assets/blip.wav")); // Dummy sound to reet audio output
  await sound.playAsync(); // Play dummy sound

  return uri; // Return location of recording
};

export const getTranscription = async (uri, language = "english") => {
  try {
    if (Platform.OS === 'web') {
      console.warn('Voice transcription is not available on web');
      return '';
    }
    const supportedLanguages = {
      english: "en-US",  // English
      spanish: "es-ES",  // Spanish
      french: "fr-FR",  // French
    };

    const languageCode = supportedLanguages[language.toLowerCase()] || "en-US";

    const recordedAudio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 }); // Google Cloud needs the file as a Base64 string

    const request = { // Payload - Audio settings are altered if the device is Android-based
      config: Platform.OS === "android" ? { encoding: "WEBM_OPUS", sampleRateHertz: 16000, languageCode: languageCode } : { encoding: "LINEAR16", sampleRateHertz: 44100, languageCode: languageCode }, 
      audio: { content: recordedAudio }
    };

    const response = await fetch( // Send request to Google Cloud API
      `https://speech.googleapis.com/v1/speech:recognize?key=${CLOUD_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify(request) // Google Cloud wants request object as a JSON
      }
    );

    const received = await response.json(); // Wait for a response before continuing
    
    return received.results?.[0]?.alternatives?.[0]?.transcript || "<Empty>"; // Return results as formatted by Google Cloud

  } catch (error) {
    
    console.error("getTranscription error: ", error);

    return false; // Transcription failure
  }
};