import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Index = () => {
  const router = useRouter();
  
  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&blur=5" }}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="school" size={60} color="#fff" />
          <Text style={styles.heading}>Student Reminder App</Text>
        </View>
        <Text style={styles.subText}>
          Never miss an assignment, exam, or important deadline again. Our smart reminder system helps you stay organized and succeed in your academic journey.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#4A90E2" />
            <Text style={styles.featureText}>Smart Scheduling</Text>
          </View>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="bell-ring" size={24} color="#4A90E2" />
            <Text style={styles.featureText}>Timely Notifications</Text>
          </View>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#4A90E2" />
            <Text style={styles.featureText}>Progress Tracking</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          {/* Get Started Button - Primary */}
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push("/register")} // or wherever you want to navigate new users
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
          </TouchableOpacity>
          
          {/* Login and Register Buttons Row */}
          <View style={styles.authButtonsRow}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <MaterialCommunityIcons name="login" size={20} color="#4A90E2" />
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/register")}
            >
              <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Index;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)", // increased opacity for better readability
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  heading: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#4A90E2",
    textAlign: "center",
    marginTop: 15,
    letterSpacing: 1,
    width: "100%",
  },
  subText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 26,
    paddingHorizontal: 10,
    width: "100%",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding:5,
    margin:40,
    paddingHorizontal: 5,
  },
  feature: {
    alignItems: "center",
    backgroundColor: "rgba(74,144,226,0.2)",
    borderRadius: 15,
    padding: 20,
    minWidth: 100,
    flex: 1,
    marginLeft:5
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  getStartedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 20,
    minWidth: 200,
    justifyContent: "center",
  },
  getStartedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  authButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 300,
    gap: 15,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    justifyContent: "center",
  },
  loginText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    justifyContent: "center",
  },
  registerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});