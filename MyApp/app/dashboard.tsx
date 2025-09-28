import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DashboardScreen = () => {
  const [username, setUsername] = useState("Guest");
  const [reminders, setReminders] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const baseUrl = "http://192.168.0.125:8000";

  // Load user
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (!raw) return setUsername("Guest");
        const user = JSON.parse(raw);
        setUsername(user?.user?.username ?? "Guest");
      } catch (e) {
        console.warn("Load user failed", e);
      }
    })();
  }, []);

  // Load token
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
      } catch (e) {
        console.warn("Failed to load token", e);
      }
    })();
  }, []);

  // Fetch reminders
  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const response = await fetch(`${baseUrl}/api/getReminders/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setReminders(data);
      } catch (e) {
        console.warn("Fetch reminders failed", e);
      }
    })();
  }, [token]);

  // Delete reminder
  const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      const response = await fetch(`${baseUrl}/api/deleteReminder/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
        Alert.alert("Success", "Reminder deleted successfully");
      } else {
        const err = await response.json();
        console.warn("Delete failed:", err);
      }
    } catch (e) {
      console.warn("Delete request failed", e);
    }
  };

  // Reminder card
  const renderReminder = ({ item }: any) => (
    <View style={styles.reminderCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.reminderType}>{item.reminder_type}</Text>
        <Text style={styles.reminderDate}>Due Date: {item.due_date}</Text>
        <Text style={styles.reminderTime}>Time: {item.due_time}</Text>
        {item.presentation_type ? (
          <Text style={styles.reminderPresentation}>
            Presentation: {item.presentation_type}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {/* Edit */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/edit",
              params: {
                id: item.id,
                reminder_type: item.reminder_type,
                presentation_type: item.presentation_type,
                due_date: item.due_date,
                due_time: item.due_time,
              },
            })
          }
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={22}
            color="#4CAF50"
          />
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Confirm Delete",
              "Are you sure you want to delete this reminder?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete",
                  style: "destructive",
                  onPress: () => handleDelete(item.id),
                },
              ]
            )
          }
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={22}
            color="#F44336"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>Dashboard</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Yes, Logout",
                style: "destructive",
                onPress: async () => {
                  await AsyncStorage.removeItem("token");
                  await AsyncStorage.removeItem("user");
                  setToken(null);
                  setUsername("Guest");
                  router.replace("/login");
                },
              },
            ])
          }
        >
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>{getGreeting()},</Text>
        <Text style={styles.welcomeTextName}>{username} 👋</Text>

        <Text style={styles.reminders}>My Reminders</Text>

        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReminder}
          ListEmptyComponent={
            <Text style={styles.text}>No reminders available</Text>
          }
        />
      </View>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/reminders")}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 25,
  },
  navTitle: {
    fontSize: 22,
    paddingVertical: 25,
    marginTop: 25,
    fontWeight: "bold",
    color: "#fff",
  },
  content: { padding: 20 },
  text: { fontSize: 18, marginBottom: 10, color: "#333", textAlign: "center" },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2196F3",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  welcomeText: { fontSize: 20, fontWeight: "600" },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  welcomeTextName: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  reminderType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 4,
  },
  reminderPresentation: { fontSize: 14, color: "#8E24AA", marginTop: 4 },
  reminderDate: { fontSize: 14, color: "#444" },
  reminderTime: { fontSize: 14, color: "#666" },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  reminders: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#2196F3",
  },
  logoutButton: { marginLeft: "auto", paddingVertical: 25, marginTop: 25 },
});
