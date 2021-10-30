import { postUpdate } from "./serverApi";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

export async function loadModel(model, setModel) {
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

export async function predictionFunction(video, canvas, model) {
  if (!model || !video || !canvas) return;

  const predictions = await model.detect(video);

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

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
