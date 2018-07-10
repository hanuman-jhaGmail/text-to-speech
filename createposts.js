'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region:'ap-south-1'});
const documentClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

module.exports.create = (event, context, callback) => {
  var recordId = uuidv4();
  const eventBody = JSON.parse(event.body);
  var voiceVar = eventBody.voice;
  var textVar = eventBody.text;

   var paramsDb = {
    Item: {
      Id: recordId,
      text: textVar,
      voice: voiceVar,
      process_status: 'PROCESSING'
    },
    TableName: process.env.DYNAMODB_TABLE
  };

  documentClient.put(paramsDb, function(err, data) {
    if (err) {
     console.log(err, err.stack); // an error occurred
    }
    else {    
     console.log(data);           // successful response
     console.log('Record saved in database');
    }
  });
  const split = context.invokedFunctionArn.split(':');
  var topic = `arn:aws:sns:${split[3]}:${split[4]}:${process.env.SNS_TOPIC}`;
  console.log('Print Topic ');
  console.log(topic);
  var paramsSns = {
    Message: recordId, /* required */
    TopicArn: topic
  };

  console.log('Print sns param');
  console.log(paramsSns);
  sns.publish(paramsSns, function(err, data) {
    if (err){ 
        console.log(err, err.stack); // an error occurred
    }
    else{     
        console.log(data);           // successful response
        console.log('Published to SNS');
    }
  });

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
    },
    body: JSON.stringify({recordId: recordId}),
  };
  console.log(response);
  callback(null,response);
};

/* Unique Post id generator */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}