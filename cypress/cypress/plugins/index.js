// cypress/plugins/index.js

const fs = require('fs');
const path = require('path');

module.exports = (on, config) => {
    on('task', {
        log(message) {
            console.log(message);
            return null;
        },
        writeResponseToFile({ fileName, data }) {
            const filePath = path.join('cypress', 'logs', fileName);
            fs.writeFileSync(filePath, data, 'utf8');
            return null;
        }
    });
};