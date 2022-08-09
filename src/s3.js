const { S3 } = require("@aws-sdk/client-s3");
const fs = require('fs');

function uploadToS3(event, fileObject) {

    return new Promise(async (resolve,reject)=>{

        // optional s3 prefix parameter, if not, then use bucket root
        event.PREFIX = event.PREFIX? event.PREFIX+'/' : '';

        // upload the backup file to S3 bucket
        let s3 = new S3({
            region: event.REGION
        });

        let params = {
            Bucket: event.S3_BUCKET,
            Key: `${event.PREFIX}${fileObject.fileName}`,
            Body: fs.createReadStream(fileObject.filePath)
        };

        s3.putObject(params).then((output) => {
            return resolve({
                bucket: params.Bucket,
                key: params.Key,
                region: event.REGION,
            });
        }).catch(err => {
            return reject(err);
        });

    });

}

module.exports = uploadToS3;
