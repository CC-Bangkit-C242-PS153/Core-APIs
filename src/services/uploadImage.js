const { Storage } = require('@google-cloud/storage');
const InputError = require('../exceptions/InputError');

const storage = new Storage();

// Save Image to Cloud Storage to be able to do inference on MLs APIs
async function uploadImageInference(bucketName, inferenceId, image, type){
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`prediction/${inferenceId}.${type.ext}`);

    await file.save(image, {
      metadata: {
        contentType: `${type.mime}`,
      },
    });
  } catch (e) {
    throw new InputError(`Failed To Upload Images:${e.message}`);
  }
}

module.exports = { uploadImageInference };