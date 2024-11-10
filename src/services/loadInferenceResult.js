const {Firestore} = require('@google-cloud/firestore')
const firestore = new Firestore()
const POOLING_INTERVAL = 1000

async function inferenceResult(id){
    return new Promise((resolve,reject) => {
        const interval = setInterval(async () => {
            const doc = await firestore.collection('prediction').collection('calories').doc(id).get()
            if(doc.exists){
                clearInterval(interval)
                resolve(doc.data())
            }
        },POOLING_INTERVAL)

        setTimeout(() => {
            clearInterval(interval)
            reject('Timed Out')
        },60000)      
    })
}

module.exports = {inferenceResult}