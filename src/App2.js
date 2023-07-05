import React, { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

const threshold = 0.4;

function FaceRecognition() {
  const [descriptors, setDescriptors] = useState([]);

  const [targetDescriptor, setTargetDescriptor] = useState();

  const [distance, setDistance] = useState("-");
  const [loading, setLoading] = useState(true);

  const [allDistance, setAllDistance] = useState([]);

  useEffect(() => {
    loadModels();
    console.log("FaceRecognition.js useEffect");
  }, []);

  async function loadModels() {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    setLoading(false);
  }

  async function updateResult() {
    const distances = [];
    setAllDistance([]);
    for (let i = 0; i < descriptors.length; i++) {
      const distance = faceapi.utils.round(
        faceapi.euclideanDistance(targetDescriptor, descriptors[i])
      );
      distances.push(distance);
    }
    const averageDistance =
      distances.reduce((total, distance) => total + distance, 0) /
      distances.length;
    let text = faceapi.utils.round(averageDistance);
    let bgColor = "#ffffff";
    if (averageDistance > threshold) {
      text += " (no match)";
      bgColor = "#ce7575";
    }
    setDistance(text);
    document.getElementById("distance").style.backgroundColor = bgColor;
    setAllDistance(distances);
  }

  async function onFileChanged(file, index) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageSrc = event.target.result;
      const input = await faceapi.fetchImage(imageSrc);
      const computedDescriptor = await faceapi.computeFaceDescriptor(input);
  
      setDescriptors((prevDescriptors) => {
        const updatedDescriptors = [...prevDescriptors];
        updatedDescriptors[index] = computedDescriptor;
        return updatedDescriptors;
      });
    };
    reader.readAsDataURL(file);
  }

  async function changeTarget(file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageSrc = event.target.result;
      const input = await faceapi.fetchImage(imageSrc);
      const computedDescriptor = await faceapi.computeFaceDescriptor(input);
      setTargetDescriptor(computedDescriptor);
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (descriptors.length > 1 && targetDescriptor) {
      updateResult();
    }
  }, [descriptors, targetDescriptor]);

  return (
    <div className="center-content page-container">
      <div>
        {loading ? (
          <div className="progress" id="loader">
            <div className="indeterminate"></div>
          </div>
        ) : (
          <div className="row side-by-side">
            <div className="center-content">
              <img
                id="face1"
                src=""
                className="margin"
                alt="Face 1"
                width={400}
                height={400}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChanged(e.target.files[0],0)}
              />
            </div>
            <div className="center-content">
              <img
                id="face2"
                src=""
                className="margin"
                alt="Face 2"
                width={400}
                height={400}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChanged(e.target.files[0],1)}
              />
            </div>
            <div className="center-content">
              <img
                id="face3"
                src=""
                className="margin"
                alt="Face 3"
                width={400}
                height={400}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChanged(e.target.files[0],2)}
              />
            </div>
            <div className="center-content">
              <p>Target</p>
              <img
                id="face4"
                src=""
                className="margin"
                alt="Face 4"
                width={400}
                height={400}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => changeTarget(e.target.files[0])}
              />
            </div>
          </div>
        )}
        <div className="row">
          <label htmlFor="distance">Distance:</label>
          <input
            disabled
            value={distance}
            id="distance"
            type="text"
            className="bold"
          />
        </div>
        <div className="row">
            <p>All Distance</p>
            {
                allDistance.map((allDistance, index) => (
                    <p key={index}>{allDistance}</p>
                ))
            }
            
        </div>
      </div>
    </div>
  );
}

export default FaceRecognition;
