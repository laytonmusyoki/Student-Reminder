import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const AddReminderForm = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    reminderType: "",
    presentationType: "",
    date: "",
    time: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "reminderType" && value !== "presentation"
        ? { presentationType: "" }
        : {}),
    }));
  };

  const handleSubmit = () => {
    if (!formData.reminderType || !formData.date || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }
    if (
      formData.reminderType === "presentation" &&
      !formData.presentationType
    ) {
      alert("Please select presentation type");
      return;
    }
    alert("Reminder added successfully!");
    setFormData({ reminderType: "", presentationType: "", date: "", time: "" });
    navigation.goBack();
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
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/dashboard")}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Reminder</Text>
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
                    hour12: false,
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
          <Text style={styles.submitButtonText}>Save Reminder</Text>
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
    paddingTop: 40, // more top padding
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    elevation: 3,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2196F3",
  },
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
