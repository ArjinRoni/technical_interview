import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Make sure to install this package

const PromptInput = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.promptHeader}>
        <Icon name="bulb-outline" size={24} color="#7063c5" />
        <Text style={styles.promptTitle}>Prompt</Text>
      </View>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Got a vision? Let's bring it to life. Type away or explore the KLING AI Best Practices"
        placeholderTextColor="#757575"
        value={prompt}
        onChangeText={setPrompt}
      />
      <Text style={styles.charCount}>{prompt.length} / 2500</Text>
      <View style={styles.hintsContainer}>
        <Text style={styles.hintsTitle}>Hints:</Text>
        {['Flowers', 'Boy', 'Mount Fuji', 'Fairy'].map((hint, index) => (
          <TouchableOpacity key={index} style={styles.hintButton}>
            <Text style={styles.hintText}>{hint}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.refreshButton}>
          <Icon name="refresh-outline" size={20} color="#757575" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.generateButton}>
        <Text style={styles.generateButtonText}>Generate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#222222',
    borderRadius: 8,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 100,
  },
  charCount: {
    color: '#757575',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  hintsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  hintsTitle: {
    color: '#757575',
    marginRight: 8,
  },
  hintButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  hintText: {
    color: '#ffffff',
  },
  refreshButton: {
    marginLeft: 'auto',
  },
  generateButton: {
    backgroundColor: '#7063c5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PromptInput;
