// VocabPronunciationScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { Settings } from '../settings';
import createStyles from '../styles';
import { navigate, speak, sound } from '../functions';

export default function VocabPronunciationScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, isSound } = useContext(Settings);

  const fontSizeMapping = {
    Small: 12,
    Medium: 14,
    Large: 16,
    Large2: 18,
  };
  const numericFontSize = typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 16 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: Vocabulary and Pronunciation. Search for a word to learn its translation, example sentence, and hear its pronunciation.';
  const shortMessage = "Vocabulary and Pronunciation";

  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  const handleSearch = async () => {
    if (!word.trim()) return;
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim().toLowerCase()}`);
      const data = await res.json();
      const entry = data[0];

      const translation = entry.meanings?.[0]?.definitions?.[0]?.definition || 'No translation found';
      const example = entry.meanings?.[0]?.definitions?.[0]?.example || 'No example available.';
      const phonetic = entry.phonetics?.[0]?.text || 'No phonetic spelling';

      setResult({ word: entry.word, translation, example, phonetic });
    } catch (error) {
      console.error('Error fetching word data:', error);
      setResult({ word: word.trim(), translation: 'Not found', example: 'No example available.', phonetic: 'N/A' });
    }
  };

  const sampleWords = [
    { word: 'Hola', translation: 'Hello', example: 'Hola, ¿cómo estás?' },
    { word: 'Amarillo', translation: 'Yellow', example: 'El sol es amarillo.' },
    { word: 'Casa', translation: 'House', example: 'La casa es grande.' },
    { word: 'Comer', translation: 'To eat', example: 'Me gusta comer pizza.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity
          style={styles.topLeftBannerButton}
          onPress={() => navigate(navigation, 'Learn')}
        >
          <Image source={require('../assets/back.png')} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Vocabulary & Pronunciation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topRightBannerButton}
          onPress={() => speak(message)}
        >
          <Image source={require('../assets/volume.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.learnScreen_scrollContent}>
        <View style={styles.learnScreen_listContainer}>
          <TextInput
            style={[styles.input, { height: 50, fontSize: numericFontSize, marginBottom: 8, color: 'black' }]}
            placeholder="Search a word..."
            placeholderTextColor="#888"
            value={word}
            onChangeText={setWord}
          />

          <TouchableOpacity
            style={[styles.learnScreen_listItem, { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 24, marginBottom: 16 }]}
            onPress={handleSearch}
          >
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>

          {result && (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.buttonText, { fontSize: numericFontSize + 2, marginBottom: 6, color: 'black' }]}>{result.word}</Text>
              <Text style={{ fontSize: numericFontSize, marginBottom: 4, color: 'black' }}>
                <Text style={{ fontWeight: 'bold' }}>Translation:</Text> {result.translation}
              </Text>
              <Text style={{ fontSize: numericFontSize, marginBottom: 4, color: 'black' }}>
                <Text style={{ fontWeight: 'bold' }}>Example:</Text> {result.example}
              </Text>
              <Text style={{ fontSize: numericFontSize, color: 'black' }}>
                <Text style={{ fontWeight: 'bold' }}>Pronunciation:</Text> {result.phonetic}
              </Text>
            </View>
          )}

          {/* Sample Word Table */}
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.buttonText, { fontSize: numericFontSize + 2, marginBottom: 8, color: 'black' }]}>Sample Words</Text>
            {sampleWords.map((item, index) => (
              <View key={index} style={{ marginBottom: 12, borderBottomWidth: 1, paddingBottom: 6 }}>
                <Text style={{ fontSize: numericFontSize + 1, fontWeight: 'bold' }}>{item.word} 🔊</Text>
                <Text style={{ fontSize: numericFontSize }}>Translation: {item.translation}</Text>
                <Text style={{ fontSize: numericFontSize }}>Example: {item.example}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}