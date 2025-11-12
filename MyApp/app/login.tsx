import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  const trimmedUsername = username.trim(); 
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    Alert.alert("Error", "Please fill in both fields");
    return;
  }

  setLoading(true);
  const baseUrl = "http://192.168.0.109:8000";

  try {
    const response = await fetch(`${baseUrl}/api/signin/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
    });

    const data = await response.json();
    console.log("Login response:", data);
  if (response.ok) {
    if (data.access) {
      await AsyncStorage.setItem("token", data.access);
    }

    await AsyncStorage.setItem("user", JSON.stringify(data));

    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : {};

    console.log("Saved token:", token);
    console.log("Saved user:", user);

    const phoneNumber = user?.phone_number || user?.user?.phone_number || "No phone number found";


    Alert.alert("Success", "Login successful!");
    router.push("/dashboard");
  } else {
    Alert.alert("Error", data.error || "Invalid credentials");
  }

  } catch (error: any) {
    Alert.alert("Error", "Cannot connect to server. Check if your backend is running.");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Back !!</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/register")}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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
    textTransform: "uppercase",
    color:"#4A90E2"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 20,
    fontSize: 16,
    marginBottom: 15,
    paddingVertical: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
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
  linkContainer: {
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
    marginTop: 10,
  },
});
