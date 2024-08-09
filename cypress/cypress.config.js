const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'https://petstore.swagger.io/v2',
        screenshotOnRunFailure: false,
        video: false,
        setupNodeEvents(on, config) {
            on('task', {
                log(message) {
                    console.log(message);
                    return null;
                },
                writeResponseToFile({ fileName, data }) {
                    const filePath = path.join(__dirname, 'cypress', 'logs', fileName);
                    fs.writeFileSync(filePath, data, 'utf8');
                    return null;
                }
            });
        },
    },
});
