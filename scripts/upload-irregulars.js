const AWS = require('aws-sdk');

const fs = require('fs');

const TABLE = 'tongues';
const TONGUE = 'en-irregular-verbs';

AWS.config.update({ region: 'eu-west-2' });
AWS.config.setPromisesDependency(Promise);

const docClient = new AWS.DynamoDB.DocumentClient();

async function batchWrite(items, retries = 3) {
  try {
    return await docClient.batchWrite({
      RequestItems: {[TABLE]: items}
    }).promise();
  } catch (e) {
    if (retries) {
      console.log(`Retry ${retries}`);
      return batchWrite(items, retries - 1);
    }
    console.log('Error: ', e);
  }
}

function batchIt(items) {
  if (!items.length) return Promise.resolve();

  console.log(items.length);
  return Promise.all([
    batchWrite(items.splice(0, 25).map((item) => ({
      PutRequest: {
        Item: item
      }
    })))
  ])
    .then(() => {
      console.log('✔');
      return delay(1000).then(() => batchIt(items));
    }, err => {
      console.log('batchProcess Error: ', err, items);
      return batchIt(items);
    });
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

function getDynamoFriendlyValue(val) {
  if (typeof val === 'object' && !Array.isArray(val)) {
    let res = {};
    for (let key in val) {
      if (val.hasOwnProperty(key) && val[key]) {
        res[key] = getDynamoFriendlyValue(val[key]);
      }
    }
    return res;
  } else if (Array.isArray(val)) {
    return val.map(getDynamoFriendlyValue);
  } else {
    return val;
  }
}

async function run() {
  console.log('start');
  const file = fs.readFileSync('./_data/irregulars.md').toString();
  const lines = file.split('\n');

  const items = lines.map(l => {
    const [word, pastSimple, pastParticiple, comment] = l.split('\t');
    return {
      pk: word,
      sk: TONGUE,
      ...getDynamoFriendlyValue({
        pastSimple,
        pastParticiple,
        comment,
      }),
    }
  });

  await batchIt(items);

  console.log('done');
}

run();