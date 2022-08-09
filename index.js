
const pgDump = require('./src/pg_dump');
const uploadToS3 = require('./src/s3');
const getSecrets = require('./src/secrets');

exports.handler = async (event) => {
    
    try {

        if(!event.S3_BUCKET){
            throw Error('S3_BUCKET not provided in the event data')
        }
        if (!event.REGION) {
            throw Error('REGION not provided in the event data')
        }
        if (!event.SECRET) {
            throw Error('SECRET not provided in the event data')
        }

        let dbSecrets = await getSecrets(event);

        let dumpResult = await pgDump(event, dbSecrets);

        let result = await uploadToS3(event,dumpResult);

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    }
    catch (error) {
        console.log('err',error);
        return error;
    }
    
};