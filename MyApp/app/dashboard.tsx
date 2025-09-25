import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // expo install @expo/vector-icons
import { DrawerLayoutAndroid } from "react-native";

const DashboardScreen = ({ navigation }: any) => {
  const [drawer, setDrawer] = useState<DrawerLayoutAndroid | null>(null);

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <TouchableOpacity
        style={styles.sidebarLink}
        onPress={() => {
          navigation.navigate("Reminder");
          drawer?.closeDrawer();
        }}
      >
        <Text style={styles.sidebarText}>Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sidebarLink}
        onPress={() => {
          navigation.navigate("View");
          drawer?.closeDrawer();
        }}
      >
        <Text style={styles.sidebarText}>View</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sidebarLink}
        onPress={() => {
          navigation.replace("Login"); // logout back to login
        }}
      >
        <Text style={styles.sidebarText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={(ref) => setDrawer(ref)}
      drawerWidth={220}
      drawerPosition="left"
      renderNavigationView={renderSidebar}
    >
      <SafeAreaView style={styles.container}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => drawer?.openDrawer()}>
            <MaterialCommunityIcons name="menu" size={28} marginTop={10} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Dashboard</Text>
        </View>

        {/* Dummy Content */}
        <View style={styles.content}>
          <Text style={styles.text}>Welcome to your Dashboard 🎉</Text>
          <Text style={styles.text}>Here is some dummy content...</Text>
        </View>
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
    backgroundColor: "#4A90E2",
    paddingHorizontal: 15,
    paddingVertical: 40,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
    marginTop: 10,
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
  sidebar: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  sidebarLink: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sidebarText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "600",
  },
});
