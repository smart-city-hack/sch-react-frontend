import { postUpdate } from "./serverApi";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

const threshold = 0.5;

//let classesDir = {
//    1: {
//        name: "RedPed",
//        id: 1,
//    },
//    2: {
//        name: "GreenPed",
//        id: 2,
//    },
//    3: {
//        name: "RedCar",
//        id: 3,
//    },
//    4: {
//        name: "GreenCar",
//        id: 4,
//    },
//};

let classesDir = {
    1: {
        name: 'Kangaroo',
        id: 1,
    },
    2: {
        name: 'Other',
        id: 2,
    }
}


export async function loadModel(model, setModel) {
    let tryCounter = 0;
    let loaded = false;
    while (!model && !loaded && tryCounter < 10) {
        tryCounter++;
        try {
            //let modelUrl = "https://raw.githubusercontent.com/smart-city-hack/sch-react-frontend/main/public/model_test/model.json";
            //let modelUrl =
            //    "https://raw.githubusercontent.com/smart-city-hack/sch-react-frontend/better_model_load/public/model_jonas/model.json";
            let modelUrl =
                "https://raw.githubusercontent.com/hugozanini/TFJS-object-detection/master/models/kangaroo-detector/model.json";
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
    //const predictions = await model.predict(input_tensor);
    model.executeAsync(process_input(video)).then((predictions) => {
        console.info("Predictions");
        console.info(predictions);
        renderCanvas(predictions, canvas, video);
    });

    function process_input(video_html) {
        let processed_video = tf.browser.fromPixels(video_html);
        //processed_video = tf.image.resizeBilinear(processed_video, [320, 320]);
        return processed_video.expandDims(0);
    }

    //TODO logic to generate correct post updates

    postUpdate();

    setTimeout(() => predictionFunction(), 500);
}

function renderCanvas(predictions, canvas, video) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

    //Getting predictions
    const boxes = predictions[4].arraySync();
    const scores = predictions[5].arraySync();
    const classes = predictions[6].dataSync();
    const detections = buildDetectedObjects(
        scores,
        threshold,
        boxes,
        classes,
        classesDir
    );

    console.info("Predictions: ");
    console.info(predictions);

    detections.forEach((item) => {
        const x = item["bbox"][0];
        const y = item["bbox"][1];
        const width = item["bbox"][2];
        const height = item["bbox"][3];

        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(
            item["label"] + " " + (100 * item["score"]).toFixed(2) + "%"
        ).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    detections.forEach((item) => {
        const x = item["bbox"][0];
        const y = item["bbox"][1];

        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(
            item["label"] + " " + (100 * item["score"]).toFixed(2) + "%",
            x,
            y
        );
    });

    function buildDetectedObjects(
        scores,
        threshold,
        boxes,
        classes,
        classesDir
    ) {
        const detectionObjects = [];
        var video_frame = document.getElementById("webcam");

        scores[0].forEach((score, i) => {
            if (score > threshold) {
                const bbox = [];
                const minY = boxes[0][i][0];
                const minX = boxes[0][i][1];
                const maxY = boxes[0][i][2];
                const maxX = boxes[0][i][3];
                let bboxLeft = minX;
                let bboxTop = minY;
                let bboxWidth = maxX - minX;
                let bboxHeight = maxY - minY;
                bboxLeft *= canvas.width / video.videoWidth;
                bboxTop *= canvas.height / video.videoHeight;
                bboxWidth *= canvas.width / video.videoWidth;
                bboxHeight *= canvas.height / video.videoHeight;
                bbox[0] = bboxLeft;
                bbox[1] = bboxTop;
                bbox[2] = bboxWidth;
                bbox[3] = bboxHeight;
                console.info(classes[i]);
                detectionObjects.push({
                    class: classes[i],
                    label: classesDir[classes[i]].name,
                    score: score.toFixed(4),
                    bbox: bbox,
                });
            }
        });
        return detectionObjects;
    }

    //if (predictions.length > 0) {
    //    // setPredictionData(predictions);
    //    console.log(predictions);
    //    for (let n = 0; n < predictions.length; n++) {
    //        // Check scores
    //        console.log(n);
    //        console.info("score " + predictions[n].score);
    //        if (predictions[n].score > threshold) {
    //            let bboxLeft = predictions[n].bbox[0];
    //            let bboxTop = predictions[n].bbox[1];
    //            let bboxWidth = predictions[n].bbox[2];
    //            let bboxHeight = predictions[n].bbox[3];
    //            bboxLeft *= canvas.width / video.videoWidth;
    //            bboxTop *= canvas.height / video.videoHeight;
    //            bboxWidth *= canvas.width / video.videoWidth;
    //            bboxHeight *= canvas.height / video.videoHeight;

    //            ctx.beginPath();
    //            ctx.font = "28px Arial";
    //            ctx.fillStyle = "red";

    //            ctx.fillText(
    //                predictions[n].class +
    //                    ": " +
    //                    Math.round(parseFloat(predictions[n].score) * 100) +
    //                    "%",
    //                bboxLeft,
    //                bboxTop
    //            );

    //            ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
    //            //ctx.rect(bboxLeft, bboxTop, bboxHeight, bboxHeight);
    //            ctx.strokeStyle = "#FF0000";

    //            ctx.lineWidth = 3;
    //            ctx.stroke();

    //            console.log("detected");
    //        }
    //    }
    //}
}
