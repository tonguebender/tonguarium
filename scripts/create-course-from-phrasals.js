const fs = require('fs');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-west-2' });
AWS.config.setPromisesDependency(Promise);

const docClient = new AWS.DynamoDB.DocumentClient();

const verbs = require('../_data/phrasals-390');

function spreadItems(arr, repeats = 3) {
  const len = arr.length;
  let res = [];

  function findAndFill(arr, pos, val) {
    for (let i = pos; i <= Math.max(pos, arr.length); i++) {
      if (!arr[i]) {
        arr[i] = val;
        return;
      }
    }
    throw `err: ${pos} ${val}`;
  }

  for (let i = 0; i < len; i++) {
    findAndFill(res, Math.round(i), arr[i]);
    findAndFill(res, Math.round(i + len * repeats / 6 + i), arr[i]);
    findAndFill(res, Math.round(i + len * repeats / 2 + i), arr[i]);
  }

  return res.filter(Boolean);
}


const run = async () => {
  const slice = Object.keys(verbs).sort(_ => Math.random() > 0.5 ? -1 : 1).splice(0,50);
  const items = spreadItems(slice.map(word => ({
    type: 'text',
    text: `*${word.replace(/-/g, ' ')}*\n\n${verbs[word].map(v => `${v.def}\n_"${v.example}"_`).join('\n\n')}`
  })));

  console.log(items);

  return docClient
    .put({
      TableName: 'courses',
      Item: {
        id: 'phrasal-verbs',
        title: 'Phrasal verbs',
        description: 'Phrasal verbs',
        items,
      },
    })
    .promise();
};

run()
  .then(() => console.log('done'));