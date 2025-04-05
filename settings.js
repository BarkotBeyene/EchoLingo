import React from 'react';
import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create settings context object
export const Settings = createContext();

export const SettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("Large");
  const [isGreyscale, setGreyscale] = useState(false);
  const [isAutoRead, setAutoRead] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Load stored language from AsyncStorage when app starts
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (savedLanguage) setSelectedLanguage(savedLanguage);
      } catch (error) {
        console.error("Error loading language from AsyncStorage:", error);
      }
    };
    loadLanguage();
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

  const toggleFontSize = () => {
    if (fontSize === "Small") {
        setFontSize("Medium");
    } else if (fontSize === "Medium") {
        setFontSize("Large");
    } else if (fontSize === "Large") {
        setFontSize("Small");
    } 
  };

  const toggleGreyscale = () => {
    setGreyscale(!isGreyscale);
  };

  const toggleAutoRead = () => {
    setAutoRead(!isAutoRead);
  };

  return (
    <Settings.Provider value={{ fontSize, isGreyscale, isAutoRead, toggleFontSize, toggleGreyscale, 
                                toggleAutoRead, selectedLanguage, changeLanguage }}>
      {children}
    </Settings.Provider>
  );
};