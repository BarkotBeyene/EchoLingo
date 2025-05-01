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
import { navigate, speak, sound } from '../functions';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { storage, db } from "../backend/config/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, getDocs } from "firebase/firestore";
import { WebView } from 'react-native-webview';

export default function TextMaterialsScreen({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead, selectedLanguage, isSound } = useContext(Settings);

  const fontSizeMapping = {
    Small: 14,
    Medium: 16,
    Large: 18,
    Large2: 20,
  };
  const numericFontSize = typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 18 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: Text Materials.';
  const shortMessage = "Text Materials";

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [exploreMaterials, setExploreMaterials] = useState([]);
  const [pdfToView, setPdfToView] = useState(null);

  useEffect(() => {
    if (isAutoRead === "Long") {speak(message);} else if (isAutoRead === "Short") {speak(shortMessage);}
    fetchExploreMaterials();
  }, []);

  const fetchExploreMaterials = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Default_text_materials'));
      const materials = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.language === selectedLanguage) { 
          materials.push({ id: doc.id, ...data });
        }
      });
  
      setExploreMaterials(materials);
    } catch (error) {
      console.error("Error fetching explore materials:", error);
    }
  };
  
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.type === 'success') {
      setMaterialFile(result);
    }
  };

  const handleUpload = async () => {
    if (materialTitle.trim() && materialFile) {
      try {
        const response = await fetch(materialFile.uri);
        const blob = await response.blob();

        const fileRef = ref(storage, `materials/${Date.now()}_${materialFile.name}`);
        const uploadTask = uploadBytesResumable(fileRef, blob);

        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Upload error:', error);
            speak('Upload failed.');
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            setSavedMaterials([
              ...savedMaterials,
              {
                title: materialTitle,
                description: materialDescription || 'No description provided',
                language: selectedLanguage,
                file: {
                  name: materialFile.name,
                  url: downloadURL,
                },
              },
            ]);

            setMaterialTitle('');
            setMaterialDescription('');
            setMaterialFile(null);
            setUploadModalVisible(false);
            speak('Material uploaded successfully.');
          }
        );
      } catch (error) {
        console.error('Upload error:', error);
        speak('Something went wrong while uploading.');
      }
    } else {
      speak('Please provide a title and select a file.');
    }
  };
  
  useEffect(() => {
    if (pdfToView) {
      speak("Tap the top of the screen to exit the file.");
    }
  }, [pdfToView]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff8f0' }]}>
      {/* PDF Viewer Modal */}
      {pdfToView && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setPdfToView(null)}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => setPdfToView(null)}
              style={{ padding: 12, backgroundColor: '#B22222', alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>Close PDF</Text>
            </TouchableOpacity>
      
            <WebView
              source={{
                uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfToView)}`
              }}
              style={{ flex: 1 }}
              startInLoadingState
            />

          </SafeAreaView>
        </Modal>
      )}

      {/* Top Banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.topLeftBannerButton} onPress={() => navigate(navigation, 'Learn')}>
          <Image source={require('../assets/back.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={styles.titleText}>Text Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topRightBannerButton} onPress={() => speak(message)}>
          <Image source={require('../assets/volume.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.learnScreen_scrollContent}>
        <View style={[styles.learnScreen_listContainer, {
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
        }]}>

          {/* Explore Section */}
          <Text style={[styles.sectionTitle, { color: '#B22222', fontSize: numericFontSize + 6, marginBottom: 10 }]}>
            <MaterialIcons name="explore" size={23} color="#B22222" /> Explore Text Materials
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {exploreMaterials.length > 0 ? (
              exploreMaterials.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  onPress={() => setPdfToView(item.url)}
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
                  <FontAwesome5 name="book-open" size={28} color="#B22222" />
                  <Text
                    style={{
                      fontSize: numericFontSize + 3,
                      marginTop: 10,
                      color: '#8B0000',
                      textAlign: 'center',
                      paddingHorizontal: 4,
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ fontSize: numericFontSize, color: 'gray', marginLeft: 10 }}>
                No explore materials yet.
              </Text>
            )}
          </ScrollView>

           <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 16 }} />

          {/* Saved Materials */}
          <Text style={[styles.sectionTitle, { color: '#8B0000', fontSize: numericFontSize + 6, marginBottom: 10 }]}>
            <FontAwesome5 name="bookmark" size={20} color="#8B0000" /> Saved Materials
          </Text>
          {savedMaterials.length > 0 ? (
            savedMaterials.map((material, index) => (
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
                  <FontAwesome5 name="file-alt" size={16} /> {material.title}
                </Text>
                <Text style={{ fontSize: numericFontSize + 1, marginTop: 4 }}>{material.description}</Text>
                {material.file?.url && (
                  <TouchableOpacity
                    onPress={() => setPdfToView(material.file.url)}
                    style={{ marginTop: 6 }}
                  >
                    <Text style={{ color: '#1E90FF', fontSize: numericFontSize }}>
                      🔗 Open Material
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={{ fontSize: numericFontSize + 2, color: '#B22222', marginBottom: 16 }}>
              No saved materials yet.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Upload & Return Buttons */}
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
        <Text style={[styles.buttonText, { color: '#fff', fontSize: numericFontSize + 5 }]}>
          Upload New Material
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bottomButton} onPress={() => {sound(require("../assets/return.wav"), isSound); navigate(navigation, "Home")}}>
        <Text style={[styles.buttonText, { fontSize: numericFontSize + 14, color: '#fff' }]}>
          Return to Home
        </Text>
      </TouchableOpacity>

      {/* Upload Modal */}
      <Modal visible={uploadModalVisible} animationType="slide" transparent>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 12,
            width: '85%',
            borderColor: '#FFD700',
            borderWidth: 2,
          }}>
            <Text style={{
              fontSize: numericFontSize + 4,
              fontWeight: 'bold',
              color: '#B22222',
              marginBottom: 10
            }}>
              Upload Material
            </Text>

            <TextInput
              placeholder="Material Title"
              value={materialTitle}
              onChangeText={setMaterialTitle}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                fontSize: numericFontSize
              }}
            />

            <TextInput
              placeholder="Description"
              value={materialDescription}
              onChangeText={setMaterialDescription}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                fontSize: numericFontSize
              }}
            />

            <TouchableOpacity
              onPress={pickFile}
              style={{
                backgroundColor: '#FFD700',
                padding: 10,
                borderRadius: 5,
                marginBottom: 10
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600' }}>
                {materialFile ? materialFile.name : 'Select a File'}
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
                  marginRight: 5
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
                  marginLeft: 5
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
