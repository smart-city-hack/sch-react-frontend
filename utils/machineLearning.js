import { postUpdate } from "./serverApi";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';

const threshold = 0.50;

export async function loadModel(model, setModel) {
  let tryCounter = 0;
  let loaded = false;
  while (!model && !loaded && tryCounter < 10) {
    tryCounter++;
    try {
      let modelUrl = "https://raw.githubusercontent.com/smart-city-hack/sch-react-frontend/main/public/model_test/model.json";
      //const model = await cocoSsd.load();
      const model = await loadGraphModel(modelUrl);
      setModel(model);
      loaded = true;
      console.info("setloadedModel");
    } catch (err) {
      console.error(err);
      console.error("failed load model");
    }
  }
}

export async function predictionFunction(video, canvas, model) {
  if (!model || !video || !canvas) return;

  // Do Prediction with model
  const input_tensor = process_input(video);
  const predictions = await model.detect(input_tensor);
  
  function process_input(video_html) {
    let processed_video = tf.browser.fromPixels(video_html);
    processed_video = tf.image.resizeBilinear(processed_video, [320, 320]);
    return processed_video;
  }

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

  if (predictions.length > 0) {
    // setPredictionData(predictions);
    console.log(predictions);
    for (let n = 0; n < predictions.length; n++) {
      // Check scores
      console.log(n);
      if (predictions[n].score > threshold) {
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
