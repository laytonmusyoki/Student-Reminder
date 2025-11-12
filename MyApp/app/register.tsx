import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const RegisterScreen = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    university: "", 
    phone_number: "", 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password || !form.confirm || !form.university || !form.phone_number) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    const baseUrl = "http://192.168.0.109:8000";

    try {
      const response = await fetch(`${baseUrl}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          university: form.university, 
          phone_number: form.phone_number, 
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        router.push("/login");
      } else {
        Alert.alert("Error", JSON.stringify(data.error || data));
      }
    } catch (error: any) {
      Alert.alert("Error", "Cannot connect to server. Check if Django is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Account !!</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={form.username}
        onChangeText={(text) => handleChange("username", text)}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* phone number */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#888"
        value={form.phone_number}
        onChangeText={(text) => handleChange("phone_number", text)}
        keyboardType="phone-pad"
      />

      {/* ✅ New University Input */}
      <TextInput
        style={styles.input}
        placeholder="University"
        placeholderTextColor="#888"
        value={form.university}
        onChangeText={(text) => handleChange("university", text)}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(text) => handleChange("password", text)}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry={!showConfirm}
          value={form.confirm}
          onChangeText={(text) => handleChange("confirm", text)}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <MaterialCommunityIcons
            name={showConfirm ? "eye-off" : "eye"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <View style={styles.redirectContainer}>
        <Text style={styles.redirectText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.redirectLink}> Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#4A90E2",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  redirectContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  redirectText: {
    fontSize: 16,
    color: "#333",
  },
  redirectLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
  },
});
