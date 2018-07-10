'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'ap-south-1' });
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
    var queryString = event.queryStringParameters;
    var postId = queryString.postId;
    console.log('Test 1');
    console.log(event);
    console.log('Test 2');
    console.log(queryString);
    console.log('Test 3');
    console.log(postId);
    var params;
    if (postId === '*') {
      params = {
        TableName: process.env.DYNAMODB_TABLE
      };
    } else {
      params = {
        TableName: process.env.DYNAMODB_TABLE,
        ExpressionAttributeValues: {
          ":a": {
            postId
          }
        },
        FilterExpression: "Id = :a",
      };
    }
  
    documentClient.scan(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(JSON.stringify(data.Items, null, 2));
        const response = {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
          },
          body: JSON.stringify(data.Items,null,2),
        };
        console.log(response);
        callback(null,response);
      }
    });
  };
