const { Storage } = require("@google-cloud/storage");

const storage = new Storage()

async function getOrCreateBucket(bucketName){
    const bucket = storage.bucket(bucketName)
    try{
        const [metadata] = await bucket.getMetadata()
        console.log(`Bucket ${metadata.name} sudah tersedia`)
        return bucket
    } catch (e){
        const optionsCreateBucket = {
            location:'ASIA-SOUTHEAST2'
        }

        await storage.createBucket(bucketName,optionsCreateBucket)
        console.log(`${bucket.name} Succesfully created`)
        return bucket
    }
}

async function upload(bucket,id,image){
    try {
        const customMetadata = {
            contentType : 'image/jpeg',
            metadata : {
                type:"prediction image"
            }
        }

        const optionsUploadObject = {
            destination:`image/${id}`,
            preconditionOpts: {ifGenerationMatch:0},
            metadata:customMetadata
        }

        await storage.bucket(bucket).upload(image,optionsUploadObject)
        console.log(`${filePath} uploaded to ${bucketName} bucket`)
    } catch (e) {
        console.log(`Gagal Mengupload ${filePath}`,e.message)
    }
}

module.exports = {getOrCreateBucket, upload}
// getOrCreateBucket(bucketName).then(result => upload(result)).catch(e => e.message)