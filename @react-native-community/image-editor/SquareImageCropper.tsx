import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  SafeAreaView,
  Button,
} from 'react-native';
import ImageEditor from '@react-native-community/image-editor';

import type { LayoutChangeEvent } from 'react-native';
import { DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT } from './constants';
import { ImageCropper } from './ImageCropper';
import { ImageCropperFull } from './ImageCropperFull'
import { base64Data } from './utils';

import type { ImageCropData, ImageSize } from './types';

interface State {
  croppedImageURI: string | null;
  cropError: Error | null;
  measuredSize: ImageSize | null;
}
interface Props {
  // noop
}

export class SquareImageCropper extends Component<Props, State> {
  state: any;
  _isMounted: boolean;
  _transformData: ImageCropData | undefined;

  constructor(props: Props) {
    super(props);
    this._isMounted = true;
    this.state = {
      photo: {
        uri: base64Data,
        height: DEFAULT_IMAGE_HEIGHT,
        width: DEFAULT_IMAGE_WIDTH,
      },
      measuredSize: null,
      croppedImageURI: null,
      cropError: null,
      demoType: 'demo1'
    };
  }

  _onLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;
    if (!measuredWidth) {
      return;
    }
    this.setState({
      measuredSize: { width: measuredWidth, height: measuredWidth },
    });
  };

  _onTransformDataChange = (data: ImageCropData) => {
    this._transformData = data;
  };

  demoChange = (demoType) => {
    this.setState({
      demoType
    })
  }

  render() {
    if (!this.state.measuredSize) {
      return (
        <SafeAreaView style={styles.container} onLayout={this._onLayout} />
      );
    }

    return (
      <SafeAreaView style={styles.containerPadding}>
        <View style={styles.viewRow}>
          <Button title="demo1" onPress={()=>this.demoChange('demo1')} />
          <Button title="demo2" onPress={()=>this.demoChange('demo2')} />
        </View>
        {
          this.state.demoType === 'demo1' ? !this.state.croppedImageURI ? this._renderImageCropper() : this._renderCroppedImage() : ''
        }
        {
          this.state.demoType === 'demo2' ? this._renderFullDemo() : ''
        }
      </SafeAreaView>
    )
  }

  _renderImageCropper() {
    const { photo, cropError, measuredSize } = this.state;

    if (!photo) {
      return <View style={styles.container} />;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.text} testID="headerText">
          Drag the image within the square to crop
        </Text>
        <ImageCropper
          image={photo}
          size={measuredSize}
          style={[styles.imageCropper, measuredSize]}
          onTransformDataChange={this._onTransformDataChange}
        />
        <TouchableHighlight
          accessibilityRole="button"
          style={styles.cropButtonTouchable}
          onPress={this._crop}
        >
          <View style={styles.cropButton}>
            <Text style={styles.cropButtonLabel}>Crop</Text>
          </View>
        </TouchableHighlight>
        <Text style={styles.errorText}>{cropError?.message}</Text>
      </View>
    );
  }

  _renderCroppedImage() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Here is the cropped image</Text>
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri: this.state.croppedImageURI }}
          style={[styles.imageCropper, this.state.measuredSize]}
        />
        <TouchableHighlight
          accessibilityRole="button"
          style={styles.cropButtonTouchable}
          onPress={this._reset}
        >
          <View style={styles.cropButton}>
            <Text style={styles.cropButtonLabel}>Try again</Text>
          </View>
        </TouchableHighlight>
        <Text style={styles.errorText} />
      </View>
    );
  }

  _renderFullDemo() {
    return (
      <View style={styles.container}>
        <ImageCropperFull />
      </View>
    )
  }

  _crop = async () => {
    try {
      if (!this._transformData) {
        return;
      }
      const croppedImageURI = await ImageEditor.cropImage(
        this.state.photo.uri,
        this._transformData
      );
      if (croppedImageURI) {
        this.setState({ croppedImageURI });
      }
    } catch (cropError) {
      if (cropError instanceof Error) {
        this.setState({ cropError });
      }
    }
  };

  _reset = () => {
    this.setState({ croppedImageURI: null, cropError: null });
  };
}

const styles = StyleSheet.create({
  viewRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  containerPadding: {
    flex: 1,
    paddingTop: 50,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 0,
  },
  imageCropper: {
    alignSelf: 'center',
    marginTop: 12,
  },
  cropButtonTouchable: {
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 'auto',
    backgroundColor: 'royalblue',
    borderRadius: 6,
  },
  cropButton: {
    padding: 12,
  },
  cropButtonLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  text: {
    color: 'black',
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
});
