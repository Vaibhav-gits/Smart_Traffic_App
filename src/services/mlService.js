// backend/src/services/mlService.js
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

// Load ML model (example: helmet detection model)
let model;
const loadModel = async () => {
  if (!model) {
    model = await tf.loadGraphModel(
      'file://' + path.join(__dirname, '../../models/helmet_model/model.json')
    );
  }
  return model;
};

// Predict function
const predictViolation = async (imageBuffer) => {
  try {
    const model = await loadModel();
    
    // Convert buffer to tensor
    const imageTensor = tf.node.decodeImage(imageBuffer, 3)
      .resizeNearestNeighbor([224, 224])
      .expandDims(0)
      .toFloat()
      .div(tf.scalar(255));

    const prediction = model.predict(imageTensor);
    const result = prediction.dataSync(); // Example output
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('ML prediction failed');
  }
};

module.exports = { predictViolation };
