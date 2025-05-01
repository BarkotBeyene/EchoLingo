import React, { useEffect, useContext, useState } from 'react';
import {
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { Settings } from '../settings';
import createStyles from '../styles.js';
import { navigate, speak, sound } from '../functions.js';
import { FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';

export default function LearnScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage, isSound } = useContext(Settings);
  const [materials, setMaterials] = useState([]);
  const { width } = useWindowDimensions();

  const fontSizeMapping = {
    Small: 12,
    Medium: 14,
    Large: 16,
    Large2: 18,
  };
  const numericFontSize = typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 16 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: Learn. Explore reading materials, videos, grammar lessons, vocabulary and pronunciation, and notes. Tap on each item to begin learning. Press top left to go back. Press bottom banner to return home. Press top right to repeat this message.';
  const shortMessage = "Learn";

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await fetch(`http://localhost:5000/api/materials?type=text&language=${selectedLanguage}`);
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.log("Fetch failed silently:", error);
        setMaterials([]);
      }
    }

    fetchMaterials();
    if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);}
  }, [selectedLanguage]);

  const buttonWidth = width * 0.44;
  const fullWidth = width * 0.9;
  const buttonHeight = 80;
  const buttonFontSize = numericFontSize + 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity
          style={styles.topLeftBannerButton}
          onPress={() => navigate(navigation, 'Home')}
        >
          <Image source={require('../assets/back.png')} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topRightBannerButton}
          onPress={() => speak(message)}
        >
          <Image source={require('../assets/volume.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Button Grid */}
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: fullWidth, marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.gridButton4, { width: buttonWidth, height: buttonHeight }]}
            onPress={() => navigate(navigation, 'TextMaterials')}
          >
            <MaterialIcons name="menu-book" size={24} color="white" />
            <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>Read & Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridButton4, { width: buttonWidth, height: buttonHeight }]}
            onPress={() => navigate(navigation, 'VocabPronunciation')}
          >
            <Entypo name="sound" size={24} color="white" />
            <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>Vocabulary</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: fullWidth, marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.gridButton4, { width: buttonWidth, height: buttonHeight }]}
            onPress={() => navigate(navigation, 'VideoMaterials')}
          >
            <FontAwesome5 name="video" size={24} color="white" />
            <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>Watch & Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridButton4, { width: buttonWidth, height: buttonHeight }]}
            onPress={() => navigate(navigation, 'Grammar')}
          >
            <FontAwesome5 name="book" size={24} color="white" />
            <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>Grammar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.gridButton4, { width: fullWidth, height: buttonHeight + 10, marginTop: 5 }]}
          onPress={() => navigate(navigation, 'MyNotes')}
        >
          <FontAwesome5 name="sticky-note" size={24} color="white" />
          <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>My Notes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}