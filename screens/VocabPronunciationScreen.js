import React, { useContext, useEffect, useState } from 'react';
import {
  Text, View, SafeAreaView, TouchableOpacity, Image,
  ScrollView, TextInput, Platform
} from 'react-native';
import { Settings } from '../settings';
import createStyles from '../styles';
import { navigate, speak } from '../functions';
import { recordStart, recordStop, getTranscription } from '../voice';
import { sendMessageToAI } from '../openai';

const commonGreetings = {
  Spanish: [
    { word: "Hola", translation: "Hello", definition: "A common greeting", example: "¡Hola! ¿Cómo estás?", pronunciation: "OH-lah" },
    { word: "Buenos días", translation: "Good morning", definition: "Morning greeting", example: "¡Buenos días! ¿Qué tal?", pronunciation: "BWEH-nohs DEE-ahs" },
    { word: "Gracias", translation: "Thank you", definition: "Expression of gratitude", example: "¡Gracias por tu ayuda!", pronunciation: "GRAH-see-ahs" },
    { word: "Por favor", translation: "Please", definition: "Polite request", example: "Por favor, pasa.", pronunciation: "pohr fah-VOHR" },
    { word: "Adiós", translation: "Goodbye", definition: "Farewell greeting", example: "¡Adiós, hasta luego!", pronunciation: "ah-dee-OHS" }
  ],
  French: [
    { word: "Bonjour", translation: "Hello/Good day", definition: "Common daytime greeting", example: "Bonjour, comment allez-vous?", pronunciation: "bohn-ZHOOR" },
    { word: "Merci", translation: "Thank you", definition: "Expression of gratitude", example: "Merci beaucoup!", pronunciation: "mehr-SEE" },
    { word: "S'il vous plaît", translation: "Please", definition: "Polite request", example: "S'il vous plaît, entrez.", pronunciation: "seel voo PLEH" },
    { word: "Au revoir", translation: "Goodbye", definition: "Farewell greeting", example: "Au revoir, à bientôt!", pronunciation: "oh ruh-VWAHR" },
    { word: "Bonsoir", translation: "Good evening", definition: "Evening greeting", example: "Bonsoir, comment va?", pronunciation: "bohn-SWAHR" }
  ]
};

