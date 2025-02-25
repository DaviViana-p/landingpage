import React from 'react';
import Styles from "./map.module.scss";

const Map = () => {
  return (
    <div className={Styles.text}>
        <h1>Telefone: (xx)xxxxx-xxxx</h1>
        <h1>Email: contato@gmail.com</h1>
      <iframe
        loading="lazy"
        src="https://www.google.com/maps/embed/v1/place?q=Búzios,+RJ&key=AIzaSyD09zQ9PNDNNy9TadMuzRV_UsPUoWKntt8"
        aria-hidden="true"
        data-rocket-lazyload="fitvidscompatible"
        data-lazy-src="https://www.google.com/maps/embed/v1/place?q=Búzios,+RJ&key=AIzaSyD09zQ9PNDNNy9TadMuzRV_UsPUoWKntt8"
        data-ll-status="loaded"
        className={Styles.map}
      ></iframe>
    </div>
  );
};

export default Map;
