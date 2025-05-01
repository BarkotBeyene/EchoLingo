import React from 'react';
import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speak } from './functions.js';

// Create settings context object
export const Settings = createContext();

export const SettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("Large");
  const [isGreyscale, setGreyscale] = useState(false);
  const [isAutoRead, setAutoRead] = useState("Long");
  const [isSound, setSound] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish");

  // Load stored settings from AsyncStorage when app starts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('fontSize');
        const savedGreyscale = await AsyncStorage.getItem('isGreyscale');
        const savedAutoRead = await AsyncStorage.getItem('isAutoRead');
        const savedSound = await AsyncStorage.getItem('isSound');
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');

        if (savedFontSize) setFontSize(savedFontSize);
        if (savedGreyscale !== null) setGreyscale(savedGreyscale === 'true');
        if (savedAutoRead) setAutoRead(savedAutoRead);
        if (savedGreyscale !== null) setGreyscale(savedGreyscale === 'true');
        if (savedLanguage) setSelectedLanguage(savedLanguage);
      } catch (error) {
        console.error("Error loading settings from AsyncStorage:", error);
      }
    };
    loadSettings();
  }, []);

  // Save language change to AsyncStorage
  const changeLanguage = async (language) => {
    try {
      setSelectedLanguage(language);
      await AsyncStorage.setItem('selectedLanguage', language);
    } catch (error) {
      console.error("Error saving language to AsyncStorage:", error);
    }
  };

  const toggleFontSize = async () => {
    try {
      // Toggle through fontSize options
      let newSize;
      if (fontSize === "Small") newSize = "Medium";
      else if (fontSize === "Medium") newSize = "Large";
      else newSize = "Small";

      // Set new fontSize
      setFontSize(newSize);
      speak(newSize);

      // Store to Async
      await AsyncStorage.setItem('fontSize', newSize);

    } catch (error) {
      console.error("Error saving fontSize to AsyncStorage:", error);
    }
  };

  const toggleGreyscale = async () => {
    try {
      // Toggle isGreyscale
      const newValue = !isGreyscale;

      // Set new isGreyscale
      setGreyscale(newValue);
      if (newValue) {
        speak("On");
      } else {
        speak("Off");
      }

      // Store to Async
      await AsyncStorage.setItem('isGreyscale', newValue.toString());

    } catch (error) {
      console.error("Error saving isGreyscale to AsyncStorage:", error);
    }
  };

  const toggleAutoRead = async () => {
    try {
      // Toggle isAutoRead
      let newValue;
      if (isAutoRead === "Long") newValue = "Short";
      else if (isAutoRead === "Short") newValue = "Off";
      else newValue = "Long";

      // Set new isAutoRead
      setAutoRead(newValue);
      speak(newValue);

      // Store to Async
      await AsyncStorage.setItem('isAutoRead', newValue.toString());

    } catch (error) {
      console.error("Error saving isAutoRead to AsyncStorage:", error);
    }
  };

  const toggleSound = async () => {
    try {
      // Toggle isGreyscale
      const newValue = !isSound;

      // Set new isGreyscale
      setSound(newValue);
      if (newValue) {
        speak("On");
      } else {
        speak("Off");
      }

      // Store to Async
      await AsyncStorage.setItem('isSound', newValue.toString());

    } catch (error) {
      console.error("Error saving isSound to AsyncStorage:", error);
    }
  };

  return (
    <Settings.Provider value={{
      fontSize,
      isGreyscale,
      isAutoRead,
      isSound,
      selectedLanguage,
      toggleFontSize,
      toggleGreyscale,
      toggleAutoRead,
      toggleSound,
      changeLanguage
    }}>
      {children}
    </Settings.Provider>
  );
};