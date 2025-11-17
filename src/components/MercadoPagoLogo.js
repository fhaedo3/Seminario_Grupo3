import React from 'react';
import { Image } from 'react-native';

export const MercadoPagoLogo = ({ size = 'medium' }) => {
  let width, height;

  switch(size) {
    case 'xlarge':
      width = 240;
      height = 80;
      break;
    case 'large':
      width = 180;
      height = 60;
      break;
    default:
      width = 140;
      height = 47;
  }

  return (
    <Image
      source={require('../assets/images/logo_mpp.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
};
