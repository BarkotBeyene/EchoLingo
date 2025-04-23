import React, { useEffect, useContext, useState } from 'react';
import {
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../settings.js';
import createStyles from '../styles.js';
import { navigate, speak } from '../functions.js';
import * as FileSystem from 'expo-file-system';
import { recordStart, recordStop, getTranscription } from '../voice.js';
import { db } from '../backend/config/firebaseConfig'
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

const SCREEN_WIDTH = Dimensions.get('window').width;

// visual update complete
const noteStyles = StyleSheet.create({
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    padding: 10,
    backgroundColor: '#e6f0ff',
    borderRadius: 8,
    overflow: 'hidden',
    color: '#007AFF',
  },
  deleteButtonText: {
    backgroundColor: '#ffe6e6',
    color: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
}
);

export default function MyNotesScreen({ navigation }){ 
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  const auth = getAuth();
  const uid = auth.currentUser.uid;

  const fontSizeMapping = {
    Small: 12,
    Medium: 14,
    Large: 16,
    Large2: 18,
  };
  const numericFontSize =
    typeof fontSize === 'string' ? fontSizeMapping[fontSize] || 16 : fontSize;
  const styles = createStyles(numericFontSize, isGreyscale);

  const message = 'Now viewing: My Notes.';
  useEffect(() => {
    if (isAutoRead) speak(message);
  }, []);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('');
  const [noteTranscript, setNoteTranscript] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('english');
  const [editIndex, setEditIndex] = useState(null);


  useEffect(() => {
    const fetchNotes = async () => {
      try {
        // build a query for only this user’s notes
        const q = query(
          collection(db, 'notes'),
          where('userId', '==', uid)
        );
        const querySnapshot = await getDocs(q);

        const notes = [];
        querySnapshot.forEach(docSnap => {
          notes.push({ id: docSnap.id, ...docSnap.data() });
        });

        setSavedNotes(notes);
      } catch (e) {
        console.error('Error loading notes from Firestore:', e);
        speak('Failed to load saved notes.');
      }
    };

    fetchNotes();
  }, [uid]);

const openNoteModal = (index = null) => {
  if (index !== null) {
    const note = savedNotes[index];
    setNoteTitle(note.title);
    setNoteCategory(note.category);
    setNoteTranscript(note.transcript);
    setEditIndex(index);
  } else {
    setNoteTitle('');
    setNoteCategory('');
    setNoteTranscript('');
    setEditIndex(null);
  }
  setNoteModalVisible(true);
  speak('You are creating or editing a note.');
};

const handleRecord = async () => {
  if (!isRecording) {
    const started = await recordStart();
    if (started) {
      setIsRecording(true);
      speak('Recording started. Please speak your note.');
    }
  } else {
    const uri = await recordStop();
    setIsRecording(false);
    speak('Recording stopped. Transcribing...');

    try {
      const transcription = await getTranscription(uri, language);
      console.log("📡 Raw Google API response:", JSON.stringify(transcription, null, 2));
      console.log("📼 URI:", uri);
      console.log("📝 Transcription:", transcription);

      if (transcription) {
        setNoteTranscript(prev => prev + ' ' + transcription.toLowerCase());
        speak('Transcription complete.');
      } else {
        speak('Sorry, transcription returned empty.');
      }
    } catch (e) {
      console.error("⚠️ Transcription error:", e);
      speak('Transcription failed due to an error.');
    }
  }
};
const handleSaveNote = async () => {
  if (!noteTranscript.trim() && !noteTitle.trim()) {
    speak('Please add something to your note before saving.');
    return;
  }

  if (editIndex !== null) {

    const updatedNotes = [...savedNotes];
    updatedNotes[editIndex] = {
      ...updatedNotes[editIndex],
      title: noteTitle,
      category: noteCategory,
      transcript: noteTranscript,
      userId: uid,
    };
    setSavedNotes(updatedNotes);
    speak('Note updated locally.');
  } else {
    const fileName = `note_${Date.now()}.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, noteTranscript, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const newNote = {
      title: noteTitle || 'Untitled',
      category: noteCategory || 'General',
      transcript: noteTranscript,
      fileUri: fileUri,
      timestamp: new Date().toISOString(),
      userId: uid,
    };
    try {
      const docRef = await addDoc(collection(db, 'notes'), newNote);
      newNote.id = docRef.id;
      setSavedNotes([...savedNotes, newNote]);
      speak('Note saved to Firestore.');
    } catch (e) {
      console.error('Firestore save error:', e);
      speak('Failed to save note.');
    }
  }

  setNoteTitle('');
  setNoteCategory('');
  setNoteTranscript('');
  setEditIndex(null);
  setNoteModalVisible(false);
};


const handleDeleteNote = (index) => {
  const noteToDelete = savedNotes[index];
  Alert.alert(
    'Delete Note',
    `Are you sure you want to delete "${noteToDelete.title}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (noteToDelete.id) {
              await deleteDoc(doc(db, 'notes', noteToDelete.id));
            }
            const updatedNotes = [...savedNotes];
            updatedNotes.splice(index, 1);
            setSavedNotes(updatedNotes);
            speak('Note deleted.');
          } catch (e) {
            console.error('Error deleting note from Firestore:', e);
            speak('Failed to delete note.');
          }
        },
      },
    ]
  );
};

