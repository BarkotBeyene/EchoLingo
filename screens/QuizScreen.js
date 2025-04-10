// Import necessary modules and components
import { Text, View, Image, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useEffect, useContext, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../backend/config/firebaseConfig";
import { recordStart, recordStop, getTranscription } from '../voice.js';

export default function QuizScreen({ navigation }) {
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
  const premadeTopics = ["Numbers", "Colors", "Greeting/Introduction", "Days/Months/Seasons", "Family"];
  const [premadeTopic, setPremadeTopic] = useState("Numbers");
  const premadeQuizzes = {
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

  // Function to generate AI-based quiz
  const handleGenerateQuiz = async () => {
    if (quizMode === "AI") {
      try {
        const docRef = doc(db, "Quizzes", quizTopic);
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

    // Handle navigating between questions
    if (transcript.includes("next question")) {
      if (quizMode === "AI" && generatedQuiz.length > 0) {
        if (currentQuestionIndex < generatedQuiz.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          speak(`Next question: ${generatedQuiz[currentQuestionIndex + 1].question}`);
        } else {
          speak("You are already on the last question.");
        }
      } else if (quizMode === "Premade") {
        if (currentQuestionIndex < premadeQuizzes[premadeTopic].length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          speak(`Next question: ${premadeQuizzes[premadeTopic][currentQuestionIndex + 1].question}`);
        } else {
          speak("You are already on the last question.");
        }
      } else {
        speak("No questions available to navigate.");
      }
    }

    if (transcript.includes("previous question")) {
      if (quizMode === "AI" && generatedQuiz.length > 0) {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          speak(`Previous question: ${generatedQuiz[currentQuestionIndex - 1].question}`);
        } else {
          speak("You are already on the first question.");
        }
      } else if (quizMode === "Premade") {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          speak(`Previous question: ${premadeQuizzes[premadeTopic][currentQuestionIndex - 1].question}`);
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
                <Picker.Item label="Greeting/Introduction" value="Greeting/Introduction" />
                <Picker.Item label="Days/Months/Seasons" value="Days/Months/Seasons" />
                <Picker.Item label="Family" value="Family" />
              </Picker>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 35, margin: '1%', backgroundColor: generateColor, borderRadius: 10 }} onPress={handleGenerateQuiz}>
              <Text style={[styles.labelText, { color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}>Generate Quiz</Text>
            </TouchableOpacity>
            {quizMode === "AI" && generatedQuiz.length > 0 && (
              <>
                {generatedQuiz.map((q, index) => (
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
            {/* Premade Quiz */}
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
            {premadeQuizzes[premadeTopic].map((q, index) => (
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

