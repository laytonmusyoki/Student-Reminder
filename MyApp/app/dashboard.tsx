import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // expo install @expo/vector-icons
import { DrawerLayoutAndroid } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DashboardScreen = ({ navigation }: any) => {
  const [drawer, setDrawer] = useState<DrawerLayoutAndroid | null>(null);
  const [username, setUsername] = useState("Guest");

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

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarHeaderText}>Menu</Text>
      </View>
       
      
      <TouchableOpacity
        style={styles.sidebarLink}
        onPress={() => router.push("/reminders")}
      >
        <MaterialCommunityIcons name="bell-outline" size={22} color="#2196F3" style={styles.sidebarIcon} />
        <Text style={styles.sidebarText}>Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sidebarLink}
        onPress={() => {
          navigation.navigate("View");
          drawer?.closeDrawer();
        }}
      >
        <MaterialCommunityIcons name="eye-outline" size={22} color="#2196F3" style={styles.sidebarIcon} />
        <Text style={styles.sidebarText}>View</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sidebarLink}
        onPress={() => router.push("/login")}
      >
        <MaterialCommunityIcons name="logout" size={22} color="#2196F3" style={styles.sidebarIcon} />
        <Text style={styles.sidebarText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={(ref) => setDrawer(ref)}
      drawerWidth={250}
      drawerPosition="left"
      renderNavigationView={renderSidebar}
    >
      <SafeAreaView style={styles.container}>
        {/* Enhanced Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => drawer?.openDrawer()}
          >
            <MaterialCommunityIcons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Dashboard</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome to your Dashboard  {username} 🎉</Text>
          <Text style={styles.text}>Here is some dummy content...</Text>
        </View>

        {/* Floating Plus Button at Bottom Center */}
        <TouchableOpacity style={styles.floatingButton} onPress={() => router.push("/reminders")}>
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </DrawerLayoutAndroid>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
   paddingVertical: 25,
    marginRight: 15,
    marginTop: 25,
  },
  navTitle: {
    fontSize: 22,
    paddingVertical: 25,
    marginTop: 25,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  floatingButton: {
    position: "fixed",
    bottom: 40,
    right: 40,
    alignSelf: "flex-end",
    backgroundColor: "#2196F3",
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sidebarHeader: {
    backgroundColor: "#2196F3",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sidebarHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  sidebarLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sidebarIcon: {
    marginRight: 15,
  },
  sidebarText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
});