export default function VocabPronunciationScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage } = useContext(Settings);
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [recording, setRecording] = useState(false);

  const fontSizeMapping = {
    Small: 12, Medium: 14, Large: 16, Large2: 18,
  };
  const numericFontSize = typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 16 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: Vocabulary and Pronunciation. Search for a word to learn its translation, example sentence, and hear its pronunciation.';

  useEffect(() => {
    if (isAutoRead) {
      // Add a small delay to ensure proper initialization
      setTimeout(() => {
        speak(message);
      }, 100);
    }
  }, [isAutoRead, message]);

  const handleSearch = async (input = word) => {
    if (!input || typeof input !== 'string') {
      console.warn('Invalid input:', input);
      return;
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    try {
      const detectPrompt = `What language is the word '${trimmedInput}' in? Only return the language name.`;
      const languageResponse = await sendMessageToAI(detectPrompt);
      if (languageResponse.includes('API key is invalid') || languageResponse.includes('Authentication failed')) {
        setResult({
          word: input,
          translation: 'Error: API Authentication failed',
          definition: 'Please check your OpenAI API key configuration',
          example: '',
          pronunciation: ''
        });
        return;
      }

      const detectedLanguage = languageResponse.toLowerCase().includes('english') ? 'English' : selectedLanguage;
      const targetLang = detectedLanguage === 'English' ? selectedLanguage : 'English';

      const aiPrompt = `Translate the word "${trimmedInput}" from ${detectedLanguage} to ${targetLang}.
          Return a JSON object with:
          {
            "word": "...",
            "translation": "...",
            "definition": "...",
            "example": "...",
            "pronunciation": "..."
          }
          Do not include any explanation or extra text.`;

      const aiResponse = await sendMessageToAI(aiPrompt);
      const cleanResponse = aiResponse.replace(/^```?json|```$/gm, '').trim();
      const jsonMatch = cleanResponse.match(/{[\s\S]*}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      setResult(data || {
        word: input,
        translation: 'Not found',
        definition: 'N/A',
        example: 'N/A',
        pronunciation: 'N/A'
      });
    } catch (err) {
      console.error('AI error:', err);
      setResult({
        word: input,
        translation: 'Error: ' + (err.message || 'API request failed'),
        definition: 'Please try again later',
        example: '',
        pronunciation: ''
      });
    }
  };

  const handleRecord = async () => {
    if (Platform.OS === 'web') {
      alert('Voice recording is not available on web browsers');
      return;
    }

    if (!recording) {
      if (await recordStart()) {
        setRecording(true);
      }
    } else {
      setRecording(false);
      const uri = await recordStop();
      if (uri) {
        const transcript = await getTranscription(uri);
        if (transcript) {
          setWord(transcript);
          handleSearch(transcript);
        }
      }
    }
  };

  const speakResult = () => {
    if (!result) return;
    const msg = `The word is ${result.word}. Translation: ${result.translation}. Definition: ${result.definition}. Example: ${result.example}.`;
    speak(msg);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, 'Learn')}>
          <Image source={require('../assets/back.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Vocabulary & Pronunciation</Text>
        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.learnScreen_scrollContent}>
        <View style={styles.learnScreen_listContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TextInput
              style={[styles.input, { flex: 1, height: 50, fontSize: numericFontSize, color: 'black' }]}
              placeholder="Search a word..."
              placeholderTextColor="#888"
              value={word}
              onChangeText={setWord}
            />
            <TouchableOpacity onPress={handleRecord} style={{ marginLeft: 10 }}>
              <Image source={require('../assets/mic.png')} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.learnScreen_listItem, { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 24, marginBottom: 16 }]}
            onPress={() => handleSearch()}
          >
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>

          {!result && (
            <View style={styles.commonWordsContainer}>
              <Text style={[styles.sectionTitle, { fontSize: numericFontSize + 2, marginBottom: 12, color: 'black' }]}>
                Common Greetings in {selectedLanguage}
              </Text>
              <ScrollView 
                horizontal={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.wordsContainer}
              >
                {commonGreetings[selectedLanguage]?.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.wordCard}
                    onPress={() => {
                      setWord(item.word);
                      setResult(item);
                    }}
                  >
                    <View style={styles.wordHeader}>
                      <Text style={[styles.wordText, { fontSize: numericFontSize + 4, color: 'black' }]}>
                        {item.word}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => speak(item.word)}
                        style={styles.speakButton}
                      >
                        <Image source={require('../assets/volume.png')} style={styles.smallIcon} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.wordDetails}>
                      <Text style={[styles.translationText, { fontSize: numericFontSize - 2, color: 'gray' }]}>
                        <Text style={{ fontWeight: 'bold' }}>Translation:</Text> {item.translation}
                      </Text>
                      <Text style={[styles.translationText, { fontSize: numericFontSize - 2, color: 'gray' }]}>
                        <Text style={{ fontWeight: 'bold' }}>Definition:</Text> {item.definition}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {result && (
            <View style={{ alignItems: 'center', paddingHorizontal: 10 }}>
              <Text style={[styles.buttonText, { fontSize: numericFontSize + 2, marginBottom: 6, color: 'black' }]}>{result.word}</Text>
              <Text style={{ fontSize: numericFontSize, marginBottom: 4, color: 'black' }}>
                <Text style={{ fontWeight: 'bold' }}>Translation:</Text> {result.translation}
              </Text>
              <Text style={{ fontSize: numericFontSize, marginBottom: 4, color: 'black' }}>
                <Text style={{ fontWeight: 'bold' }}>Definition:</Text> {result.definition}
              </Text>
              <Text style={{ fontSize: numericFontSize, marginBottom: 4, color: 'black' }}>
                <Text style={{ fontWeight: 'bold' }}>Example:</Text> {result.example}
              </Text>
              <Text style={{ fontSize: numericFontSize, color: 'black' }}>
                <Text style={{ fontWeight: 'bold' }}>Pronunciation:</Text> {result.pronunciation}
              </Text>
              <TouchableOpacity onPress={speakResult} style={{ marginTop: 8 }}>
                <Image source={require('../assets/volume.png')} style={{ width: 30, height: 30 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.bottomButton} onPress={() => navigate(navigation, 'Home')}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Add these to your existing styles
const additionalStyles = {
  commonWordsContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  wordsContainer: {
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  wordDetails: {
    paddingTop: 4,
  },
  wordText: {
    fontWeight: '700',
  },
  translationText: {
    marginVertical: 2,
  },
  speakButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  smallIcon: {
    width: 20,
    height: 20,
  },
};