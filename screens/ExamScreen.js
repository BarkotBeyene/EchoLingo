// Import necessary modules and components
import { Text, View, Image, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { useEffect, useContext, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../settings.js';
import { Preferences } from '../screens/PreferencesScreen.js';
import createStyles from '../styles.js';
import { navigate, speak, sound } from '../functions.js';
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
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage, isSound } = useContext(Settings);
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
  const shortMessage = "Exam";
  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

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
  const premadeTopics = ["Numbers", "Colors", "Greetings & Introductions", "Days & Months & Seasons", "Family"];
  const [premadeTopic, setPremadeTopic] = useState("Numbers");

  const allPremadeExams = {
    Spanish: {
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
      "Greetings & Introductions": [
        { question: "What does 'Hola' mean?", answer: ["hello"] },
        { question: "Translate 'My name is Anna' into Spanish.", answer: ["me llamo anna", "mi nombre es anna"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Hola, me llamo Ana. ¿Cómo estás?', what is Ana's name?", answer: ["ana"] },
        { question: "Translate 'Buenos días' to English.", answer: ["good morning"] }
      ],
      "Days & Months & Seasons": [
        { question: "What is 'lunes' in English?", answer: ["monday"] },
        { question: "Identify the article: Why is 'mayo' used with 'el' in 'el mes de mayo'?", answer: ["because mes is masculine"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
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
    },
    French: {
      "Numbers": [
        { question: "What is '6' in French?", answer: ["six"] },
        { question: "Write '50' in French.", answer: ["cinquante"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'J'ai trois pommes.', how many apples does the speaker have?", answer: ["three", "3"] },
        { question: "Translate 'dix' into English.", answer: ["ten"] }
      ],
      "Colors": [
        { question: "What does 'bleu' mean in English?", answer: ["blue"] },
        { question: "Choose the correct form: 'La chemise est (bleu/bleue).' Which is correct?", answer: ["bleue"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'La voiture est noire.', what color is the car?", answer: ["black"] },
        { question: "Translate 'vert' to English.", answer: ["green"] }
      ],
      "Greetings & Introductions": [
        { question: "What does 'Bonjour' mean?", answer: ["hello", "good morning", "good day"] },
        { question: "Translate 'My name is Anna' into French.", answer: ["je m'appelle anna", "je suis anna"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Bonjour, je m'appelle Marie. Comment allez-vous?', what is Marie's name?", answer: ["marie"] },
        { question: "Translate 'Bonsoir' to English.", answer: ["good evening"] }
      ],
      "Days & Months & Seasons": [
        { question: "What is 'lundi' in English?", answer: ["monday"] },
        { question: "Identify the article: Why is 'mai' used with 'le' in 'le mois de mai'?", answer: ["because mois is masculine"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Aujourd'hui c'est jeudi et nous sommes en septembre.', what day and month are mentioned?", answer: ["thursday and september"] },
        { question: "Translate 'hiver' into English.", answer: ["winter"] }
      ],
      "Family": [
        { question: "What is the English translation of 'mère'?", answer: ["mother", "mom"] },
        { question: "Explain the gender difference between 'frère' and 'sœur'.", answer: ["frère is masculine and sœur is feminine"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'J'ai deux frères et une sœur.', how many siblings does the speaker have?", answer: ["three siblings: two brothers and one sister"] },
        { question: "Translate 'père' into English.", answer: ["father", "dad"] }
      ]
    },
    German: {
      "Numbers": [
        { question: "What is '6' in German?", answer: ["sechs"] },
        { question: "Write '50' in German.", answer: ["fünfzig"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Ich habe drei Äpfel.', how many apples does the speaker have?", answer: ["three", "3"] },
        { question: "Translate 'zehn' into English.", answer: ["ten"] }
      ],
      "Colors": [
        { question: "What does 'blau' mean in English?", answer: ["blue"] },
        { question: "Choose the correct form: 'Das Hemd ist (blau/blaue).' Which is correct?", answer: ["blau"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Das Auto ist schwarz.', what color is the car?", answer: ["black"] },
        { question: "Translate 'grün' to English.", answer: ["green"] }
      ],
      "Greetings & Introductions": [
        { question: "What does 'Hallo' mean?", answer: ["hello"] },
        { question: "Translate 'My name is Anna' into German.", answer: ["ich heiße anna", "ich bin anna"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Hallo, ich heiße Hans. Wie geht es dir?', what is Hans's name?", answer: ["hans"] },
        { question: "Translate 'Guten Morgen' to English.", answer: ["good morning"] }
      ],
      "Days & Months & Seasons": [
        { question: "What is 'Montag' in English?", answer: ["monday"] },
        { question: "Identify the article: Why is 'Mai' used with 'der' in 'der Monat Mai'?", answer: ["because monat is masculine"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Heute ist Donnerstag und wir sind im September.', what day and month are mentioned?", answer: ["thursday and september"] },
        { question: "Translate 'Winter' into English.", answer: ["winter"] }
      ],
      "Family": [
        { question: "What is the English translation of 'Mutter'?", answer: ["mother", "mom"] },
        { question: "Explain the gender difference between 'Bruder' and 'Schwester'.", answer: ["bruder is masculine and schwester is feminine"] },
        { question: "Listening Comprehension: (For demo, type 'N/A')", answer: ["n/a"] },
        { question: "In the sentence 'Ich habe zwei Brüder und eine Schwester.', how many siblings does the speaker have?", answer: ["three siblings: two brothers and one sister"] },
        { question: "Translate 'Vater' into English.", answer: ["father", "dad"] }
      ]
    }
  };

  // Use a computed property to get the correct language questions
  const premadeExams = allPremadeExams[selectedLanguage] || allPremadeExams.Spanish;

  const [userAnswers, setUserAnswers] = useState(Array(5).fill(""));
  const [premadeResult, setPremadeResult] = useState("");

  const dropdownOptions = {
    questionFormat: ['Basic Vocabulary', 'Grammar', 'Listening Comprehension', 'Translating'],
    examTopic: ['Numbers', 'Colors', 'Greetings & Introductions', 'Days & Months & Seasons', 'Family'],
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

  const numberToStringMappings = {
    Spanish: {
      0: "cero", 1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
      6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
      11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
      16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve",
      20: "veinte", 30: "treinta", 40: "cuarenta", 50: "cincuenta",
      60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa", 100: "cien"
    },
    French: {
      0: "zéro", 1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq",
      6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
      11: "onze", 12: "douze", 13: "treize", 14: "quatorze", 15: "quinze",
      16: "seize", 17: "dix-sept", 18: "dix-huit", 19: "dix-neuf",
      20: "vingt", 30: "trente", 40: "quarante", 50: "cinquante",
      60: "soixante", 70: "soixante-dix", 80: "quatre-vingt", 90: "quatre-vingt-dix", 100: "cent"
    },
    German: {
      0: "null", 1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf",
      6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 10: "zehn",
      11: "elf", 12: "zwölf", 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn",
      16: "sechzehn", 17: "siebzehn", 18: "achtzehn", 19: "neunzehn",
      20: "zwanzig", 30: "dreißig", 40: "vierzig", 50: "fünfzig",
      60: "sechzig", 70: "siebzig", 80: "achtzig", 90: "neunzig", 100: "hundert"
    }
  };

  const convertNumbersToStrings = (transcript) => {
    const mapping = numberToStringMappings[selectedLanguage] || {};
    return transcript
      .split(" ")
      .map((word) => {
        const number = parseInt(word, 10);
        return mapping[number] || word;
      })
      .join(" ");
  };

  // Add these state variables with the other state declarations
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLanguage, setRecordingLanguage] = useState("english");
  const [isAnswerMode, setIsAnswerMode] = useState(false);

  // Function to generate AI-based exam
  const handleGenerateExam = async () => {
    const collectionName = selectedLanguage === "French" ? "Quizzes_French" :
                           selectedLanguage === "German" ? "Quizzes_German" : "Quizzes";
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
            const docRef = doc(db, collectionName, topic);
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

  // Replace the existing handleMicPress function
  const handleMicPress = async () => {
    if (isRecording) {
      // Stop recording and get the URI
      const uri = await recordStop();
      if (uri) {
        let transcript = (await getTranscription(uri, recordingLanguage)).toLowerCase();
        console.log("Transcript:", transcript); // Debug logging
        
        if (isAnswerMode) {
          // Convert numbers to strings if answering in the target language
          const convertedTranscript = recordingLanguage !== "english" ? 
            convertNumbersToStrings(transcript) : 
            transcript;

          // Handle the answer recording
          const newAnswers = [...userAnswers];
          newAnswers[currentQuestionIndex] = convertedTranscript;
          setUserAnswers(newAnswers);
          speak(`Answer recorded: ${convertedTranscript}`);
          setIsAnswerMode(false);
          setRecordingLanguage("english"); // Reset language to English
          return;
        }
        
        if (transcript.includes("help")) {
          speak(
            "Here are the available voice commands: " +
            "Say 'mode generated' or 'mode premade' to switch exam modes. " +
            "Say '10 questions', '20 questions', or '30 questions' to set count. " +
            "Say 'format' followed by basic vocabulary, grammar, listening, or translating. " +
            "Say 'topic' followed by numbers, colors, greetings, days, or family. " +
            "Say 'generate exam' to create a new exam. " + 
            "Say 'read questions' to hear all questions. " +
            "Say 'next question' or 'previous question' to navigate questions. " +
            "Say 'answer' to record your answer in the selected language. " +
            "Press the mic button again when ready to record your answer."
          );
        } else if (transcript.includes("answer")) {
          setIsAnswerMode(true);
          setRecordingLanguage(selectedLanguage.toLowerCase());
          speak(`Please press the microphone button again to record your answer in ${selectedLanguage}`);
        } else {
          processVoiceCommand(transcript);
        }
      }
      setIsRecording(false);
    } else {
      // Start recording
      if (await recordStart()) {
        setIsRecording(true);
        speak(isAnswerMode ? 
          `Recording answer in ${selectedLanguage}. Press mic again to stop.` : 
          "Recording");
      } else {
        console.error("Failed to start recording");
      }
    }
  };

  // Replace the existing processVoiceCommand function
  const processVoiceCommand = (transcript) => {
    console.log("Processing command:", transcript);

    // Add navigation commands
    if (transcript.includes("next question")) {
      goToNextQuestion();
      return;
    }

    if (transcript.includes("previous question")) {
      goToPreviousQuestion();
      return;
    }

    // Handle mode switching
    if (transcript.includes("mode")) {
      if (transcript.includes("generated") || transcript.includes("ai")) {
        setExamMode("AI");
        speak("Switched to generated exam mode");
      } else if (transcript.includes("premade") || transcript.includes("pre-made")) {
        setExamMode("Premade"); 
        speak("Switched to premade exam mode");
      }
      return;
    }

    // Handle question count
    if (transcript.includes("questions")) {
      ["10", "20", "30"].forEach(num => {
        if (transcript.includes(num)) {
          setNumQuestions(num);
          speak(`Number of questions set to ${num}`);
        }
      });
      return;
    }

    // Handle format selection - Modified for multi-selection
    if (transcript.includes("format")) {
      const formats = {
        "basic": "Basic Vocabulary",
        "vocabulary": "Basic Vocabulary", 
        "grammar": "Grammar",
        "listening": "Listening Comprehension",
        "translating": "Translating"
      };

      Object.entries(formats).forEach(([key, value]) => {
        if (transcript.includes(key.toLowerCase())) {
          // Add to existing formats instead of replacing
          if (!questionFormat.includes(value)) {
            setQuestionFormat([...questionFormat, value]);
            speak(`Added ${value} to question formats`);
          } else {
            speak(`${value} is already selected`);
          }
        }
      });
      return;
    }

    // Handle topic selection - Modified for multi-selection
    if (transcript.includes("topic")) {
      premadeTopics.forEach(topic => {
        if (transcript.toLowerCase().includes(topic.toLowerCase())) {
          if (examMode === "AI") {
            // Add to existing topics instead of replacing
            if (!examTopic.includes(topic)) {
              setExamTopic([...examTopic, topic]);
              speak(`Added ${topic} to exam topics`);
            } else {
              speak(`${topic} is already selected`);
            }
          } else {
            setPremadeTopic(topic);
            speak(`Topic set to ${topic}`);
          }
        }
      });
      return;
    }

    // Handle exam generation
    if (transcript.includes("generate") && transcript.includes("exam")) {
      handleGenerateExam();
      speak("Generating new exam");
      return;
    }

    // Handle reading questions
    if (transcript.includes("read") && transcript.includes("questions")) {
      readAllQuestions();
      return;
    }

    speak("Command not recognized. Say 'help' for available commands.");
  };

  const goToNextQuestion = () => {
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
  };

  const goToPreviousQuestion = () => {
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
  };

  return (
    <SafeAreaView style={[styles.container, { alignItems: 'stretch' }]}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Exam</Text>
        </TouchableOpacity>
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
                  <View key={index} style={{ 
                    marginVertical: 10, 
                    marginHorizontal: '1%',
                    padding: 15,
                    borderWidth: 2,
                    borderColor: dropdownColor,
                    borderRadius: 10,
                    backgroundColor: 'white',
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                  }}>
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
            {/* Premade Exam Topic Selector */}
            <TouchableOpacity style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 10, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Select Topic</Text>
              <Picker
                selectedValue={premadeTopic}
                onValueChange={(itemValue) => {
                  setPremadeTopic(itemValue);
                  setUserAnswers(Array(5).fill(""));
                  setPremadeResult("");
                }}
                style={[styles.picker, { color: 'white' }]}
              >
                {premadeTopics.map(topic => (
                  <Picker.Item key={topic} label={topic} value={topic} />
                ))}
              </Picker>
            </TouchableOpacity>
            {/* Read Aloud Questions Button */}
            <TouchableOpacity onPress={readAllQuestions} style={{ margin: '1%', padding: 10, backgroundColor: dropdownColor, borderRadius: 10 }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>Read Aloud Questions</Text>
            </TouchableOpacity>
            {premadeExams[premadeTopic].map((q, index) => (
              <View key={index} style={{ 
                marginVertical: 10, 
                marginHorizontal: '1%',
                padding: 15,
                borderWidth: 2,
                borderColor: dropdownColor,
                borderRadius: 10,
                backgroundColor: 'white',
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5
              }}>
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
        <TouchableOpacity style={[styles.bottomButton, { height: '95%' }]} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}> 
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
