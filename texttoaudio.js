'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'ap-south-1' });
const documentClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const polly = new AWS.Polly();

module.exports.texttoaudio = (event, context, callback) => {
    const message = event.Records[0].Sns.Message;
    var postId = message;
    console.log('Test 1');
    console.log(process.env.DYNAMODB_TABLE);
    
    var params = {
      TableName: process.env.DYNAMODB_TABLE,
      KeyConditionExpression: 'Id = :v1',
      ExpressionAttributeValues: {
        ':v1': postId
      }
    };
    console.log('Test 2');
    console.log(params);
    documentClient.query(params, function (err, data) {
      if (err) {
        console.log('Test 3');
        console.log(err, err.stack); // an error occurred
      } else {
        var outText = data.Items[0].text;
        var outVoice = data.Items[0].voice;
        var objectNameMp3 = postId + '.mp3';
        var pollyParams = {
          OutputFormat: "mp3",
          SampleRate: "8000",
          Text: outText,
          TextType: "text",
          VoiceId: outVoice
        };
  
        polly.synthesizeSpeech(pollyParams, function (err, data) {
          if (err) {
            console.log('Something Wrong in polly');
            console.log(err, err.stack);
          } else {
            var uploadParam = {
              Bucket: process.env.BUCKET_NAME,
              Key: objectNameMp3,
              Body: data.AudioStream,
              ContentType: 'audio/mpeg',
              StorageClass: 'STANDARD'
            };
            s3.upload(uploadParam, function (err, data) {
              if (err) {
                console.log('Not able to upload mp3 file to S3');
                console.log(err, err.stack);
              } else {
                console.log('Speech file upload successfully to S3 bucket.');
              }
            });
          }
        });
      }
    });
  
    var urlBegining = 'https://s3.ap-south-1.amazonaws.com/';
    var mp3Url = urlBegining + process.env.BUCKET_NAME + '/' + postId + '.mp3';
    var paramsUpdateDb = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        'Id': postId
      },
      UpdateExpression: 'set process_status = :r, Audiourl=:p',
      ExpressionAttributeValues: {
        ':r': 'UPDATED' ,
        ':p': mp3Url 
      },
      ReturnValues: "UPDATED_NEW"
    };
    console.log(paramsUpdateDb);
    documentClient.update(paramsUpdateDb, function (err, data) {
      if (err) {
        console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
      } else {
        console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
      }
    });
  
  };
