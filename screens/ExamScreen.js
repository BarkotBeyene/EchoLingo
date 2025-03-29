import React, { useState, useEffect, useContext } from 'react';
import { Text, View, Image, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';

// Custom Checkbox Component
const CustomCheckBox = ({ value, onValueChange }) => (
  <TouchableOpacity
    onPress={() => onValueChange(!value)}
    style={{
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: 'gray',
      backgroundColor: value ? 'blue' : 'white',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {value && <Text style={{ color: 'white', fontSize: 18 }}>✔</Text>}
  </TouchableOpacity>
);

export default function ExamScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);

  createStyles(fontSize, isGreyscale);

  let dropdownColor = 'red';
  let generateColor = 'green';

  if (isGreyscale === true) {
    dropdownColor = 'darkgrey';
    generateColor = 'grey';
  }

  const message = "Now viewing: Exam page. Exam buttons from top to bottom: AI Exam Generator, number of questions, question format, exam topics, generate exam. Press bottom banner to return home. Press top right banner to repeat this message.";
  useEffect(() => {
    if (isAutoRead) {
      speak(message);
    }
  }, []);

  const [aiPrompt, setAiPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState('10'); // Single selection
  const [questionFormat, setQuestionFormat] = useState([]); // Multi-selection
  const [quizTopic, setQuizTopic] = useState([]); // Multi-selection
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSelection, setCurrentSelection] = useState('');
  const [options, setOptions] = useState([]);

  const dropdownOptions = {
    questionFormat: ['Basic Vocabulary', 'Grammar', 'Listening Comprehension', 'Translating'],
    quizTopic: ['Food', 'Animals', 'Colors', 'Numbers'],
  };

  const handleSelection = (item) => {
    const current = currentSelection === 'questionFormat' ? questionFormat : quizTopic;
    const setCurrent = currentSelection === 'questionFormat' ? setQuestionFormat : setQuizTopic;

    if (current.includes(item)) {
      setCurrent(current.filter((i) => i !== item));
    } else {
      setCurrent([...current, item]);
    }
  };

  const openModal = (type) => {
    setCurrentSelection(type);
    setOptions(dropdownOptions[type]);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Exam</Text>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, 'Practice')}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ width: '100%', paddingBottom: 100, paddingTop: 10 }}>
        {/* AI Prompt Input */}
        <Text style={{ paddingHorizontal: 10 }}>AI Exam Generator</Text>
        <View style={styles.chatInputBox}>
          <TextInput
            style={[styles.Input, { width: '90%' }]}
            placeholder="Ex: Generate an exam with 10 multiple-choice questions about basic food items"
            value={aiPrompt}
            onChangeText={setAiPrompt}
          />
        </View>

        {/* Single-Select for Number of Questions */}
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

        {/* Multi-Select for Question Format */}
        <TouchableOpacity onPress={() => openModal('questionFormat')} style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Question Format: {questionFormat.join(', ') || 'Select'}</Text>
        </TouchableOpacity>

        {/* Multi-Select for Quiz Topics */}
        <TouchableOpacity onPress={() => openModal('quizTopic')} style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Exam Topics: {quizTopic.join(', ') || 'Select'}</Text>
        </TouchableOpacity>

        {/* Generate Exam Button */}
        <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: generateColor, borderRadius: 10 }}>
        <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Generate Exam</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Multi-Select */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                  <CustomCheckBox
                    value={
                      currentSelection === 'questionFormat'
                        ? questionFormat.includes(item)
                        : quizTopic.includes(item)
                    }
                    onValueChange={() => handleSelection(item)}
                  />
                  <Text style={{ fontSize: 18, marginLeft: 10 }}>{item}</Text>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 20, alignSelf: 'center' }}>
              <Text style={{ color: 'blue', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Return Button */}
      <View style={[styles.topBanner, { marginBottom: '0%', marginTop: '1%' }]}>
        <TouchableOpacity style={[styles.bottomButton, { height: '95%' }]} onPress={() => navigate(navigation, 'Home')}>
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
