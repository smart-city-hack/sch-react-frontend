// import styles from "../styles/Home.module.css";

import React, { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { postLocation, postUpdate } from "../utils/serverApi";

import { geolocate, setupGeolocate, success } from "../utils/locationService";
import { loadModel, predictionFunction } from "../utils/machineLearning";

export default function Home() {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));
  const classes = useStyles();

  const [videoWidth, setVideoWidth] = useState(300);
  const [videoHeight, setVideoHeight] = useState(200);

  // Set Video dimensions
  const videoConstraints = {
    facingMode: "environment",
  };

  const webcamRef = React.useRef(null);
  const canvasRef = useRef(null);
  // Setup ML model

  const [model, setModel] = useState(null);

  useEffect(() => {
    tf.ready().then(() => {
      loadModel(model, setModel);
    });

    setupGeolocate((position) => {
      postLocation(position.coords);
    });
  }, []);

  const handleStartButtonClick = async () => {
    predictionFunction(webcamRef.current?.video, canvasRef.current, model);
  };

  return (
    <div className="container">
      <Button
        variant="contained"
        className="start-button"
        onClick={handleStartButtonClick}
      >
        Start Detect
      </Button>
      <canvas
        id="myCanvas"
        className="canvas"
        width={videoWidth}
        height={videoHeight}
        ref={canvasRef}
      />
      <Webcam
        audio={false}
        ref={webcamRef}
        width={videoWidth}
        height={videoHeight}
        screenshotQuality={1}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="webcam"
      />
    </div>
  );
}
