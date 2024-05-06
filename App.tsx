/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  Button,
  ImageSourcePropType,
} from 'react-native';

import * as ImagePicker from 'react-native-image-picker'; // Updated import statement

const Section = ({ children, title }) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? 'white' : 'black',
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? 'lightgray' : 'darkgray',
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedImage, setSelectedImage] = useState(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
  };

  const handleImageUpload = () => {
    const options: ImagePicker.ImageLibraryOptions = { // Updated the type of options to ImageLibraryOptions
      mediaType: 'photo',
    };

    ImagePicker.launchImageLibrary(options, response => { // Changed from ImagePicker.showImagePicker to ImagePicker.launchImageLibrary
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source: ImageSourcePropType | null = { uri: response.assets && response.assets[0]?.uri || undefined }; // Casted uri to string | undefined
        setSelectedImage(source);
      }
    });
  };

  const handleImageCapture = () => {
    const options = {
      mediaType: 'photo',
    };

    ImagePicker.launchCamera(options, response => { // Changed from ImagePicker.launchCamera to ImagePicker.launchCamera
      if (response.didCancel) {
        console.log('User cancelled image capture');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setSelectedImage(source);
      }
    });
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? 'black' : 'white',
          }}
        >
          <Section title="Welcome">
            🥔 Potato <Text style={styles.highlight}>Blight</Text> Disease 🦠 
            prediction App!
          </Section>
        </View>
        <View>
          <Button title="Upload Image" onPress={handleImageUpload} />
          <Button title="Capture Image" onPress={handleImageCapture} />
          {selectedImage && (
            <Image
              source={selectedImage}
              style={{ width: 400, height: 400 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
