
const { exec } = require('child_process')
const path = require('path');
const binPath = path.join(__dirname, '../bin');
const pgDumpPath = path.join(binPath, 'pg_dump');
const fs = require('fs');


async function pgdump(event, secret) {

    return new Promise(async (resolve,reject) => {

        // set file name, file path
        let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(' ','_');
        
        // optional plain parameter to output plain sql file
        let format = event.PLAIN? '.sql' : '.backup';
        let args = event.PLAIN? '' : '-Fc -Z1';
        
        let fileName = `${secret.PGDATABASE}-${date}${format}`;
        let filePath = path.join('/tmp', `${secret.PGDATABASE}-${date}${format}`)

        // spawn child process to execute pg_dump
        let child = exec(`${pgDumpPath} ${args}> ${filePath}`,{
            env: {
                LD_LIBRARY_PATH: binPath,
                PGDATABASE: secret.PGDATABASE,
                PGUSER: secret.PGUSER,
                PGPASSWORD: secret.PGPASSWORD,
                PGHOST: secret.PGHOST,
            }
        });

        // catch error output
        child.stderr.on('data', data => {
            error = data;
        });

        // when child process exits
        child.on('close', code => {

            if(code !== 0){
                return reject(new Error(`pg_dump failed: ${error}`));
            }

            if(event.PLAIN){

                // check the dump complete message at end of file
                exec(`tail -n 3 ${filePath}`,  (error, stdout, stderr) => {
                    
                    if(stdout.toLowerCase().includes('postgresql database dump complete')){
                        // correct output, if expected string is found at the last set of lines of plaintext file 
                        return resolve({
                            fileName,filePath
                        });
                    }else{
                        return reject(new Error(`pg_dump failed, unexpected error`));
                    }

                });

            }else{

                // check the PGDMP string to test whether pgdump wrote the correct file
                exec(`head -n 1 ${filePath}`,  (error, stdout, stderr) => {
                    
                    if(stdout.startsWith('PGDMP')){
                        // correct output, if expected string is found at the first line of the file 
                        return resolve({
                            fileName,filePath
                        });
                    }else{
                        return reject(new Error(`pg_dump failed, unexpected error`));
                    }

                });
                
            }

        });

    });

}

module.exports = pgdump;