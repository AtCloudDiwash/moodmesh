import React from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../styles/theme";

const SubmittingModal = ({
  visible,
  message = "Submitting...",
}) => (
      <Modal
        transparent={true}
        animationType="none"
        visible={visible}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>{message}</Text>
          </View>
        </View>
      </Modal>

);

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
});

export default SubmittingModal;
