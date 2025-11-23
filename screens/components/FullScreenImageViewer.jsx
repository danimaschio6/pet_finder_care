import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Ionicons } from '@expo/vector-icons';

const FullScreenImageViewer = ({ imageUrl, onClose }) => {
  return (
    <Modal visible={true} transparent={true}>
      
      {/* Botón X para cerrar */}
      <TouchableOpacity
        onPress={onClose}
        style={{
          position: 'absolute',
          top: 40,
          right: 20,
          zIndex: 20,
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 10,
          borderRadius: 50
        }}
      >
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Zoom estilo WhatsApp */}
      <ImageViewer
        imageUrls={[{ url: imageUrl }]}
        enableSwipeDown
        onSwipeDown={onClose}
        backgroundColor="rgba(0,0,0,0.95)"
        saveToLocalByLongPress={false}
      />
    </Modal>
  );
};

export default FullScreenImageViewer;

