// Import necessary modules and components
import { Text, View, Image, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { useEffect, useContext, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
// Import Firestore
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../backend/config/firebaseConfig";
import { recordStart, recordStop, getTranscription } from '../voice.js'; // Import voice functions

// Custom Checkbox Component for multi-selection
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
  // Access user settings and apply styles
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  createStyles(fontSize, isGreyscale);

  // Define colors based on greyscale mode
  let dropdownColor = 'red';
  let generateColor = 'green';
  if (isGreyscale === true) {
    dropdownColor = 'darkgrey';
    generateColor = 'grey';
  }

  // Message for screen reader
  const message = "Now viewing: Exam page. Use the mode selector to choose between AI Generated and Premade exams. Press bottom banner to return home. Press the top left banner to use voice commands. Press once to begin recording and once again to stop recording. Say 'help' if stuck. Press top right banner to repeat this message.";
  useEffect(() => { if (isAutoRead) { speak(message); } }, []);

  // State variables for exam settings and data
  const [examMode, setExamMode] = useState("AI");

  const [aiPrompt, setAiPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [questionFormat, setQuestionFormat] = useState([]); // Multi-selection
  const [examTopic, setExamTopic] = useState([]); // Multi-selection
  const [examResult, setExamResult] = useState('');
  const [generatedExam, setGeneratedExam] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question index

  // Premade exam topics and data
  const premadeTopics = ["Numbers", "Colors", "Greeting/Introduction", "Days/Months/Seasons", "Family"];
  const [premadeTopic, setPremadeTopic] = useState("Numbers");
  const premadeExams = {
    "Numbers": [
      { question: "What is '6' in Spanish?", answer: ["seis"] },
      { question: "Write '50' in Spanish.", answer: ["cincuenta"] },
      { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
      { question: "In the sentence 'Yo tengo tres manzanas.', how many apples does the speaker have?", answer: ["three", "3"] },
      { question: "Translate 'diez' into English.", answer: ["ten"] }
    ],
    "Colors": [
      { question: "What does 'azul' mean in English?", answer: ["blue"] },
      { question: "Choose the correct form: 'La camisa es (rojo/roja).' Which is correct?", answer: ["roja"] },
      { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
      { question: "In the sentence 'El coche es negro.', what color is the car?", answer: ["black"] },
      { question: "Translate 'verde' to English.", answer: ["green"] }
    ],
    /*"Greeting/Introduction": [
      { question: "What does 'Hola' mean?", answer: "hello" },
      { question: "Translate 'My name is Anna' into Spanish.", answer: "me llamo anna" },
      { question: "Listening Comprehension: (For demo, type 'N/A')", answer: "n/a" },
      { question: "In the sentence 'Hola, me llamo Ana. ¿Cómo estás?', what is Ana's name?", answer: "ana" },
      { question: "Translate 'Buenos días' to English.", answer: "good morning" }
    ],*/
    "Greeting/Introduction": [
      { question: "What does 'Hola' mean?", answer: ["hello"] },
      { question: "Translate 'My name is Anna' into Spanish.", answer: ["me llamo anna", "mi nombre es anna"] },
      { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
      { question: "In the sentence 'Hola, me llamo Ana. ¿Cómo estás?', what is Ana's name?", answer: ["ana"] },
      { question: "Translate 'Buenos días' to English.", answer: ["good morning"] }
    ],
    "Days/Months/Seasons": [
      { question: "What is 'lunes' in English?", answer: ["monday"] },
      { question: "Identify the article: Why is 'mayo' used with 'el' in 'el mes de mayo'?", answer: ["because mes is masculine"] },
      { question: "Listening Comprehension: (For demo, type 'N/A')", answer: "n/a" },
      { question: "In the sentence 'Hoy es jueves y estamos en el mes de septiembre.', what day and month are mentioned?", answer: ["thursday and september"] },
      { question: "Translate 'invierno' into English.", answer: ["winter"] }
    ],
    "Family": [
      { question: "What is the English translation of 'madre'?", answer: ["mother", "mom"] },
      { question: "Explain the gender difference between 'hermano' and 'hermana'.", answer: ["hermano is masculine and hermana is feminine"] },
      { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
      { question: "In the sentence 'Tengo dos hermanos y una hermana.', how many siblings does the speaker have and what are their genders?", answer: ["three siblings: two brothers and one sister"] },
      { question: "Translate 'padre' into English.", answer: ["father", "dad"] }
    ]
  };

  const [userAnswers, setUserAnswers] = useState(Array(5).fill(""));
  const [premadeResult, setPremadeResult] = useState("");

  const dropdownOptions = {
    questionFormat: ['Basic Vocabulary', 'Grammar', 'Listening Comprehension', 'Translating'],
    examTopic: ['Numbers', 'Colors', 'Greeting/Introductions', 'Days/Months/Seasons', 'Family'],
  };

  // Multi-selection handler for formats and topics
  const handleSelection = (item, type) => {
    const current = type === 'questionFormat' ? questionFormat : examTopic;
    const setCurrent = type === 'questionFormat' ? setQuestionFormat : setExamTopic;

    if (current.includes(item)) {
      setCurrent(current.filter((i) => i !== item));
    } else {
      setCurrent([...current, item]);
    }
  };

  // Function to generate AI-based exam
  const handleGenerateExam = async () => {
    if (examMode === "AI") {
      try {
        if (examTopic.length === 0 || questionFormat.length === 0) {
          const errorMessage = "Please select at least one topic and one question format.";
          setExamResult(errorMessage);
          speak(errorMessage);
          return;
        }
  
        const totalQuestions = parseInt(numQuestions);
        const questionsPerCombination = Math.ceil(totalQuestions / (examTopic.length * questionFormat.length));
        let allQuestions = [];
  
        for (const topic of examTopic) {
          for (const format of questionFormat) {
            const docRef = doc(db, "Quizzes", topic);
            const docSnap = await getDoc(docRef);
  
            if (docSnap.exists()) {
              const data = docSnap.data();
              const questions = data[format] || [];
              const answers = data[`${format} Answers`] || [];
  
              if (questions.length === 0 || answers.length === 0) {
                console.warn(`No questions available for topic "${topic}" and format "${format}".`);
                continue;
              }
  
              // Shuffle and select a subset of questions for this topic/format
              const shuffledIndices = Array.from({ length: questions.length }, (_, i) => i).sort(() => Math.random() - 0.5);
              const selectedQuestions = shuffledIndices.slice(0, questionsPerCombination).map(index => ({
                question: questions[index],
                answer: answers[index],
              }));
  
              allQuestions = [...allQuestions, ...selectedQuestions];
            } else {
              console.warn(`No data found for topic "${topic}".`);
            }
          }
        }
  
        if (allQuestions.length === 0) {
          const errorMessage = "No questions available for the selected topics and formats.";
          setExamResult(errorMessage);
          speak(errorMessage);
          return;
        }
  
        // Shuffle all collected questions and limit to the total number of questions requested
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, totalQuestions);
  
        setGeneratedExam(shuffledQuestions);
        setUserAnswers(Array(shuffledQuestions.length).fill(""));
        setExamResult("");
  
        let combinedText = "Here are your questions: ";
        shuffledQuestions.forEach((q, index) => {
          combinedText += `Question ${index + 1}: ${q.question}. `;
        });
        speak(combinedText);
      } catch (error) {
        const errorMessage = "An error occurred while fetching exam data.";
        setExamResult(errorMessage);
        speak(errorMessage);
        console.error(error);
      }
    }
  };

  // Function to submit answers for AI-generated exam
  const handleSubmitGeneratedExam = () => {
    let correctCount = 0;
    let incorrectQuestions = [];

    generatedExam.forEach((q, index) => {
      const userAnswer = userAnswers[index].trim().toLowerCase();
      const correctAnswers = Array.isArray(q.answer)
        ? q.answer.map((ans) => ans.trim().toLowerCase())
        : [q.answer.trim().toLowerCase()];

      if (correctAnswers.includes(userAnswer)) {
        correctCount++;
      } else {
        incorrectQuestions.push({
          questionIndex: index + 1,
          question: q.question,
          userAnswer: userAnswers[index],
          correctAnswers: q.answer,
        });
      }
    });

    let resultsText = `You got ${correctCount} out of ${generatedExam.length} correct.\n\n`;
    if (incorrectQuestions.length > 0) {
      resultsText += "Here are the questions you got wrong:\n";
      incorrectQuestions.forEach((q) => {
        resultsText += `Q${q.questionIndex}: ${q.question}\n`;
        resultsText += `Your answer: ${q.userAnswer || "No answer"}\n`;
        resultsText += `Correct answers: ${Array.isArray(q.correctAnswers) ? q.correctAnswers.join(" or ") : q.correctAnswers}\n\n`;
      });
    } else {
      resultsText += "Great job! You answered all questions correctly!";
    }

    setExamResult(resultsText);
    speak(resultsText);
  };

  // Function to submit answers for premade exam
  const handlePremadeSubmit = () => {
    const questions = premadeExams[premadeTopic];
    let correctCount = 0;
    let resultsText = `You got `;
    questions.forEach((q, index) => {
      const userAnswer = userAnswers[index].trim().toLowerCase();
      const correctAnswers = q.answer.map(ans => ans.trim().toLowerCase());
      if (correctAnswers.includes(userAnswer)) correctCount++;
    });
    resultsText += `${correctCount} out of ${questions.length} correct.\n`;
    questions.forEach((q, index) => {
      resultsText += `Question ${index + 1}: Your answer: ${userAnswers[index]} | Correct: ${q.answer.join(" or ")}\n`;
    });
    setPremadeResult(resultsText);
    speak(resultsText);
  };

  // Function to read all questions aloud
  const readAllQuestions = () => {
    const questions = premadeExams[premadeTopic];
    let combinedText = "";
    questions.forEach((q, index) => {
      combinedText += `Question ${index + 1}: ${q.question}. `;
    });
    speak(combinedText);
  };

  // Modal handling for multi-selection
  const openModal = (type) => {
    setCurrentSelection(type);
    setOptions(dropdownOptions[type]);
    setModalVisible(true);
  };

  // Voice recording and transcription handling
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSelection, setCurrentSelection] = useState('');
  const [options, setOptions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLanguage, setRecordingLanguage] = useState("english"); // State to track recording language

  const numberToSpanishString = {
    0: "cero",
    1: "uno",
    2: "dos",
    3: "tres",
    4: "cuatro",
    5: "cinco",
    6: "seis",
    7: "siete",
    8: "ocho",
    9: "nueve",
    10: "diez",
    20: "veinte",
    30: "treinta",
    40: "cuarenta",
    50: "cincuenta",
    60: "sesenta",
    70: "setenta",
    80: "ochenta",
    90: "noventa",
    100: "cien",
    // Add more mappings as needed
  };

  const convertNumbersToStrings = (transcript) => {
    return transcript
      .split(" ")
      .map((word) => {
        const number = parseInt(word, 10);
        return numberToSpanishString[number] || word;
      })
      .join(" ");
  };

  const handleMicPress = async () => {
    if (isRecording) {
      // Stop recording and process voice input
      const uri = await recordStop();
      setIsRecording(false);

      if (uri) {
        let transcript = (await getTranscription(uri, recordingLanguage)).toLowerCase(); // Pass recordingLanguage

        if (transcript.includes("help")) {
          speak(
            "Here are the available voice commands: " +
            "Say 'mode generated' to switch to AI-generated mode. " +
            "Say 'mode premade' to switch to premade mode. " +
            "Say '10 questions', '20 questions', or '30 questions' to set the number of questions. " +
            "Say 'question format' followed by a format to select a question format. " +
            "Say 'question topic' followed by a topic to select a question topic. " +
            "Say 'generate' to generate the exam. " +
            "Say 'read questions' to read all questions aloud. " +
            "Say 'next question' or 'previous question' to navigate between questions. " +
            "Say 'answer' to switch to Spanish and provide an answer starting with 'inicio'."
          );
        } else {
          processVoiceCommand(transcript);
        }
      }
    } else {
      // Start recording
      const recordingStarted = await recordStart();
      if (recordingStarted) {
        speak("Recording started.");
        setIsRecording(true);
      }
    }
  };

  const processVoiceCommand = (transcript) => {
    console.log(`User recorded: ${transcript}`); // Log the user's recorded transcript

    // Handle mode switching
    if (transcript.includes("mode")) {
      if (transcript.includes("generated")) {
        setExamMode("AI");
        speak("Switched to generated mode.");
      } else if (transcript.includes("pre-made")) {
        setExamMode("Premade");
        speak("Switched to premade mode.");
      }
    }

    // Handle number of questions
    if (transcript.includes("questions")) {
      if (transcript.includes("10")) {
        setNumQuestions("10");
        speak("Number of questions set to 10.");
      } else if (transcript.includes("20")) {
        setNumQuestions("20");
        speak("Number of questions set to 20.");
      } else if (transcript.includes("30")) {
        setNumQuestions("30");
        speak("Number of questions set to 30.");
      }
    }

    // Handle question format selection
    if (transcript.includes("question format")) {
      dropdownOptions.questionFormat.forEach((format) => {
        if (transcript.includes(format.toLowerCase())) {
          handleSelection(format, "questionFormat");
          speak(`Question format ${format} selected.`);
        }
      });
    }

    // Handle question topic selection
    if (transcript.includes("question topic")) {
      dropdownOptions.examTopic.forEach((topic) => {
        if (transcript.includes(topic.toLowerCase())) {
          handleSelection(topic, "examTopic");
          speak(`Question topic ${topic} selected.`);
        }
      });
    }

    // Handle generating the exam
    if (transcript.includes("generate")) {
      handleGenerateExam();
      speak("Generating the exam.");
    }

    // Handle reading questions aloud
    if (transcript.includes("read questions")) {
      if (examMode === "AI" && generatedExam.length > 0) {
        let combinedText = "Here are your questions: ";
        generatedExam.forEach((q, index) => {
          combinedText += `Question ${index + 1}: ${q.question}. `;
        });
        speak(combinedText);
      } else if (examMode === "Premade") {
        const questions = premadeExams[premadeTopic];
        let combinedText = "Here are your questions: ";
        questions.forEach((q, index) => {
          combinedText += `Question ${index + 1}: ${q.question}. `;
        });
        speak(combinedText);
      } else {
        speak("No questions available to read.");
      }
    }

    // Handle navigating between questions
    if (transcript.includes("next question")) {
      if (examMode === "AI" && generatedExam.length > 0) {
        if (currentQuestionIndex < generatedExam.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          speak(`Next question: ${generatedExam[currentQuestionIndex + 1].question}`);
        } else {
          speak("You are already on the last question.");
        }
      } else if (examMode === "Premade") {
        if (currentQuestionIndex < premadeExams[premadeTopic].length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          speak(`Next question: ${premadeExams[premadeTopic][currentQuestionIndex + 1].question}`);
        } else {
          speak("You are already on the last question.");
        }
      } else {
        speak("No questions available to navigate.");
      }
    }

    if (transcript.includes("previous question")) {
      if (examMode === "AI" && generatedExam.length > 0) {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          speak(`Previous question: ${generatedExam[currentQuestionIndex - 1].question}`);
        } else {
          speak("You are already on the first question.");
        }
      } else if (examMode === "Premade") {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          speak(`Previous question: ${premadeExams[premadeTopic][currentQuestionIndex - 1].question}`);
        } else {
          speak("You are already on the first question.");
        }
      } else {
        speak("No questions available to navigate.");
      }
    }

    // Handle inputting answers
    if (transcript.includes("answer")) {
      const answerMatch = transcript.match(/answer/);
      if (answerMatch) {
        speak("Recording language switched to Spanish. Please say 'inicio' followed by your answer.");
        setRecordingLanguage("spanish"); // Switch recording language to Spanish
      }
    }

    if (transcript.includes("inicio")) {
      transcript = convertNumbersToStrings(transcript); // Convert numbers to strings
      const inicioMatch = transcript.match(/inicio (.+)/);
      if (inicioMatch && inicioMatch[1]) {
        const answer = inicioMatch[1].trim();
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = answer; // Update the answer for the current question
        setUserAnswers(newAnswers);
        speak(`Answer recorded for question ${currentQuestionIndex + 1}.`);
        setRecordingLanguage("english"); // Switch recording language back to English
      } else {
        speak("Please specify your answer after saying 'inicio'.");
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { alignItems: 'stretch' }]}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Exam</Text>
        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topLeftBannerButton} onPress={handleMicPress}>
          <Image style={{ width: 65, height: 65 }} source={require('../assets/mic.png')} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ width: '100%', paddingBottom: 100, paddingTop: 10 }}>
        {/* Mode Selector */}
        <TouchableOpacity style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 10, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Select Mode</Text>
          <Picker
            selectedValue={examMode}
            onValueChange={(itemValue) => { 
              setExamMode(itemValue); 
              setExamResult("");
              setPremadeResult("");
            }}
            style={[styles.picker, { color: 'white' }]}
          >
            <Picker.Item label="Generated" value="AI" />
            <Picker.Item label="Premade" value="Premade" />
          </Picker>
        </TouchableOpacity>
        {examMode === "AI" ? (
          <>
            {/* AI Generated Exam */}
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

            {/* Multi-Select for Exam Topics */}
            <TouchableOpacity onPress={() => openModal('examTopic')} style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Exam Topics: {examTopic.join(', ') || 'Select'}</Text>
            </TouchableOpacity>

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
                              : examTopic.includes(item)
                          }
                          onValueChange={() => handleSelection(item, currentSelection)}
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

            <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: generateColor, borderRadius: 10 }} onPress={handleGenerateExam}>
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Generate Exam</Text>
            </TouchableOpacity>
            {examMode === "AI" && generatedExam.length > 0 && (
              <>
                {generatedExam.map((q, index) => (
                  <View key={index} style={{ marginVertical: 10, paddingHorizontal: 10 }}>
                    <Text style={{ fontSize: 16 }}>{`Q${index + 1}: ${q.question}`}</Text>
                    <TextInput
                      style={[styles.Input, { marginTop: 5 }]}
                      placeholder="Your answer"
                      value={userAnswers[index]}
                      onChangeText={(text) => {
                        const newAnswers = [...userAnswers];
                        newAnswers[index] = text;
                        setUserAnswers(newAnswers);
                      }}
                    />
                  </View>
                ))}
                <TouchableOpacity
                  style={{ paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: generateColor, borderRadius: 10 }}
                  onPress={handleSubmitGeneratedExam}
                >
                  <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Submit Exam</Text>
                </TouchableOpacity>
                {examResult !== "" && (
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 16, color: 'black', textAlign: 'left' }}>{examResult}</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Premade Exam */}
            <Text style={{ paddingHorizontal: 10, fontSize: 18 }}>Select Topic</Text>
            <Picker
              selectedValue={premadeTopic}
              onValueChange={(itemValue) => {
                setPremadeTopic(itemValue);
                setUserAnswers(Array(5).fill(""));
                setPremadeResult("");
              }}
              style={[styles.picker, { color: 'black' }]}
            >
              {premadeTopics.map(topic => (
                <Picker.Item key={topic} label={topic} value={topic} />
              ))}
            </Picker>
            {/* Read Aloud Questions Button */}
            <TouchableOpacity onPress={readAllQuestions} style={{ margin: '1%', padding: 10, backgroundColor: dropdownColor, borderRadius: 10 }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>Read Aloud Questions</Text>
            </TouchableOpacity>
            {premadeExams[premadeTopic].map((q, index) => (
              <View key={index} style={{ marginVertical: 10, paddingHorizontal: 10 }}>
                <Text style={{ fontSize: 16 }}>{`Q${index+1}: ${q.question}`}</Text>
                <TextInput
                  style={[styles.Input, { marginTop: 5 }]}
                  placeholder="Your answer"
                  value={userAnswers[index]}
                  onChangeText={(text) => {
                    const newAnswers = [...userAnswers];
                    newAnswers[index] = text;
                    setUserAnswers(newAnswers);
                  }}
                />
              </View>
            ))}
            <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: generateColor, borderRadius: 10 }} onPress={handlePremadeSubmit}>
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Submit Exam</Text>
            </TouchableOpacity>
            {premadeResult !== "" && (
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, color: 'black', textAlign: 'left' }}>{premadeResult}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <View style={[styles.topBanner, { marginBottom: '0%', marginTop: '1%' }]}>
        <TouchableOpacity style={[styles.bottomButton, { height: '95%' }]} onPress={() => navigate(navigation, 'Home')}>
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
