// Import necessary modules and components
import { Text, View, Image, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useEffect, useContext, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../settings.js';
import { Preferences } from '../screens/PreferencesScreen.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../backend/config/firebaseConfig";
import { recordStart, recordStop, getTranscription } from '../voice.js';

export default function QuizScreen({ navigation }) {
  // Access user settings and apply styles
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage } = useContext(Settings);
  createStyles(fontSize, isGreyscale);

  // Define colors based on greyscale mode
  let dropdownColor = 'red';
  let generateColor = 'green';
  if (isGreyscale === true) {
    dropdownColor = 'darkgrey';
    generateColor = 'grey';
  }

  // Message for screen reader
  const message = "Now viewing: Quiz page. Use the mode selector to choose between AI Generated and Premade quizzes. Press bottom banner to return home. Press the top left banner to use voice commands. Press once to begin recording and once again to stop recording. Say 'help' if stuck. Press top right banner to repeat this message.";
  useEffect(() => { if (isAutoRead) { speak(message); } }, []);

  // State variables for quiz settings and data
  const [quizMode, setQuizMode] = useState("AI");
  const [aiPrompt, setAiPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [questionFormat, setQuestionFormat] = useState('Basic Vocabulary');
  const [quizTopic, setQuizTopic] = useState('Numbers');
  const [quizResult, setQuizResult] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Premade quiz topics and data
  const premadeTopics = ["Numbers", "Colors", "Greetings & Introductions", "Days & Months & Seasons", "Family"];
  const [premadeTopic, setPremadeTopic] = useState("Numbers");

  const allPremadeQuizzes = {
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

  const premadeQuizzes = allPremadeQuizzes[selectedLanguage] || allPremadeQuizzes.Spanish;

  const [userAnswers, setUserAnswers] = useState(Array(5).fill(""));
  const [premadeResult, setPremadeResult] = useState("");

  const numberToStringMappings = {
    Spanish: {
      0: "cero", 1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
      6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
      20: "veinte", 30: "treinta", 40: "cuarenta", 50: "cincuenta",
      60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa", 100: "cien"
    },
    French: {
      0: "zéro", 1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq",
      6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
      20: "vingt", 30: "trente", 40: "quarante", 50: "cinquante",
      60: "soixante", 70: "soixante-dix", 80: "quatre-vingt", 90: "quatre-vingt-dix", 100: "cent"
    },
    German: {
      0: "null", 1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf",
      6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 10: "zehn",
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

  // Function to generate AI-based quiz
  const handleGenerateQuiz = async () => {
    const collectionName = selectedLanguage === "French" ? "Quizzes_French" :
                           selectedLanguage === "German" ? "Quizzes_German" : "Quizzes";
    if (quizMode === "AI") {
      try {
        const docRef = doc(db, collectionName, quizTopic);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const questions = data[questionFormat] || [];
          const answers = data[`${questionFormat} Answers`] || [];

          if (questions.length === 0 || answers.length === 0) {
            const errorMessage = "No questions available for the selected topic and format.";
            setQuizResult(errorMessage);
            speak(errorMessage);
            return;
          }

          // Shuffle questions and answers together
          const shuffledIndices = Array.from({ length: questions.length }, (_, i) => i).sort(() => Math.random() - 0.5);
          const shuffledQuestions = shuffledIndices.map(index => questions[index]);
          const shuffledAnswers = shuffledIndices.map(index => answers[index]);

          const total = Math.min(parseInt(numQuestions), shuffledQuestions.length);
          const selectedQuestions = shuffledQuestions.slice(0, total);
          const selectedAnswers = shuffledAnswers.slice(0, total);

          const generatedQuestions = selectedQuestions.map((question, index) => ({
            question,
            answer: selectedAnswers[index],
          }));

          setGeneratedQuiz(generatedQuestions);
          setUserAnswers(Array(generatedQuestions.length).fill(""));
          setQuizResult("");

          let combinedText = "Here are your questions: ";
          generatedQuestions.forEach((q, index) => {
            combinedText += `Question ${index + 1}: ${q.question}. `;
          });
          speak(combinedText);
        } else {
          const errorMessage = "Failed to fetch quiz data. Please check your settings.";
          setQuizResult(errorMessage);
          speak(errorMessage);
        }
      } catch (error) {
        const errorMessage = "An error occurred while fetching quiz data.";
        setQuizResult(errorMessage);
        speak(errorMessage);
        console.error(error);
      }
    }
  };

  // Function to submit answers for AI-generated quiz
  const handleSubmitGeneratedQuiz = () => {
    let correctCount = 0;
    let incorrectQuestions = [];

    generatedQuiz.forEach((q, index) => {
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

    let resultsText = `You got ${correctCount} out of ${generatedQuiz.length} correct.\n\n`;
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

    setQuizResult(resultsText);
    speak(resultsText);
  };

  // Function to submit answers for premade quiz
  const handlePremadeSubmit = () => {
    const questions = premadeQuizzes[premadeTopic];
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
    const questions = premadeQuizzes[premadeTopic];
    let combinedText = "";
    questions.forEach((q, index) => {
      combinedText += `Question ${index + 1}: ${q.question}. `;
    });
    speak(combinedText);
  };

  // Voice recording and transcription handling
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLanguage, setRecordingLanguage] = useState("english");

  const handleMicPress = async () => {
    const recordingLanguageMap = { Spanish: "spanish", French: "french", German: "german" };
    const languageCode = recordingLanguageMap[selectedLanguage] || "english";

    if (isRecording) {
      // Stop recording and process voice input
      const uri = await recordStop();
      setIsRecording(false);

      if (uri) {
        let transcript = (await getTranscription(uri, languageCode)).toLowerCase();
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
            "Say 'answer' to switch to the selected language and provide an answer starting with the appropriate trigger word."
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
  
    // Determine the current question format
    const currentQuestionFormat = questionFormat;
  
    // Handle mode switching
    if (transcript.includes("mode")) {
      if (transcript.includes("generated")) {
        setQuizMode("AI");
        speak("Switched to generated mode.");
      } else if (transcript.includes("premade")) {
        setQuizMode("Premade");
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
      ["Basic Vocabulary", "Grammar", "Listening Comprehension", "Translating"].forEach((format) => {
        if (transcript.includes(format.toLowerCase())) {
          setQuestionFormat(format);
          speak(`Question format ${format} selected.`);
        }
      });
    }
  
    // Handle quiz topic selection
    if (transcript.includes("quiz topic")) {
      premadeTopics.forEach((topic) => {
        if (transcript.includes(topic.toLowerCase())) {
          setQuizTopic(topic);
          speak(`Quiz topic ${topic} selected.`);
        }
      });
    }
  
    // Handle generating the quiz
    if (transcript.includes("generate")) {
      handleGenerateQuiz();
      speak("Generating the quiz.");
    }
  
    // Handle reading questions aloud
    if (transcript.includes("read questions")) {
      if (quizMode === "AI" && generatedQuiz.length > 0) {
        let combinedText = "Here are your questions: ";
        generatedQuiz.forEach((q, index) => {
          combinedText += `Question ${index + 1}: ${q.question}. `;
        });
        speak(combinedText);
      } else if (quizMode === "Premade") {
        const questions = premadeQuizzes[premadeTopic];
        let combinedText = "Here are your questions: ";
        questions.forEach((q, index) => {
          combinedText += `Question ${index + 1}: ${q.question}. `;
        });
        speak(combinedText);
      } else {
        speak("No questions available to read.");
      }
    }
  
    // Handle inputting answers
    if (transcript.includes("answer")) {
      const startWords = { Spanish: "inicio", French: "commencer", German: "anfangen" };
      const triggerWord = startWords[selectedLanguage] || "start";

      speak(`Recording language switched to ${selectedLanguage}. Please say '${triggerWord}' followed by your answer.`);
      setRecordingLanguage(selectedLanguage.toLowerCase()); // Switch recording language to selected language

      if (transcript.includes(triggerWord)) {
        const match = transcript.match(new RegExp(`${triggerWord} (.+)`));
        if (match && match[1]) {
          const answer = match[1].trim();
          const newAnswers = [...userAnswers];
          newAnswers[currentQuestionIndex] = answer; // Update the answer for the current question
          setUserAnswers(newAnswers);
          speak(`Answer recorded for question ${currentQuestionIndex + 1}.`);
        } else {
          speak(`Please specify your answer after saying '${triggerWord}'.`);
        }
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { alignItems: 'stretch' }]}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.titleText}>Quiz</Text>
        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topLeftBannerButton} onPress={handleMicPress}>
          <Image style={{ width: 65, height: 65 }} source={require('../assets/mic.png')} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ width: '100%', paddingBottom: 100, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
        {/* Mode Selector */}
        <TouchableOpacity style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 10, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
          <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Select Mode</Text>
          <Picker
            selectedValue={quizMode}
            onValueChange={(itemValue) => { 
              setQuizMode(itemValue); 
              setQuizResult("");
              setPremadeResult("");
            }}
            style={[styles.picker, { color: 'white' }]}
          >
            <Picker.Item label="Generated" value="AI" />
            <Picker.Item label="Premade" value="Premade" />
          </Picker>
        </TouchableOpacity>
        {quizMode === "AI" ? (
          <>
            {/* Generated Quiz */}
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
            <TouchableOpacity style={[styles.dropdownContainer, { paddingHorizontal: 16, paddingVertical: 10, margin: '1%', backgroundColor: dropdownColor, borderRadius: 10 }]}>
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18 }]}>Quiz Topics</Text>
              <Picker
                selectedValue={quizTopic}
                onValueChange={(itemValue) => setQuizTopic(itemValue)}
                style={[styles.picker, { color: 'white' }]}
              >
                <Picker.Item label="Numbers" value="Numbers" />
                <Picker.Item label="Colors" value="Colors" />
                <Picker.Item label="Greetings & Introductions" value="Greetings & Introductions" />
                <Picker.Item label="Days & Months & Seasons" value="Days & Months & Seasons" />
                <Picker.Item label="Family" value="Family" />
              </Picker>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: generateColor, borderRadius: 10 }} onPress={handleGenerateQuiz}>
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Generate Quiz</Text>
            </TouchableOpacity>
            {quizMode === "AI" && generatedQuiz.length > 0 && (
              <>
                {generatedQuiz.map((q, index) => (
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
                  onPress={handleSubmitGeneratedQuiz}
                >
                  <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Submit Quiz</Text>
                </TouchableOpacity>
                {quizResult !== "" && (
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 16, color: 'black', textAlign: 'left' }}>{quizResult}</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Premade Quiz Topic Selector */}
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
            {premadeQuizzes[premadeTopic].map((q, index) => (
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
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Submit Quiz</Text>
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

