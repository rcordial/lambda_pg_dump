# lambda_pg_dump
lambda_pg_dump is a NodeJS-based lambda function that runs pg_dump utility to backup a PostgreSQL database and outputs the file to an S3 Bucket. It authenticates to the database by retrieving credentials from an AWS Secrets Manager secret.


# Setting Up
* Create an AWS Secrets Manager secret containing the credentials required by pg_dump

    * `PGHOST`
    * `PGDATABASE`
    * `PGUSER`
    * `PGPASSWORD`
      
* Prepare and create the Lambda function

   * Run `npm install` and zip all files in the directory as the application package to be uploaded. No need to upload it to S3 as the deployment package size (including dependencies) does not exceed 50MB based on current [Lambda limits](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
   * Create the lambda function with a `NodeJS 16.x` runtime, and a new role with basic permissions
   * Upload the deployment package
   * Change the configuration to allocate more memory, storage and longer timeouts depending on the expected data/dump size
   
# Configuring Permissions

   * The lambda function must have just enough permission to write to the s3 bucket and retrieve credentials from the secrets manager. A policy for the function may look something like :
   
```json
"Statement": [
    {
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "<s3 bucker arn>/*",
      "Effect": "Allow",
      "Sid": "AllowS3"
    },
    {
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "<secret arn>",
      "Effect": "Allow",
      "Sid": "AllowSecrets"
    }
]
```
   
# Testing an event

* The function needs the following parameters from an event source :
 ```json
  {
    "SECRET": "<secret arn or name>",
    "REGION": "<aws region>",
    "S3_BUCKET": "<s3 bucket name>",
    "PREFIX": "<optional prefix/folder in s3>"
  }
 ```
* For scheduled / routine invocations, we can invoke the function by using an [AWS EventBridge](https://aws.amazon.com/eventbridge/) rule, for that you need to give EventBridge permissions to invoke the lambda function like :

```json
{
  "Sid": "event-permission",
  "Effect": "Allow",
  "Principal": {
    "Service": "events.amazonaws.com"
  },
  "Action": "lambda:InvokeFunction",
  "Resource": "<lambda function arn>",
  "Condition": {
    "ArnLike": {
      "AWS:SourceArn": "<event bridge arn>"
    }
  }
}

```


   
