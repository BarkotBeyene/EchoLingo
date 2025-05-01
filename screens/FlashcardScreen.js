import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
} from "firebase/database";
import { app } from "../backend/config/firebaseConfig";
import { Settings } from "../settings.js";
import { navigate, speak } from "../functions.js";
import createStyles from "../styles.js";

export default function FlashcardComponent({ navigation }) {
  const { fontSize, isGreyscale, isAutoRead } = useContext(Settings);
  const headerStyles = createStyles(fontSize, isGreyscale);

  const message =
    "Now viewing: Flashcards. Create and study flashcards to practice vocabulary. Tap cards to flip between languages. Use navigation buttons to move between cards. Press bottom banner to return to practice screen.";
  const shortMessage = "Flashcards";

  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newSpanish, setNewSpanish] = useState("");
  const [newEnglish, setNewEnglish] = useState("");

  const database = getDatabase(app);

  useEffect(() => {
    if (isAutoRead === "Long") {
      speak(message);
    } else if (isAutoRead === "Short") {
      speak(shortMessage);
    }
  }, []);

  useEffect(() => {
    const flashcardsRef = ref(database, "flashcards");
    const unsubscribe = onValue(
      flashcardsRef,
      (snapshot) => {
        try {
          setLoading(true);
          if (snapshot.exists()) {
            const data = snapshot.val();
            const flashcardsArray = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));
            setFlashcards(flashcardsArray);
            setError(null);
          } else {
            setFlashcards([
              { id: "default1", spanish: "Hola", english: "Hello" },
              { id: "default2", spanish: "Adiós", english: "Goodbye" },
              { id: "default3", spanish: "Gracias", english: "Thank you" },
              { id: "default4", spanish: "Por favor", english: "Please" },
            ]);
          }
        } catch (err) {
          console.error("Error fetching flashcards:", err);
          setError("Failed to load flashcards. Please try again later.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firebase error:", err);
        setError("Failed to connect to database. Please check your connection.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addCard = () => {
    if (newSpanish.trim() === "" || newEnglish.trim() === "") {
      Alert.alert("Error", "Both fields are required.");
      return;
    }
    const flashcardsRef = ref(database, "flashcards");
    push(flashcardsRef, {
      spanish: newSpanish,
      english: newEnglish,
    })
      .then(() => {
        setNewSpanish("");
        setNewEnglish("");
        setAddModalVisible(false);
        Alert.alert("Success", "New card added successfully!");
      })
      .catch((err) => {
        console.error("Error adding card:", err);
        Alert.alert("Error", "Failed to add card. Please try again.");
      });
  };

  const openEditModal = () => {
    if (flashcards.length === 0) return;
    const currentCard = flashcards[index];
    setNewSpanish(currentCard.spanish);
    setNewEnglish(currentCard.english);
    setEditModalVisible(true);
  };

  const updateCard = () => {
    if (newSpanish.trim() === "" || newEnglish.trim() === "") {
      Alert.alert("Error", "Both fields are required.");
      return;
    }
    if (flashcards.length === 0) return;
    const currentCard = flashcards[index];
    if (currentCard.id.startsWith("default")) {
      Alert.alert("Info", "Cannot edit default cards while offline.");
      setEditModalVisible(false);
      return;
    }
    const cardRef = ref(database, `flashcards/${currentCard.id}`);
    update(cardRef, {
      spanish: newSpanish,
      english: newEnglish,
    })
      .then(() => {
        setEditModalVisible(false);
        Alert.alert("Success", "Card updated successfully!");
      })
      .catch((err) => {
        console.error("Error updating card:", err);
        Alert.alert("Error", "Failed to update card. Please try again.");
      });
  };

  const deleteCard = () => {
    if (flashcards.length === 0) return;
    const currentCard = flashcards[index];
    if (currentCard.id.startsWith("default")) {
      Alert.alert("Info", "Cannot delete default cards while offline.");
      return;
    }
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this card?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const cardRef = ref(database, `flashcards/${currentCard.id}`);
            remove(cardRef)
              .then(() => {
                if (index >= flashcards.length - 1) {
                  setIndex(Math.max(0, flashcards.length - 2));
                }
                Alert.alert("Success", "Card deleted successfully!");
              })
              .catch((err) => {
                console.error("Error deleting card:", err);
                Alert.alert("Error", "Failed to delete card. Please try again.");
              });
          },
        },
      ]
    );
  };

  const nextCard = () => {
    setFlipped(false);
    if (flashcards.length > 0) {
      setIndex((index + 1) % flashcards.length);
    }
  };

  const previousCard = () => {
    setFlipped(false);
    if (flashcards.length > 0) {
      setIndex((index - 1 + flashcards.length) % flashcards.length);
    }
  };

  const returnToPractice = () => {
    navigation.navigate("Practice");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#577590" />
        <Text style={styles.loadingText}>Loading flashcards...</Text>
      </View>
    );
  }

  if (error && flashcards.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.returnButton}
          onPress={returnToPractice}
        >
          <Text style={styles.returnButtonText}>Return to Practice</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.infoText}>No flashcards available.</Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>Add New Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.returnButton}
          onPress={returnToPractice}
        >
          <Text style={styles.returnButtonText}>Return to Practice</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = flashcards[index] || { spanish: "", english: "" };

  return (
    <SafeAreaView style={headerStyles.container}>
      <View style={headerStyles.topBanner}>
        <TouchableOpacity
          style={headerStyles.topLeftBannerButton}
          onPress={() => navigate(navigation, "Practice")}
        >
          <Image source={require("../assets/back.png")} style={headerStyles.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => speak(shortMessage)}>
          <Text style={headerStyles.titleText}>Flashcards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={headerStyles.topRightBannerButton}
          onPress={() => speak(message)}
        >
          <Image source={require("../assets/volume.png")} style={headerStyles.icon} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            Using offline data. {error}
          </Text>
        </View>
      )}

      <Text style={styles.counter}>
        Card {index + 1} of {flashcards.length}
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => setFlipped(!flipped)}
      >
        <Text style={styles.cardText}>
          {flipped ? currentCard.english : currentCard.spanish}
        </Text>
        <Text style={styles.tapInstructions}>
          {flipped ? "Tap to see Spanish" : "Tap to see English"}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.navButton} onPress={previousCard}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={nextCard}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.managementButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={openEditModal}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={deleteCard}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.returnButton} onPress={returnToPractice}>
        <Text style={styles.returnButtonText}>Return to Practice</Text>
      </TouchableOpacity>

      {/* Add Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Flashcard</Text>
            
            <Text style={styles.inputLabel}>Spanish</Text>
            <TextInput
              style={styles.input}
              value={newSpanish}
              onChangeText={setNewSpanish}
              placeholder="Enter Spanish word/phrase"
            />
            
            <Text style={styles.inputLabel}>English</Text>
            <TextInput
              style={styles.input}
              value={newEnglish}
              onChangeText={setNewEnglish}
              placeholder="Enter English translation"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]} 
                onPress={addCard}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Flashcard</Text>
            
            <Text style={styles.inputLabel}>Spanish</Text>
            <TextInput
              style={styles.input}
              value={newSpanish}
              onChangeText={setNewSpanish}
              placeholder="Edit Spanish word/phrase"
            />
            
            <Text style={styles.inputLabel}>English</Text>
            <TextInput
              style={styles.input}
              value={newEnglish}
              onChangeText={setNewEnglish}
              placeholder="Edit English translation"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateCard}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingTop: 30,
        justifyContent: 'space-between',
    },            
    centered: {
      justifyContent: 'center',
    },
    counter: {
      fontSize: 16,
      marginBottom: 15,
      color: '#555',
      fontWeight: '500',
    },
    card: {
      backgroundColor: '#f9c74f',
      padding: 40,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 20,
      width: 300,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    },
    cardText: {
      fontSize: 28,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
    },
    tapInstructions: {
      fontSize: 14,
      color: '#555',
      position: 'absolute',
      bottom: 15,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 250,
      marginBottom: 20,
    },
    managementButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 250,
      marginBottom: 20,
    },
    navButton: {
      backgroundColor: '#577590',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      minWidth: 100,
      alignItems: 'center',
    },
    actionButton: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      minWidth: 70,
      alignItems: 'center',
    },
    addButton: {
      backgroundColor: '#2a9d8f',
    },
    editButton: {
      backgroundColor: '#e9c46a',
    },
    deleteButton: {
      backgroundColor: '#e76f51',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
    returnButton: {
      backgroundColor: '#f94144',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 10,
      width: 250,
      alignItems: 'center',
      marginTop: 10,
    },
    returnButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '500',
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: '#555',
    },
    errorText: {
      fontSize: 16,
      color: '#c1121f',
      textAlign: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    infoText: {
      fontSize: 18,
      color: '#555',
      textAlign: 'center',
      marginHorizontal: 20,
      marginBottom: 30,
    },
    errorBanner: {
      backgroundColor: '#ffccd5',
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
      width: '90%',
    },
    errorBannerText: {
      color: '#c1121f',
      textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: '85%',
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 25,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    inputLabel: {
      alignSelf: 'flex-start',
      marginLeft: 5,
      fontSize: 16,
      fontWeight: '500',
      color: '#555',
      marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
        color: '#000',
    },      
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#95a5a6',
      marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#2a9d8f',
      },
      modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
      },
    });
