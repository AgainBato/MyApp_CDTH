// components/BannerSlider.js
import React from 'react';
import { View, Image, FlatList, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const banners = [
  require('../assets/banners/banner1.jpg'),
  require('../assets/banners/banner2.jpg'),
  require('../assets/banners/banner3.jpg'),
];

const BannerSlider = () => {
  return (
    <FlatList
      data={banners}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      renderItem={({ item }) => (
        <View style={styles.bannerContainer}>
          <Image source={item} style={styles.bannerImage} />
        </View>
      )}
    />
  );
};

export default BannerSlider;

const styles = StyleSheet.create({
  bannerContainer: {
    width: width * 0.8,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
});
