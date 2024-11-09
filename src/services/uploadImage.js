const { Storage } = require('@google-cloud/storage');
const InputError = require('../exceptions/InputError');

const storage = new Storage();

async function upload(bucketName, id, image, type){
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`test/${id}.${type.ext}`);

    await file.save(image, {
      metadata: {
        contentType: `${type.mime}`,
      },
    });
  } catch (e) {
    throw new InputError(`Failed To Upload Images:${e.message}`);
  }
}

module.exports = { upload };