const handleCancel = async () => {
  if (isRecording) {
    await recordStop();
    setIsRecording(false);
  }
  setNoteTitle('');
  setNoteCategory('');
  setNoteTranscript('');
  setNoteModalVisible(false);
  setEditIndex(null);
  speak('Note creation cancelled.');
}
;


return(
  <SafeAreaView style={styles.container}>
    <View style={styles.topBanner}>
      <TouchableOpacity
        style={styles.topLeftBannerButton}
        onPress={() => navigate(navigation, 'Learn')}
      >
        <Image source={require('../assets/back.png')} style={styles.icon} />
      </TouchableOpacity>
      <Text style={styles.titleText}>My Notes</Text>
      <TouchableOpacity
        style={styles.topRightBannerButton}
        onPress={() => speak(message)}
      >
        <Image source={require('../assets/volume.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>

    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
      <TouchableOpacity
        style={styles.learnScreen_listItem}
        onPress={() => openNoteModal()}
      >
        <Text style={styles.buttonText}>+ Create a Note</Text>
      </TouchableOpacity>

      {savedNotes.length > 0 ? (
        savedNotes.map((note, index) => (
          <View key={index} style={noteStyles.noteCard}>
            <Text style={styles.titleText}>{note.title}</Text>
            <Text style={{ color: '#555', marginBottom: 6 }}>{note.category}</Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>{note.transcript}</Text>

            <View style={noteStyles.noteActions}>
              <TouchableOpacity
                onPress={async () => {
                  const text = await FileSystem.readAsStringAsync(note.fileUri, {
                    encoding: FileSystem.EncodingType.UTF8,
                  });
                  speak(text);
                }}
              >
                <Text style={noteStyles.actionButtonText}>🔊 Play</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openNoteModal(index)}>
                <Text style={noteStyles.actionButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteNote(index)}>
                <Text style={[noteStyles.actionButtonText, noteStyles.deleteButtonText]}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={{ color: 'black', fontSize: 16, textAlign: 'center', marginTop: 20 }}>
          No notes saved yet.
        </Text>
      )}
    </ScrollView>

    <TouchableOpacity
      style={styles.bottomButton}
      onPress={() => navigate(navigation, 'Learn')}
    >
      <Text style={styles.buttonText}>Return to Learn</Text>
    </TouchableOpacity>

    {/* Updated Modal */}
    <Modal
      visible={noteModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setNoteModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                paddingHorizontal: 16,
                paddingBottom: 30,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={noteStyles.modalContent}>
                <Text style={styles.titleText}>{editIndex !== null ? 'Edit Note' : 'Create Note'}</Text>
                <TextInput
                  style={noteStyles.input}
                  placeholder="Note Title"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />
                <TextInput
                  style={noteStyles.input}
                  placeholder="Note Category"
                  value={noteCategory}
                  onChangeText={setNoteCategory}
                />
                <TextInput
                  style={[noteStyles.input, { height: 100 }]}
                  placeholder="Type or record your note here..."
                  value={noteTranscript}
                  onChangeText={setNoteTranscript}
                  multiline={true}
                />

                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.buttonText}>Choose Language for Transcription:</Text>
                  <View style={{
                    borderWidth: 1,
                    borderColor: '#007AFF',
                    borderRadius: 8,
                    marginTop: 4,
                  }}>
                    <Picker
                      selectedValue={language}
                      onValueChange={(itemValue) => setLanguage(itemValue)}
                      mode="dropdown"
                      dropdownIconColor="#007AFF"
                    >
                      <Picker.Item label="English" value="english" />
                      <Picker.Item label="Spanish" value="spanish" />
                      <Picker.Item label="French" value="french" />
                    </Picker>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    noteStyles.recordButton,
                    pressed && { backgroundColor: '#005BBB' }
                  ]}
                  onPress={handleRecord}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    {isRecording ? 'Stop & Transcribe' : 'Start Recording'}
                  </Text>
                </Pressable>

                <View style={noteStyles.modalButtonRow}>
                  <Pressable
                    style={({ pressed }) => [
                      noteStyles.saveButton,
                      pressed && { backgroundColor: '#28A745' }
                    ]}
                    onPress={handleSaveNote}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Save Note</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      noteStyles.cancelButton,
                      pressed && { backgroundColor: '#CC2E2E' }
                    ]}
                    onPress={handleCancel}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  </SafeAreaView>
);
}