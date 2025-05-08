import React, { useState } from "react";
import { View, Dimensions, StyleSheet, Image } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { globalCss } from "../styles/globalCss";
import { COLORS } from "../styles/theme";

const { width } = Dimensions.get("window");

const PaginationDots = React.memo(
  ({ activeIndex, images }: { activeIndex: number; images: string[] }) => (
    <View style={styles.paginationContainer}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            activeIndex === index ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  )
);

PaginationDots.displayName = "PaginationDots";

const CustomCarousel = ({ images }: { images: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        width={width * 0.9}
        data={images}
        scrollAnimationDuration={300} // Faster, smoother scroll
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item }} style={styles.image} />
          </View>
        )}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        loop={false}
        pagingEnabled
           />
      <PaginationDots activeIndex={activeIndex} images={images} />
    </View>
  );
};

export default CustomCarousel;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
   },
  item: {
    borderRadius: globalCss.bRadius,
    height:350,
    top: -18,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: globalCss.bRadius
  },
  paginationContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "90%",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.cardBackground,
  },
  inactiveDot: {
    backgroundColor: "#ccc",
    opacity: 0.5,
  },
});
