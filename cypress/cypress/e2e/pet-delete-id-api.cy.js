describe('delete method validation Tests', function () {
    const apiUrl = `${Cypress.config('baseUrl')}/pet`;

    const TestCases = [
        {
            description: 'delete method validation with invalid id (NumberFormatException)',
            method: 'DELETE',
            url: `${apiUrl}/325353252432453453534534`,
            expectedStatusCode: 404,
            expectedProperty: 'message',
            expectedValue: 'java.lang.NumberFormatException: For input string: "325353252432453453534534"'
        },
        {
            description: 'delete method validation with invalid id (empty id)',
            method: 'DELETE',
            url: `${apiUrl}/ `,
            expectedStatusCode: 405
        }
    ];
    
    TestCases.forEach((testCase) => {
        it(testCase.description, function () {
            cy.task('log', `\nSending DELETE request to delete a pet - { url: ${testCase.url }`).then(() => {
                return cy.request({
                    method: testCase.method,
                    url: testCase.url,
                    failOnStatusCode: false
                });
            }).then((response) => {
                return cy.task('log', '\nRaw delete response: ' + JSON.stringify(response)).then(() => {
                    try {
                        expect(response.status).to.eq(testCase.expectedStatusCode);
                        if (response.status !== 405) {
                            expect(response.body).to.have.property(testCase.expectedProperty, testCase.expectedValue);
                        }
                    } catch (error) {
                        throw new Error(`Request failed: ${error.message}`);
                    }
                });
            });
        });
    });
});