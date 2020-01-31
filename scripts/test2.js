const fs = require('fs');

const all = require('../_data/phrasals-390.json');

const md = fs.readFileSync('./_data/phrasals.md').toString();

const simple = md.split('---\n').map(p => {
  const lines = p.split('\n');
  return {
    word: lines[0].toLowerCase(),
    def: lines[2],
    example: lines[3]
  };
})

const res = simple
  .filter(s => !s.word.includes('(') && !s.word.includes('/') && !all[s.word.toLowerCase().replace(/\s/g, '-')])
  .reduce((res, s) => ({...res, [s.word.replace(/\s/g, '-')]: [s] }), {});

console.log(JSON.stringify(res, null, '  '))


