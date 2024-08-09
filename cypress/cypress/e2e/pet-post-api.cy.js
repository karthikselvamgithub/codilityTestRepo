describe('post method validation Tests', function () {
    const apiUrl = `${Cypress.config('baseUrl')}/pet`;

    const TestCases = [
        {
            description: 'should return 400 for missing required fields',
            method: 'POST',
            url: apiUrl,
            body: {},
            expectedStatusCode: 400,
            expectedProperty: 'message',
            expectedValue: 'Invalid input'
        },
        {
            description: 'should return 400 for invalid data types',
            method: 'POST',
            url: apiUrl,
            body: { id: 'invalid-id', name: 12345, status: true },
            expectedStatusCode: 500,
            expectedProperty: 'message',
            expectedValue: 'something bad happened'
        },
        {
            description: 'should return 405 for invalid HTTP method',
            method: 'PUT',
            url: apiUrl,
            body: { id: 1, name: 'Doggie', status: 'available' },
            expectedStatusCode: 405,
            expectedProperty: 'message',
            expectedValue: 'Method Not Allowed'
        }
    ];

    TestCases.forEach(({ description, method, url, body, expectedStatusCode, expectedProperty, expectedValue }) => {
        it(description, function () {
            cy.task('log', `\nSending ${method} request to ${url} with body: ${JSON.stringify(body, null, 2)}`);
            cy.request({
                method: method,
                url: url,
                body: body,
                failOnStatusCode: false
            }).then((response) => {
                cy.task('log', '\nRaw post response: ' + JSON.stringify(response))
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