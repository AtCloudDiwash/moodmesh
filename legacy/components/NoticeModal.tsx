import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../styles/theme";

const NoticeModal = ({
  visible,
  message = "Posted Successfully!",
  onClose,
}) => (
  <Modal
    transparent={true}
    animationType="slide"
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalBackground}>
      <View style={styles.successModalContainer}>
        <Text style={styles.successText}>{message}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>OK</Text>
        </TouchableOpacity>
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
  successModalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NoticeModal;
