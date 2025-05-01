import * as TTS from "expo-speech";
import { Audio } from "expo-av";

const supportedLanguages = {
  english: "en-US",
  spanish: "es-ES",
  french: "fr-FR",
  german: "de-DE",
  mandarin: "zh-CN",
};

// Unified `speak` function
export const speak = (message, selectedLanguage = "English") => {
  TTS.stop();

  const splits = message.match(/<(\w+)>([^<]+)/g);

  if (!splits) {
    const langCode = supportedLanguages[selectedLanguage.toLowerCase()] || supportedLanguages.english;
    TTS.speak(message, { language: langCode });
    return;
  }

  const speakSplits = async () => {
    for (const split of splits) {
      const [, lang, text] = split.match(/<(\w+)>(.+)/) || [];
      const readLang = supportedLanguages[lang.toLowerCase()] || supportedLanguages.english;

      await new Promise((resolve) => {
        TTS.speak(text, {
          language: readLang,
          onDone: resolve,
        });
      });
    }
  };

  speakSplits();
};

export const navigate = (navigation, location) => {
  TTS.stop();
  navigation.navigate(location);
};

export const sound = async (fileName, isSound) => {
  if (!isSound) return;

  try {
    const { sound } = await Audio.Sound.createAsync(fileName);
    await sound.setVolumeAsync(0.35);
    await sound.playAsync();
  } catch (error) {
    console.error("Failed to play sound: ", error);
  }
};