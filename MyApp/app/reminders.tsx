import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  registerForPushNotificationsAsync, 
  scheduleReminderNotification 
} from '../utils/notifications';

const AddReminderForm = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    reminderType: "",
    presentationType: "",
    date: "",
    time: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const baseUrl = "http://192.168.0.108:8000";

  // Initialize notifications when component mounts
  useEffect(() => {
    const initNotifications = async () => {
      await registerForPushNotificationsAsync();
    };
    initNotifications();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "reminderType" && value !== "presentation"
        ? { presentationType: "" }
        : {}),
    }));
  };

  // Validate if the selected date and time is in the future
  const isValidFutureDateTime = (date: string, time: string) => {
    if (!date || !time) return false;

    const [year, month, day] = date.split('-');
    const timeStr = time;
    
    let hours, minutes;
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [timeOnly, period] = timeStr.split(' ');
      const [h, m] = timeOnly.split(':');
      hours = parseInt(h);
      minutes = parseInt(m);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      const [h, m] = timeStr.split(':');
      hours = parseInt(h);
      minutes = parseInt(m);
    }
    
    const selectedDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      hours,
      minutes
    );

    return selectedDateTime > new Date();
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.reminderType || !formData.date || !formData.time) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }
    if (
      formData.reminderType === "presentation" &&
      !formData.presentationType
    ) {
      Alert.alert("Validation Error", "Please select presentation type");
      return;
    }

    // Check if date and time is in the future
    if (!isValidFutureDateTime(formData.date, formData.time)) {
      Alert.alert(
        "Invalid Date/Time", 
        "Please select a future date and time for the reminder"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Error", "No token found. Please login again.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        reminder_type: formData.reminderType.toUpperCase(),
        presentation_type: formData.presentationType || "",
        due_date: formData.date,
        due_time: formData.time,
      };

      console.log("Sending payload:", payload);

      const response = await fetch(`${baseUrl}/api/addReminder/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Create reminder object for notification scheduling
        const newReminder = {
          id: responseData.id || Date.now(), // Use returned ID or fallback
          reminder_type: formData.reminderType.toUpperCase(),
          presentation_type: formData.presentationType,
          due_date: formData.date,
          due_time: formData.time,
        };

        console.log("Reminder saved, scheduling notification for:", newReminder);

        // Schedule notification for the new reminder
        const notificationId = await scheduleReminderNotification(newReminder);

        if (notificationId) {
          console.log('Notification scheduled successfully with ID:', notificationId);
          Alert.alert(
            "Success! 🎉", 
            "Reminder added successfully!\n\nYou'll receive a notification at the scheduled time.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Reminder Added", 
            "Reminder saved, but notification scheduling failed. You may need to check your notification permissions.",
            [{ text: "OK" }]
          );
        }

        // Reset form
        setFormData({
          reminderType: "",
          presentationType: "",
          date: "",
          time: "",
        });

        // Navigate back to dashboard
        router.push("/dashboard");
      } else {
        console.warn("Add reminder failed", responseData);
        Alert.alert(
          "Error", 
          responseData.message || "Failed to add reminder. Please try again."
        );
      }
    } catch (e) {
      console.warn("Add reminder error", e);
      Alert.alert("Network Error", "Unable to save reminder. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reminderOptions = [
    { value: "", label: "Select reminder type..." },
    { value: "cat", label: "Cat" },
    { value: "exams", label: "Exams" },
    { value: "presentation", label: "Presentation" },
  ];

  const presentationTypes = [
    { value: "", label: "Select presentation type..." },
    { value: "personal", label: "Personal" },
    { value: "group", label: "Group" },
  ];

  const formatSelectedDateTime = () => {
    if (!formData.date || !formData.time) return null;
    
    try {
      const [year, month, day] = formData.date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${dateStr} at ${formData.time}`;
    } catch (error) {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard")}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Reminder</Text>
        <View style={styles.notificationIndicator}>
          <MaterialCommunityIcons name="bell-plus" size={24} color="#4CAF50" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#2196F3" />
          <Text style={styles.infoBannerText}>
            You'll receive a push notification when your reminder time arrives!
          </Text>
        </View>

        {/* Reminder Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reminder Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.reminderType}
              onValueChange={(value) =>
                handleInputChange("reminderType", value)
              }
              style={styles.picker}
            >
              {reminderOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  color={option.value === "" ? "#999" : "#333"}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Presentation Type */}
        {formData.reminderType === "presentation" && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Presentation Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.presentationType}
                onValueChange={(value) =>
                  handleInputChange("presentationType", value)
                }
                style={styles.picker}
              >
                {presentationTypes.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color={option.value === "" ? "#999" : "#333"}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Date Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
            <Text
              style={[
                styles.inputText,
                !formData.date && styles.placeholderText,
              ]}
            >
              {formData.date || "Select date..."}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()} // Prevent past dates
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  handleInputChange(
                    "date",
                    selectedDate.toISOString().split("T")[0]
                  );
                }
              }}
            />
          )}
        </View>

        {/* Time Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Time *</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowTimePicker(true)}
          >
            <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
            <Text
              style={[
                styles.inputText,
                !formData.time && styles.placeholderText,
              ]}
            >
              {formData.time || "Select time..."}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const timeString = selectedTime.toLocaleTimeString("en-US", {
                    hour12: true,
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  handleInputChange("time", timeString);
                }
              }}
            />
          )}
        </View>

        {/* Selected DateTime Preview */}
        {formData.date && formData.time && (
          <View style={styles.previewContainer}>
            <MaterialCommunityIcons name="bell-ring" size={20} color="#FF9800" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.previewLabel}>Notification scheduled for:</Text>
              <Text style={styles.previewText}>{formatSelectedDateTime()}</Text>
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="loading" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Saving...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Save Reminder</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddReminderForm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    elevation: 3,
    justifyContent: "space-between",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#2196F3" },
  notificationIndicator: { padding: 5 },
  scrollContainer: { padding: 20 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1976D2",
  },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "500", color: "#333", marginBottom: 6 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 50 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
  },
  inputText: { fontSize: 16, color: "#333", marginLeft: 10, flex: 1 },
  placeholderText: { color: "#999" },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  previewLabel: {
    fontSize: 12,
    color: "#E65100",
    fontWeight: "500",
  },
  previewText: {
    fontSize: 14,
    color: "#BF360C",
    fontWeight: "600",
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#BBBBBB",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
    marginLeft: 8,
  },
});