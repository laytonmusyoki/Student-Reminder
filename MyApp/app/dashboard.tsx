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
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const baseUrl = "http://192.168.0.109:8000"; 

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Load user info
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

  // load phone number
  useEffect(() => {
    (async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
            const user = userString ? JSON.parse(userString) : {};

            console.log("Saved token:", token);
            console.log("Saved user:", user);

            const phoneNumber = user?.phone_number || user?.user?.phone_number || "No phone number found";
            // format number to start with +254
            let formattedNumber = phoneNumber;
            if (phoneNumber.startsWith("0")) {
              formattedNumber = "+254" + phoneNumber.slice(1);
            } else if (!phoneNumber.startsWith("+")) {
              formattedNumber = "+254" + phoneNumber;
            }
            setPhoneNumber(formattedNumber);
      } catch (e) {
        console.warn("Failed to load phone number", e);
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
    Alert.alert("Phone Number", phoneNumber || "No phone number found");

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


  useEffect(() => {
    if (reminders.length === 0 || !token) return;

    const interval = setInterval(() => {
      const now = new Date();

      reminders.forEach(async (reminder) => {
        const reminderDateTime = new Date(`${reminder.due_date}T${reminder.due_time}`);
        const diffMinutes = (reminderDateTime.getTime() - now.getTime()) / 60000;

        // Send SMS if within 30 minutes
        if (diffMinutes > 0 && diffMinutes <= 30) {
          const notifiedKey = `notified_${reminder.id}`;
          const alreadyNotified = await AsyncStorage.getItem(notifiedKey);

          if (!alreadyNotified) {
            try {
              const response = await fetch(`${baseUrl}/send_sms/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  phone: phoneNumber || "No phone number found",
                  message: `Reminder: Your ${reminder.reminder_type} is due at ${reminder.due_time} on ${reminder.due_date}`,
                }),
              });

              if (response.ok) {
                console.log("SMS sent for reminder:", reminder.id);
                await AsyncStorage.setItem(notifiedKey, "true");
              } else {
                console.warn("Failed to send SMS:", await response.text());
              }
            } catch (error) {
              console.warn("Error sending SMS:", error);
            }
          }
        }
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, [reminders, token]);

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
      <TouchableOpacity
  onPress={async () => {
    try {
      const res = await fetch(`${baseUrl}/api/send_sms/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number: "+254755965011",
          message: "Manual test message",
        }),
      });
      console.log("Response:", await res.text());
    } catch (e) {
      console.error("Error:", e);
    }
  }}
  style={{ backgroundColor: "orange", padding: 10, marginTop: 20 }}
>
  <Text style={{ color: "white" }}>Test SMS API</Text>
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
