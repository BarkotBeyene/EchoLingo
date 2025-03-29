import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Settings } from '../settings';
import createStyles from '../styles';
import { navigate, speak } from '../functions';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export default function VideoMaterialsScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);

  const fontSizeMapping = {
    Small: 14,
    Medium: 16,
    Large: 18,
    Large2: 20,
  };
  const numericFontSize = typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 18 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: Video Materials.';

  useEffect(() => {
    if (isAutoRead) speak(message);
  }, []);

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [savedVideos, setSavedVideos] = useState([]);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
    if (result.type === 'success') {
      setVideoFile(result);
    }
  };

  const handleUpload = () => {
    if (videoTitle.trim() && videoFile) {
      setSavedVideos([
        ...savedVideos,
        {
          title: videoTitle,
          description: videoDescription || 'No description provided',
          file: videoFile,
        },
      ]);
      setVideoTitle('');
      setVideoDescription('');
      setVideoFile(null);
      setUploadModalVisible(false);
      speak('Video uploaded successfully.');
    } else {
      speak('Please provide a title and select a video.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff8f0' }]}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity
          style={styles.topLeftBannerButton}
          onPress={() => navigate(navigation, 'Learn')}
        >
          <Image source={require('../assets/back.png')} style={styles.icon} />
        </TouchableOpacity>

        <Text style={[styles.titleText, { fontSize: numericFontSize + 10, color: '#B22222' }]}>
          Video Materials
        </Text>

        <TouchableOpacity
          style={styles.topRightBannerButton}
          onPress={() => speak(message)}
        >
          <Image source={require('../assets/volume.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.learnScreen_scrollContent}>
        <View
          style={{
            backgroundColor: '#fff5e6',
            padding: 16,
            borderRadius: 12,
            marginHorizontal: 12,
            marginTop: 10,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Explore Section */}
          <Text style={{ color: '#B22222', fontSize: numericFontSize + 6, marginBottom: 10 }}>
            <MaterialIcons name="explore" size={23} color="#B22222" /> Explore Video Materials
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {[1, 2, 3].map((num) => (
              <View
                key={num}
                style={{
                  width: 180,
                  height: 150,
                  backgroundColor: '#FFD700',
                  marginRight: 12,
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <FontAwesome5 name="video" size={28} color="#B22222" />
                <Text style={{ fontSize: numericFontSize + 3, marginTop: 10, color: '#8B0000' }}>
                  Sample Video {num}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 16 }} />

          <Text style={{ color: '#8B0000', fontSize: numericFontSize + 6, marginBottom: 10 }}>
            <FontAwesome5 name="bookmark" size={20} color="#8B0000" /> Saved Videos
          </Text>

          {savedVideos.length > 0 ? (
            savedVideos.map((video, index) => (
              <View
                key={index}
                style={{
                  padding: 12,
                  backgroundColor: '#FFF5F5',
                  borderRadius: 10,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#FFCDD2',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: numericFontSize + 3, fontWeight: 'bold', color: '#B22222' }}>
                  <FontAwesome5 name="file-video" size={16} /> {video.title}
                </Text>
                <Text style={{ fontSize: numericFontSize + 1, marginTop: 4 }}>{video.description}</Text>
                {video.file && (
                  <Text style={{ fontSize: numericFontSize, color: 'gray', marginTop: 2 }}>
                    🎥 {video.file.name}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={{ fontSize: numericFontSize + 2, color: '#B22222', marginBottom: 16 }}>
              No saved videos yet.
            </Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={{
          backgroundColor: '#FF4500',
          borderRadius: 10,
          marginHorizontal: 10,
          marginBottom: 6,
          paddingVertical: 16,
          paddingHorizontal: 70,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 3,
        }}
        onPress={() => setUploadModalVisible(true)}
      >
        <Text style={[styles.buttonText, { color: '#fff', fontSize: numericFontSize + 5 }]}>Upload New Video</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.bottomButton, { backgroundColor: '#B22222' }]}
        onPress={() => navigate(navigation, 'Learn')}
      >
        <Text style={[styles.buttonText, { fontSize: numericFontSize + 14, color: '#fff' }]}>Return to Learn</Text>
      </TouchableOpacity>

      <Modal visible={uploadModalVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 12,
              width: '85%',
              borderColor: '#FFD700',
              borderWidth: 2,
            }}
          >
            <Text
              style={{
                fontSize: numericFontSize + 4,
                fontWeight: 'bold',
                color: '#B22222',
                marginBottom: 10,
              }}
            >
              Upload Video Material
            </Text>

            <TextInput
              placeholder="Video Title"
              value={videoTitle}
              onChangeText={setVideoTitle}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                fontSize: numericFontSize,
              }}
            />

            <TextInput
              placeholder="Description"
              value={videoDescription}
              onChangeText={setVideoDescription}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                fontSize: numericFontSize,
              }}
            />

            <TouchableOpacity
              onPress={pickVideo}
              style={{
                backgroundColor: '#FFD700',
                padding: 10,
                borderRadius: 5,
                marginBottom: 10,
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600' }}>
                {videoFile ? videoFile.name : 'Select a Video'}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={handleUpload}
                style={{
                  backgroundColor: '#34C759',
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 5,
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Upload</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUploadModalVisible(false)}
                style={{
                  backgroundColor: '#FF3B30',
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginLeft: 5,
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
