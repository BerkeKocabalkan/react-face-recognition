import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

const FaceDetection = () => {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const runFaceDetection = async () => {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.mtcnn.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]);

      const video = videoRef.current; // useRef ile oluşturulan video referansını alın
      const canvas = canvasRef.current; // useRef ile oluşturulan canvas referansını alın

      navigator.mediaDevices
        .getUserMedia({ video: true }) // Kameraya erişim izni alın
        .then((stream) => {
          video.srcObject = stream; // Video akışını video elementine atayın
        })
        .catch((error) => {
          console.error("Kamera erişimi hatası:", error);
        });

      video.addEventListener("play", () => {
        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()
            .withFaceDescriptors();
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          const out = faceapi.createCanvasFromMedia(video);
          faceapi.draw.drawDetections(out, detections.map(res => res.detection))
          detections.forEach(result => {
            const { age, gender, genderProbability } = result
            new faceapi.draw.DrawTextField(
              [
                `${faceapi.utils.round(age, 0)} years`,
                `${gender} (${faceapi.utils.round(genderProbability)})`
              ],
              result.detection.box.bottomLeft
            ).draw(out)
          })

          const context = canvas.getContext("2d");
          context.clearRect(0, 0, canvas.width, canvas.height); // Önceki çizimi temizleyin
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          //faceapi.draw.drawAgeAndGender(canvas, resizedDetections);
          
          detections.forEach(result => {
            const { age, gender, genderProbability } = result;
            const text = `${Math.round(age)} years, ${gender} (${Math.round(genderProbability * 100)}%)`;
            const { x, y, width, height } = result.detection.box;
            const drawOptions = {
              label: text,
              lineWidth: 2,
              boxColor: "#ff0000",
              textColor: "#ff0000",
              fontSize: 18
            };
            const drawBox = new faceapi.draw.DrawBox({ x, y, width, height }, drawOptions);
            drawBox.draw(canvas);
          });
          // Diğer çizim işlevlerini isteğe bağlı olarak buraya ekleyebilirsiniz
        }, 100); // Her 100 ms'de bir yüz taraması yapın ve sonuçları çizin
      });
    };

    runFaceDetection();
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <video
        ref={videoRef}
        style={{ width: "100%", height: "auto" }}
        autoPlay
        muted
      ></video>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      ></canvas>
    </div>
  );
};

export default FaceDetection;
