const fs = require('fs'),
    readline = require('readline'),
    Stream = require('stream'),
    Promise = require('promise'),
    WordArticle = require('./src/models/word_article'),
    WordClass = require('./src/models/word_class'),
    Dictionary = require('./src/models/dictionary');

let ARTICLE_DER_ID = '';
let ARTICLE_DIE_ID = '';
let ARTICLE_DAS_ID = '';
let WORD_CLASS_NOUN = '';

const articles = [
    { name: 'Der'},
    { name: 'Die'},
    { name: 'Das'},
];

const classes = [
    {name: 'noun'}
];

const promises = [];

articles.forEach((article) => {
    const art = new WordArticle();
    art.name = article.name;
    promises.push(art.save())
});

classes.forEach((wclass) => {

    const wc = new WordClass();
    wc.name = wclass.name;
    promises.push(wc.save())
});

Promise
    .all(promises)
    .then((res) => {

        ARTICLE_DER_ID = res[0]._id;
        ARTICLE_DIE_ID = res[1]._id;
        ARTICLE_DAS_ID = res[2]._id;
        WORD_CLASS_NOUN = res[3]._id;

        const articlesMap = {
            '{f}':  ARTICLE_DIE_ID,
            '{m}':  ARTICLE_DER_ID,
            '{n}':  ARTICLE_DAS_ID,
            '{pl}':  ARTICLE_DIE_ID,
        };

        insert(articlesMap, WORD_CLASS_NOUN);

    })
    .catch((err) => console.log('err %s', err));
return true;

function insert(articlesMap, wordClass){

    const inStream = fs.createReadStream('./de-en.txt', 'utf8');
    const outStream = new Stream();
    const rl = readline.createInterface(inStream, outStream);

    let lines = 1;
    rl.on('line', (line) => {

        console.log('Line Done %s', lines++);
        const lineParts = line.split(' :: ');

        if(lineParts.length !== 2) {
            console.log('ERRRRRR: invalid data %s', line);
            return false;
        }

        const de = lineParts[0],
            en = lineParts[1];

        const matches = detect(de);

        if (matches.length === 0) {
            console.log('ERRRRRR: No matches %s', line);
            return false;
        }


        matches.forEach((match) => {

            const row = new Dictionary();
            row.word = match[0].trim();
            row.class = wordClass;
            row.article = articlesMap[match[1].trim()];
            row.singular = match[1].trim() !== '{pl}';

            if (!row.article) {
                console.log('ERRRRRR: No article %s', match);
                return false;
            }
            row.save();
        });

        // const enParts = en.split('|');
        //
        // if (enParts.length !== matches.length) {
        //     console.log('not matched %s <==> %s', JSON.stringify(matches), JSON.stringify(enParts));
        //     console.log('\n$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n');
        //     return false;
        // }
    });

    inStream.on('end', () => {
        inStream.close();
        outStream.close();
    })
}




function detect(str) {

    const regex = /([\u00C0-\u017F a-zA-Z]+) (\{[mnplf]+\})/g;
    let m;

    let result = [];
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if(m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        let group = [];
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {

            if (groupIndex != 0){
                group.push(match);
            }

            if(groupIndex == 2) {

                result.push(group);
                group = [];
            }
        });
    }

    return result;
}