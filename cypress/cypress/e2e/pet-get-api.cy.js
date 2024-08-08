describe('get method validation Tests', function () {
    const apiUrl = `${Cypress.config('baseUrl')}/pet`;

    const TestCases = [
        {
            description: 'should return 404 for a non-existent pet',
            method: 'GET',
            url: `${apiUrl}/142355142355142355142355142355142355`,
            expectedStatusCode: 404,
            expectedProperty: 'message',
            expectedValue: 'java.lang.NumberFormatException: For input string: "142355142355142355142355142355142355"'
        },
        {
            description: 'should return 404 for an invalid pet ID',
            method: 'GET',
            url: `${apiUrl}/00000000`,
            expectedStatusCode: 404,
            expectedProperty: 'message',
            expectedValue: 'Pet not found'
        }
    ];

    TestCases.forEach(({ description, method, url, expectedStatusCode, expectedProperty, expectedValue }) => {
        it(description, function () {
            cy.task('log', `\nSending ${method} request to ${url}`);
            cy.request({
                method: method,
                url: url,
                failOnStatusCode: false
            }).then((response) => {
                cy.task('log', `\nRaw response body: ${JSON.stringify(response.body, null, 2)}`)
                    .then(() => {
                        try {
                            expect(response.status).to.eq(expectedStatusCode);
                            expect(response.body).to.have.property(expectedProperty, expectedValue);
                        } catch (error) {
                            // Handle the exception
                            cy.log('An error occurred:', error.message)
                                .then(() => {
                                    throw error; // Re-throw the error to fail the test
                                });
                        }
                    });
            });
        });
    });
});