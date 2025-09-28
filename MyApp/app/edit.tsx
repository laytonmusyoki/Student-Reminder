import React, { useState } from "react";
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
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditReminderForm = () => {
  const { id, reminder_type, presentation_type, due_date, due_time } =
    useLocalSearchParams();

  const [formData, setFormData] = useState<{
    reminderType: string;
    presentationType: string;
    date: string;
    time: string;
  }>({
    reminderType: typeof reminder_type === "string" ? reminder_type : "",
    presentationType: typeof presentation_type === "string" ? presentation_type : "",
    date: typeof due_date === "string" ? due_date : "",
    time: typeof due_time === "string" ? due_time : "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const baseUrl = "http://192.168.0.125:8000"; // ✅ use same as Add

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "reminderType" && value !== "presentation"
        ? { presentationType: "" }
        : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.reminderType || !formData.date || !formData.time) {
      Alert.alert("Validation", "Please fill in all required fields");
      return;
    }
    if (formData.reminderType === "presentation" && !formData.presentationType) {
      Alert.alert("Validation", "Please select presentation type");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token"); // ✅ get token inside
      if (!token) {
        Alert.alert("Error", "No token found. Please login again.");
        return;
      }

      const payload = {
        reminder_type: formData.reminderType.toUpperCase(), // ✅ uppercase
        presentation_type: formData.presentationType || "",
        due_date: formData.date,
        due_time: formData.time,
      };

      const response = await fetch(`${baseUrl}/api/updateReminder/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert("Success", "Reminder updated successfully!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        console.warn("Update failed:", error);
        Alert.alert("Error", "Failed to update reminder");
      }
    } catch (e) {
      console.warn("Update error", e);
      Alert.alert("Error", "Something went wrong");
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Reminder</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Reminder Type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reminder Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.reminderType}
              onValueChange={(value) =>
                handleInputChange("reminderType", value as string)
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
                  handleInputChange("presentationType", value as string)
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
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const timeString = selectedTime.toLocaleTimeString("en-US", {
                    hour12: true, // match Add form
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  handleInputChange("time", timeString);
                }
              }}
            />
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Update Reminder</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditReminderForm;

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
  scrollContainer: { padding: 20 },
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
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
  },
  inputText: { fontSize: 16, color: "#333" },
  placeholderText: { color: "#999" },
  submitButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
