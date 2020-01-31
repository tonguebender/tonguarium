const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-west-2' });
AWS.config.setPromisesDependency(Promise);

const docClient = new AWS.DynamoDB.DocumentClient();


const run = async () => {

  return docClient
    .put({
      TableName: 'quizzes',
      Item: {
        id: 'sample-quiz',
        title: 'Sample',
        description: 'Sample quiz',
        items: [
          {
            "type": "text",
            "text": "This is a sample quiz"
          },
          {
            "type": "question",
            "text": "What's 2 x 2?",
            "answers": ["4"]
          },
          {
            "type": "question",
            "text": "What's after D?",
            "answers": ["e"]
          }

        ],
      },
    })
    .promise();
};

run()
  .then(() => console.log('done'));