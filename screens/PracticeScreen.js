import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useEffect, useContext } from 'react';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak, sound } from '../functions.js';

export default function PracticeScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, isSound } = useContext(Settings);

  createStyles(fontSize, isGreyscale);
  
  message = "Now viewing: Practice. Press top left to view quizzes. Press top right to view exams. Press bottom left to chat with AI. Press bottom banner to return home. Press top right banner to repeat this message.";
  const shortMessage = "Practice";
  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, "Home")}>
          <Image source={require('../assets/back.png')} />
        </TouchableOpacity>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Quiz")}>
          <Text style={styles.buttonText}>Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Exam")}>
          <Text style={styles.buttonText}>Exam</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "AI Chat")}>
          <Text style={styles.buttonText}>AI Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.gridButton4} onPress={() => navigate(navigation, "Flashcards")}>
          <Text style={styles.buttonText}>Flashcards</Text>
        </TouchableOpacity>

      </View>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
