import { launchCamera, CameraOptions, Asset } from 'react-native-image-picker';

type PickedImage = {
  uri: string;
  type: string;
  name: string;
};

export const captureImage = async (imageType: 'front' | 'back'): Promise<PickedImage> => {
  const options: CameraOptions = {
    mediaType: 'photo',
    quality: 0.9,
    saveToPhotos: false,
    cameraType: 'back',
  };

  const result = await launchCamera(options);
  if (result.didCancel) {
    throw new Error('Capture cancelled');
  }
  if (result.errorCode) {
    throw new Error(result.errorMessage || 'Camera error');
  }
  const asset: Asset | undefined = result.assets?.[0];
  if (!asset?.uri || !asset.type) {
    throw new Error('Invalid image capture');
  }

  return {
    uri: asset.uri,
    type: asset.type,
    name: asset.fileName || `smartwheelers-${imageType}-${Date.now()}.jpg`,
  };
};
