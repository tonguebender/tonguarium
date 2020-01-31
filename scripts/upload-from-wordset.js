const AWS = require('aws-sdk');

const fs = require('fs');
const path = require('path');
const getIPAs = require('./get-ipa');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);

const TABLE = 'tongues';
const TONGUE = 'en-def';

AWS.config.update({ region: 'eu-west-2' });
AWS.config.setPromisesDependency(Promise);

const docClient = new AWS.DynamoDB.DocumentClient();

const WS_PATH = process.env.WORDSET_DICT || `/Users/dosyara/sandbox/wordset-dictionary/data`;

const ipas = getIPAs();

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

console.log('Start uploading');
processWordsetDir({ dataDir: WS_PATH, callback: async (items) => {
      return batchWrite(items);
    }
  })
  .then(() => {
    console.log('ok');
  }, err => {
    console.log(err);
  });

function processWordsetDir({ dataDir, callback }) {
  return readdir(dataDir)
    .then(files => {
      console.log(files);

      function seqIt(files) {
        if (!files.length) return Promise.resolve();

        const file = files.shift();

        return processWordsetFile({ filePath: path.resolve(dataDir, file), callback })
          .then(() => seqIt(files))
      }

      return seqIt(files);
    });
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

function processWordsetFile({ filePath, callback }) {
  console.log('processWordsetFile',filePath);

  return readfile(filePath).then(data => {
    const wordsData = JSON.parse(data.toString());
    const words = Object.keys(wordsData);

    function batchIt(words, callback) {
      if (!words.length) return Promise.resolve();

      console.log(words.length);
      return Promise.all([
        callback(words.splice(0, 25).map((word) => ({
          PutRequest: {
            Item: {
              pk: word,
              sk: TONGUE,
              ...getDynamoFriendlyValue({
                ipa: ipas[word],
                def: (wordsData[word].meanings || []).map(({ def, speech_part, synonyms, example }) => ({ word, def, speech_part, synonyms, example }))
              })
            }
          }
        })))
      ])
        .then(() => {
          console.log('✔');
          return delay(1000).then(() => batchIt(words, callback));
        }, err => {
          console.log('batchProcess Error: ', err);
          return batchIt(words, callback);
        });
    }

    return batchIt(words, callback);
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