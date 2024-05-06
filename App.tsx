/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import {
  SafeAreaView,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  Platform,
  Dimensions,
  useColorScheme,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import PermissionsService, { isIOS } from './Permissions';
import * as ImagePicker from 'expo-image-picker';

axios.interceptors.request.use(
  async config => {
    let request = config;
    request.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    request.url = configureUrl(config.url);
    return request;
  },
  error => error,
);

export const { height, width } = Dimensions.get('window');

export const configureUrl = url => {
  let authUrl = url;
  if (url && url[url.length - 1] === '/') {
    authUrl = url.substring(0, url.length - 1);
  }
  return authUrl;
};

export const fonts = {
  Bold: { fontFamily: 'Roboto-Bold' },
};

const options = {
  mediaType: 'photo',
  quality: 1,
  width: 256,
  height: 256,
  includeBase64: true,
};

const App = () => {
  const [result, setResult] = useState('');
  const [label, setLabel] = useState('');
  const isDarkMode = useColorScheme() === 'dark';
  const [image, setImage] = useState('');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const getPredication = async params => {
    return new Promise((resolve, reject) => {
      var bodyFormData = new FormData();
      bodyFormData.append('file', params);
      const url = Config.URL;
      return axios
        .post(url, bodyFormData)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          setLabel('Failed to predicting.');
          reject('err', error);
        });
    });
  };

  const manageCamera = async type => {
    try {
      if (!(await PermissionsService.hasCameraPermission())) {
        return [];
      } else {
        if (type === 'Camera') {
          openCamera();
        } else {
          openLibrary();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('You need to grant camera permissions to use this app');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      const uri = result.uri;
      const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
      getResult(path, result);
    }
  };

  const clearOutput = () => {
    setResult('');
    setImage('');
  };

  const getResult = async (path, response) => {
    setImage(path);
    setLabel('Predicting...');
    setResult('');
    const params = {
      uri: path,
      name: response.assets ? response.assets[0].fileName : 'image.jpg',
      type: response.assets ? response.assets[0].type : 'image/jpeg',
    };
    const res = await getPredication(params);
    if (res?.data?.class) {
      setLabel(res.data.class);
      setResult(res.data.confidence);
    } else {
      setLabel('Failed to predict');
    }
  };

  const openLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('You need to grant camera roll permissions to use this app');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const uri = result.uri;
      const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
      getResult(path, result);
    }
  };

  return (
    <View style={[backgroundStyle, styles.outer]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ImageBackground
        blurRadius={10}
        source={{ uri: 'background' }}
        style={{ height: height, width: width }}
      />
      <Text style={styles.title}>{'Potato Disease \nPrediction App'}</Text>
      <TouchableOpacity onPress={clearOutput} style={styles.clearStyle}>
        <Image source={{ uri: 'clean' }} style={styles.clearImage} />
      </TouchableOpacity>
      {image?.length && (
        <Image source={{ uri: image }} style={styles.imageStyle} />
      )}
      {result && label && (
        <View style={styles.mainOuter}>
          <Text style={[styles.space, styles.labelText]}>
            {'Label: \n'}
            <Text style={styles.resultText}>{label}</Text>
          </Text>
          <Text style={[styles.space, styles.labelText]}>
            {'Confidence: \n'}
            <Text style={styles.resultText}>
              {parseFloat(result).toFixed(2) + '%'}
            </Text>
          </Text>
        </View>
      )}
      {image && <Text style={styles.emptyText}>{label}</Text>}
      {!image && (
        <Text style={styles.emptyText}>
          Use below buttons to select a picture of a potato plant leaf.
        </Text>
      )}
      <View style={styles.btn}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openCamera}
          style={styles.btnStyle}
        >
          <Image source={{ uri: 'camera' }} style={styles.imageIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openLibrary}
          style={styles.btnStyle}
        >
          <Image source={{ uri: 'gallery' }} style={styles.imageIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    position: 'absolute',
    top: (isIOS && 35) || 10,
    fontSize: 30,
    ...fonts.Bold,
    color: '#FFF',
  },
  clearImage: { height: 40, width: 40, tintColor: '#FFF' },
  mainOuter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: height / 1.6,
    alignSelf: 'center',
  },
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    position: 'absolute',
    bottom: 40,
    justifyContent: 'space-between',
    flex:1,
    flexDirection: 'row',
  },
  btnStyle: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
  },
  clearStyle: {
    position: 'absolute',
    top: (isIOS && 35) || 10,
    right: 10,
  },
  imageStyle: {
    height: 200,
    width: 200,
    borderRadius: 10,
    position: 'absolute',
    top: height / 4,
  },
  emptyText: {
    position: 'absolute',
    top: height / 1.6,
    alignSelf: 'center',
    color: '#FFF',
    fontSize: 20,
    ...fonts.Bold,
  },
  labelText: {
    color: '#FFF',
    fontSize: 20,
    ...fonts.Bold,
  },
  resultText: {
    color: '#FFF',
    fontSize: 18,
  },
  space: {
    margin: 10,
  },
});

export default App;