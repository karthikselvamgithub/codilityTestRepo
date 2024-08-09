import { faker } from '@faker-js/faker';

describe('post method byId validation Tests', function () {
    const apiUrl = `${Cypress.config('baseUrl')}/pet`;

    beforeEach(function () {
        cy.fixture('pet-template.json').as('petData');
        cy.get('@petData').then((petData) => {
            if (!petData || !petData.firstValidPet) {
                throw new Error('Fixture data is not loaded correctly or does not contain firstValidPet');
            }
            const pet = petData.firstValidPet;
            pet.id = faker.datatype.number(1000) + faker.date.recent().getTime();
            pet.name = `${pet.name}-${pet.id}`;
            this.pet = pet;
        });
    });

    const TestCases = [
        {
            description: 'should return 415 for missing required fields',
            method: 'POST',
            body: {},
            expectedStatusCode: 415,
            expectedProperty: 'message',
            expectedValue: 'Invalid input'
        },
        {
            description: 'should return 415 for invalid data types',
            method: 'POST',
            body: { id: 'invalid-id', name: 12345, status: true },
            expectedStatusCode: 500,
            expectedProperty: 'message',
            expectedValue: 'something bad happened'
        },
        {
            description: 'should return 405 for invalid HTTP method',
            method: 'PUT',
            body: { id: 1, name: 'Doggie', status: 'available' },
            expectedStatusCode: 405,
            expectedProperty: 'message',
            expectedValue: 'Method Not Allowed'
        }
    ];

    TestCases.forEach(({ description, method, body, expectedStatusCode, expectedProperty, expectedValue }) => {
        it(description, function () {
            const pet = this.pet;
            cy.task('log', `\nSending ${method} request to ${apiUrl}/${pet.id} with body: ${JSON.stringify(body, null, 2)}`)
                .then(() => {
                    cy.request({
                        method: method,
                        url: `${apiUrl}/${pet.id}`,
                        body: body,
                        failOnStatusCode: false
                    }).then((response) => {
                        cy.task('log', '\nRaw post response: ' + JSON.stringify(response, null, 2))
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

    it('should create a new pet and validate the response', function () {
        const pet = this.pet;
        cy.task('log', `\nSending POST request to ${apiUrl}/${pet.id} with body: ${JSON.stringify(pet, null, 2)}`);
        cy.request('POST', `${apiUrl}/${pet.id}`, pet).then((postResponse) => {
            expect(postResponse.status).to.eq(200);
            cy.task('log', '\nRaw post response: ' + JSON.stringify(postResponse, null, 2));
            expect(postResponse.body).to.have.property('id').eq(pet.id);
            expect(postResponse.body).to.have.property('category').that.includes({ id: pet.category.id, name: pet.category.name });
            expect(postResponse.body).to.have.property('name', pet.name);
            expect(postResponse.body).to.have.property('photoUrls').that.includes(pet.photoUrls[0]);
            expect(postResponse.body).to.have.property('tags').that.deep.includes({ id: pet.tags[0].id, name: pet.tags[0].name });
            expect(postResponse.body).to.have.property('status', pet.status);
        });
    });
});