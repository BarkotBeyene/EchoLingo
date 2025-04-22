import React, { useContext, useEffect, useState } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Settings } from '../settings';
import createStyles from '../styles';
import { navigate, speak } from '../functions';
import { grammarLessonsFR } from '../data/grammarDataFR';
import { grammarLessonsES } from '../data/grammarDataES';

export default function GrammarScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage } = useContext(Settings);

  const fontSizeMapping = {
    Small: 12,
    Medium: 14,
    Large: 16,
    Large2: 18,
  };
  const numericFontSize = typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 16 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: Grammar. Explore grammar explanations with examples. Press the bottom button to return home.';

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);

  useEffect(() => {
    if (isAutoRead) speak(message);
  }, []);

  const toggleCategory = (index, title) => {
    const newIndex = expandedCategory === index ? null : index;
    setExpandedCategory(newIndex);
    setExpandedLesson(null);
    if (isAutoRead && newIndex !== null) speak(`Now viewing ${title}`);
  };

  const toggleLesson = (index, title, explanation, example) => {
    const newIndex = expandedLesson === index ? null : index;
    setExpandedLesson(newIndex);
    if (isAutoRead && newIndex !== null) {
      const contentToRead = `${title}. Explanation: ${explanation}. Example: ${example}`;
      speak(contentToRead);
    }
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

        <Text style={styles.titleText}>Grammar</Text>

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
                          onPress={() => toggleLesson(lessonIndex, lesson.title, lesson.explanation, lesson.example)}
                          style={{ backgroundColor: '#FFF0C1', padding: 12, borderRadius: 10, marginHorizontal: 6 }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={[styles.buttonText, { fontSize: numericFontSize + 2, fontWeight: 'bold', color: 'black', flex: 1 }]}>
                              🔽 {lesson.title}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                const contentToRead = `${lesson.title}. Explanation: ${lesson.explanation}. Example: ${lesson.example}`;
                                speak(contentToRead);
                              }}
                            >
                              <Image
                                source={require('../assets/volume.png')}
                                style={{ width: 22, height: 22, marginLeft: 10 }}
                              />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>

                        {expandedLesson === lessonIndex && (
                          <View style={{ marginTop: 4, paddingHorizontal: 12 }}>
                            <Text style={[styles.learnScreen_dropdownText, { color: 'black' }]}>
                              <Text style={{ fontWeight: 'bold' }}>Explanation:</Text> {lesson.explanation}
                            </Text>
                            <Text style={[styles.learnScreen_dropdownText, { color: 'black' }]}>
                              <Text style={{ fontWeight: 'bold' }}>Example:</Text> {lesson.example}
                            </Text>
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
      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => navigate(navigation, 'Home')}
      >
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}