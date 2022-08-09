
const { SecretsManager } = require('@aws-sdk/client-secrets-manager');

function getSecrets(event){

    return new Promise((resolve,reject) => {

        // get the sm secret
        let ssm = new SecretsManager({
            region: event.REGION
        });

        ssm.getSecretValue({
            SecretId: event.SECRET
        }).then(output => {
            return resolve(JSON.parse(output.SecretString));
        }).catch(err => {
            return reject(err);
        });
        
    });

}

module.exports = getSecrets;