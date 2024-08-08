describe('get method findByStatus validation Tests', function () {
    const apiUrl = `${Cypress.config('baseUrl')}/pet/findByStatus?status=`;

    const TestCases = [
        {
            description: 'should return pets with status available',
            method: 'GET',
            url: `${apiUrl}available`,
            expectedStatusCode: 200,
            expectedProperty: 'status',
            expectedValue: 'available'
        },
        {
            description: 'should return pets with status pending',
            method: 'GET',
            url: `${apiUrl}pending`,
            expectedStatusCode: 200,
            expectedProperty: 'status',
            expectedValue: 'pending'
        },
        {
            description: 'should return pets with status sold',
            method: 'GET',
            url: `${apiUrl}sold`,
            expectedStatusCode: 200,
            expectedProperty: 'status',
            expectedValue: 'sold'
        },
        {
            description: 'should return 400 for an invalid status',
            method: 'GET',
            url: `${apiUrl}invalidstatus`,
            expectedStatusCode: 400,
            expectedProperty: 'message',
            expectedValue: 'Invalid status value'
        },
        {
            description: 'should return 400 for an empty status',
            method: 'GET',
            url: `${apiUrl}`,
            expectedStatusCode: 400,
            expectedProperty: 'message',
            expectedValue: 'Invalid status value'
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
                return cy.task('log', `\nResponse: ${JSON.stringify(response, null, 2)}`).then(() => {
                    try {
                        expect(response.status).to.eq(expectedStatusCode);
                        if (expectedStatusCode === 200) {
                            expect(response.body).to.be.an('array');
                            response.body.forEach(pet => {
                                expect(pet.status).to.equal(expectedValue);
                            });
                        } else {
                            expect(response.body).to.have.property(expectedProperty, expectedValue);
                        }
                    } catch (error) {
                        // Handle the exception
                        cy.log('An error occurred:', error.message);
                        throw error; // Re-throw the error to fail the test
                    }
                });
            });
        });
    });
});