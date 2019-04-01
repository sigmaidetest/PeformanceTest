let AWS = require('aws-sdk');
const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB.DocumentClient();
const phoneLib = require('phone');
const middy = require('middy');
const { urlEncodeBodyParser, validator, httpErrorHandler } = require('middy/middlewares');

const addContact = async (contactID, phone, phoneCountry) => {
    return ddb.put({
        TableName: 'signal-db',
        Item: {
            'id': contactID,
            'phone': phone,
            'country': phoneCountry,
            'time': Date.now()
        }
    });
}

const sesSubscribe = async (phone, phoneCountry) => {
    sns.subscribe({
        Protocol: 'sms',
        Endpoint: phone,
        TopicArn: 'arn:aws:sns:us-east-1:318300609668:signal-f1'
    });

};

exports.handler = async (event) => {

    let phone = event['phone'];
    let phoneCountry = phoneLib(phone)[1] || '';

    sns.subscribe({
        Protocol: 'sms',
        Endpoint: phone,
        TopicArn: 'arn:aws:sns:us-east-1:318300609668:signal-f1'
    });

    if (phone.length && phoneCountry.length) {

        let subscribe = await sesSubscribe(phone, phoneCountry);
        console.log("test");
        await addContact(subscribe.SubscriptionArn, phone, phoneCountry)

        return sesSubscribe(phone, phoneCountry).then(data => addContact(data.SubscriptionArn, phone, phoneCountry))
            .then(data => {
                callback(null, { "message": "Success" });
            }).catch(err => {
                callback(null, { "message": err });
            });

    } else {
        let response = {
            status: 400,
            message: "Error: The Phone Number is not valid, try adding your country prefix (Example +1)"
        };
        return JSON.stringify(response);
    }
}