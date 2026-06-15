import { Carousel } from 'antd';
import React from 'react';

const CarouselComponent = ({ images = [], width = "100%" , height = "70vh" }) => {
  console.log(images);
  return (
    <div style={{ width: width }}>
      <Carousel arrows infinite={false}>
        {images.map((imgSrc, index) => (
          <div key={index}>
            <img src={imgSrc} alt={`Slide ${index + 1}`} style={{ width: "100%", height:height, objectFit: "cover" , borderRadius: "" }} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselComponent;
