// import styles from "../styles/Home.module.css";

import React, { useEffect, useState, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import {
  TextField,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { postLocation, postUpdate } from "../utils/serverApi";

import { geolocate, setupGeolocate, success } from "../utils/locationService";

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

  // Set Video dimensions
  const videoConstraints = {
    height: 1080,
    width: 1920,
    maxWidth: "100vw",
    facingMode: "environment",
  };

  const [videoWidth, setVideoWidth] = useState(960);
  const [videoHeight, setVideoHeight] = useState(640);

  const webcamRef = React.useRef(null);
  const canvasRef = useRef(null);
  // Setup ML model

  const [model, setModel] = useState(null);

  async function loadModel() {
    let tryCounter = 0;
    let loaded = false;
    while (!model && !loaded && tryCounter < 10) {
      tryCounter++;
      try {
        const model = await cocoSsd.load();
        setModel(model);
        loaded = true;
        console.info("setloadedModel");
      } catch (err) {
        console.error(err);
        console.error("failed load model");
      }
    }
  }

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  async function predictionFunction() {
    if (!model || !webcamRef.current || !canvasRef.current) return;
    console.log(webcamRef.current);

    const predictions = await model.detect(webcamRef.current.video);

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(
      0,
      0,
      webcamRef.current.video.videoWidth,
      webcamRef.current.video.videoHeight
    );

    if (predictions.length > 0) {
      // setPredictionData(predictions);
      console.log(predictions);
      for (let n = 0; n < predictions.length; n++) {
        // Check scores
        console.log(n);
        if (predictions[n].score > 0.8) {
          let bboxLeft = predictions[n].bbox[0];
          let bboxTop = predictions[n].bbox[1];
          let bboxWidth = predictions[n].bbox[2] - bboxLeft; //dunno why I need to do this
          let bboxHeight = predictions[n].bbox[3] - bboxTop; //dunno why I need to do this

          console.log("bboxLeft: " + bboxLeft);
          console.log("bboxTop: " + bboxTop);

          console.log("bboxWidth: " + bboxWidth);

          console.log("bboxHeight: " + bboxHeight);

          ctx.beginPath();
          ctx.font = "28px Arial";
          ctx.fillStyle = "red";

          ctx.fillText(
            predictions[n].class +
              ": " +
              Math.round(parseFloat(predictions[n].score) * 100) +
              "%",
            bboxLeft,
            bboxTop
          );

          ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
          //ctx.rect(bboxLeft, bboxTop, bboxHeight, bboxHeight);
          ctx.strokeStyle = "#FF0000";

          ctx.lineWidth = 3;
          ctx.stroke();

          console.log("detected");
        }
      }
    }
    postUpdate();

    setTimeout(() => predictionFunction(), 500);
  }

  // useEffect(() => {
  //   //prevent initial triggering
  //   if (mounted.current) {
  //     predictionFunction();

  //   } else {
  //     mounted.current = true;
  //   }
  // }, [start]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        marginTop: -8,
        backgroundImage:
          "radial-gradient( circle 993px at 0.5% 50.5%,  rgba(137,171,245,0.37) 0%, rgba(245,247,252,1) 100.2% )",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Object Detection
          </Typography>
        </Toolbar>
      </AppBar>

      <Box mt={1} />
      <Grid
        container
        style={{
          height: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          padding: 20,
        }}
      >
        <Grid
          item
          xs={12}
          md={12}
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <>
            <Box mt={2} />
            {
              <Button
                variant={"contained"}
                style={{
                  color: "white",
                  backgroundColor: "blueviolet",
                  width: "50%",
                  maxWidth: "250px",
                }}
                onClick={async () => {
                  setupGeolocate(position => { postLocation(position.coords) });
                  predictionFunction();
                }}
              >
                Start Detect
              </Button>
            }
            <Box mt={2} />{" "}
          </>
          <div
            style={{
              position: "absolute",
              top: "400px",
              zIndex: "9999",
            }}
          >
            <canvas
              id="myCanvas"
              width={videoWidth}
              height={videoHeight}
              style={{ backgroundColor: "transparent" }}
              ref={canvasRef}
            />
          </div>
          <div style={{ position: "absolute", top: "400px" }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              width={videoWidth}
              height={videoHeight}
              screenshotQuality={1}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={12}></Grid>
      </Grid>
    </div>
  );
}
