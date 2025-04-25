import React, { useContext, useEffect, useState } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Settings } from '../settings';
import createStyles from '../styles';
import { navigate, speak, sound } from '../functions';
import { grammarLessonsFR } from '../data/grammarDataFR';
import { grammarLessonsES } from '../data/grammarDataES';

export default function GrammarScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage, isSound } = useContext(Settings);

  const fontSizeMapping = {
    Small: 12,
    Medium: 14,
    Large: 16,
    Large2: 18,
  };
  const numericFontSize = typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 16 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: Grammar. Explore grammar explanations with examples. Press the bottom button to return home.';
  const shortMessage = "Grammar";

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);

  useEffect(() => { if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);} }, []);

  const toggleCategory = (index, title) => {
    const newIndex = expandedCategory === index ? null : index;
    setExpandedCategory(newIndex);
    setExpandedLesson(null);
    if (isAutoRead && newIndex !== null) speak(`Now viewing ${title}`);
  };

  const toggleLesson = (index, title) => {
    const newIndex = expandedLesson === index ? null : index;
    setExpandedLesson(newIndex);
    if (isAutoRead && newIndex !== null) speak(`Now viewing ${title}`);
  };

  const grammarLessons = selectedLanguage === 'French' ? grammarLessonsFR
                        : selectedLanguage === 'Spanish' ? grammarLessonsES
                        : [];

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
          <Text style={styles.titleText}>Grammar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topRightBannerButton}
          onPress={() => speak(message)}
        >
          <Image source={require('../assets/volume.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Grammar Content */}
      <ScrollView contentContainerStyle={styles.learnScreen_scrollContent}>
        <View style={styles.learnScreen_listContainer}>
          {Array.isArray(grammarLessons) && grammarLessons.length > 0 ? (
            grammarLessons.map((category, catIndex) => (
              <View key={catIndex} style={{ marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => toggleCategory(catIndex, category.topic)}
                  style={{
                    backgroundColor: '#FFD700',
                    borderRadius: 12,
                    padding: 16,
                    marginVertical: 6,
                  }}
                >
                  <Text style={[styles.buttonText, { fontSize: numericFontSize + 4, color: 'black', textAlign: 'center' }]}>📂 {category.topic}</Text>
                </TouchableOpacity>

                {expandedCategory === catIndex && (
                  <View style={{ marginTop: 6 }}>
                    {category.lessons.map((lesson, lessonIndex) => (
                      <View key={lessonIndex} style={{ marginBottom: 10 }}>
                        <TouchableOpacity
                          onPress={() => toggleLesson(lessonIndex, lesson.title)}
                          style={{ backgroundColor: '#FFF0C1', padding: 12, borderRadius: 10, marginHorizontal: 6 }}
                        >
                          <Text style={[styles.buttonText, { fontSize: numericFontSize + 2, fontWeight: 'bold', color: 'black' }]}>🔽 {lesson.title}</Text>
                        </TouchableOpacity>

                        {expandedLesson === lessonIndex && (
                          <View style={{ marginTop: 4, paddingHorizontal: 12 }}>
                            <Text style={[styles.learnScreen_dropdownText, { color: 'black' }]}><Text style={{ fontWeight: 'bold' }}>Explanation:</Text> {lesson.explanation}</Text>
                            <Text style={[styles.learnScreen_dropdownText, { color: 'black' }]}><Text style={{ fontWeight: 'bold' }}>Example:</Text> {lesson.example}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.learnScreen_dropdownText, { color: 'black', textAlign: 'center' }]}>Grammar lessons coming soon for {selectedLanguage}.</Text>
          )}
        </View>
      </ScrollView>

      {/* Return Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}>
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}