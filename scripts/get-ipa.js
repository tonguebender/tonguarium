const fs = require('fs');

function getIPA(row) {
  const [ id, phones ] = row.split('\t');
  const ipa = phones && phones.split(' ').map(phone => phoneToChar(phone)).join('');

  return {
    id: id.toLowerCase(),
    ipa
  };
}

function phoneToChar(phone) {
  return {
    AA: 'ɑ',
    AE: 'æ',
    AH: 'ʌ',
    AO: 'ɔ',
    AW: 'aʊ',
    AX: 'ə',
    AY: 'aɪ',
    EH: 'ɛ',
    ER: 'ɝ',
    EY: 'eɪ',
    IH: 'ɪ',
    IX: 'ɨ',
    IY: 'i',
    OW: 'oʊ',
    OY: 'ɔɪ',
    UH: 'ʊ',
    UW: 'u',
    B:'b',
    CH:'tʃ',
    D:'d',
    DH:'ð',
    DX:'ɾ',
    EL:'l̩',
    EM:'m̩',
    EN:'n̩',
    F:'f',
    G:'ɡ',
    HH:'h',
    JH:'dʒ',
    K:'k',
    L:'l',
    M:'m',
    N:'n',
    P:'p',
    Q:'ʔ',
    R:'ɹ',
    S:'s',
    SH:'ʃ',
    T:'t',
    TH:'θ',
    V:'v',
    W:'w',
    WH:'ʍ',
    Y:'j',
    Z:'z',
    ZH:'ʒ',
  }[phone];
}

module.exports = () => {
  const file = fs.readFileSync('./_data/ipa.txt').toString();
  const rows = file.split('\n');

  return rows.reduce((res, row)=> {
    let { id, ipa } = getIPA(row);
    const match = id.match(/(.+)\(.+\)/);

    if (match && match[1]) {
      id = match[1];
    }

    res[id] = res[id] ? `${res[id]}/${ipa}` : ipa;

    return res;
  }, {});
};
