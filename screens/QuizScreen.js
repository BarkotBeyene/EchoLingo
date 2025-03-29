import { Text, View, Image, SafeAreaView, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import { useEffect, useContext, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

export default function QuizScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);

  createStyles(fontSize, isGreyscale);

  let dropdownColor = 'red';
  let generateColor = 'green';

  if (isGreyscale === true) {
    dropdownColor = 'darkgrey';
    generateColor = 'grey';
  }

  const message = "Now viewing: Quiz page. Quiz buttons from top to bottom: AI Quiz Generator, number of questions, question format, quiz topics, generate quiz. Press bottom banner to return home. Press top right banner to repeat this message.";
  useEffect(() => { if (isAutoRead) { speak(message); } }, []);

  const [aiPrompt, setAiPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [questionFormat, setQuestionFormat] = useState('Multiple Choice');
  const [quizTopic, setQuizTopic] = useState('Food');

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Quiz</Text>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Practice")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ width: '100%', paddingBottom: 100, paddingTop: 10 }}>
        {/* AI Prompt Input */}
        <Text style={{ paddingHorizontal: 10 }}>AI Quiz Generator</Text>
        <View style={styles.chatInputBox}>
          <TextInput
            style={[styles.Input, { width: '90%'}]}
            placeholder="Ex: Generate a quiz with 10 multiple-choice questions about basic food items"
            value={aiPrompt}
            onChangeText={setAiPrompt}
          />
        </View>

        {/* Dropdown for Number of Questions */}
        <TouchableOpacity style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 10, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}># of Questions</Text>
          <Picker
            selectedValue={numQuestions}
            onValueChange={(itemValue) => setNumQuestions(itemValue)}
            style={[styles.picker, { color: 'white' }]}
          >
            <Picker.Item label="10" value="10" />
            <Picker.Item label="20" value="20" />
            <Picker.Item label="30" value="30" />
          </Picker>
        </TouchableOpacity>

        {/* Dropdown for Question Format */}
        <TouchableOpacity style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 10, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Question Format</Text>
          <Picker
            selectedValue={questionFormat}
            onValueChange={(itemValue) => setQuestionFormat(itemValue)}
            style={[styles.picker, { color: 'white' }]}
          >
            <Picker.Item label="Basic Vocabulary" value="Basic Vocabulary" />
            <Picker.Item label="Grammar" value="Grammar" />
            <Picker.Item label="Listening Comprehension" value="Listening Comprehension" />
            <Picker.Item label="Translating" value="Translating" />
          </Picker>
        </TouchableOpacity>

        {/* Dropdown for Quiz Topics */}
        <TouchableOpacity style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 10, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Quiz Topics</Text>
          <Picker
            selectedValue={quizTopic}
            onValueChange={(itemValue) => setQuizTopic(itemValue)}
            style={[styles.picker, { color: 'white' }]}
          >
            <Picker.Item label="Food" value="Food" />
            <Picker.Item label="Animals" value="Animals" />
            <Picker.Item label="Colors" value="Colors" />
            <Picker.Item label="Numbers" value="Numbers" />
          </Picker>
        </TouchableOpacity>

        {/* Generate Exam Button */}
        <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: generateColor, borderRadius: 10 }}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Generate Exam</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Return Button */}
      <View style={[styles.topBanner, { marginBottom: '0%', marginTop: '1%' }]}>
        <TouchableOpacity style={[styles.bottomButton, { height: '95%' }]} onPress={() => navigate(navigation, 'Home')}>
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
