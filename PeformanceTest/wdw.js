let AWS = require('aws-sdk');
const sns = new AWS.SNS();

exports.handler = function(event, context, callback) {
    
    sns.subscribe({
        Protocol: 'sms',
        Endpoint: phone,
        TopicArn: 'arn:aws:sns:us-east-1:318300609668:signal-f1'
    });

    callback(null, {"message": "Successfully executed"});
}