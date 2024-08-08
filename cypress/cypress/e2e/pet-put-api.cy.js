import { faker } from '@faker-js/faker';

describe('put method validation Tests', function () {
    const apiUrl = `${Cypress.config('baseUrl')}/pet`;

    const TestCases = [
        { property: 'id', value: 'invalid-id', message: 'something bad happened', expectedStatusCode: 500 },
        { property: 'name', value: 'testingscenarios', message: 'Invalid name supplied', expectedStatusCode: 200 },
        { property: 'status', value: 'unknown', message: 'Invalid status supplied', expectedStatusCode: 200 },
        { property: 'photoUrls', value: ['235232'], message: 'Invalid photoUrls supplied', expectedStatusCode: 200 },
        { property: 'tags', value: [{ id: 'sf', name: '0000' }], message: 'something bad happened', expectedStatusCode: 500 },
        { property: 'category', value: { id: 'unknow', name: '' }, message: 'something bad happened', expectedStatusCode: 500 }
    ];

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

    it('should add pet successfully', function () {       
        const pet = this.pet;
        cy.task('log', `\nSending POST request to ${apiUrl} with body: ${JSON.stringify(pet, null, 2)}`);
        cy.request('POST', apiUrl, pet).then((postResponse) => {
            cy.task('log', '\nRaw post response: ' + JSON.stringify(postResponse, null, 2));
            expect(postResponse.status).to.eq(200);
        });        
    });   

    TestCases.forEach(({ property, value, message, expectedStatusCode }) => {            
        it(`should update the pet with invalid ${property}`, function () {              
            const pet = { ...this.pet, [property]: value };
            cy.task('log', `\nSending PUT request to ${apiUrl} with body: ${JSON.stringify(pet, null, 2)}`);
            cy.request({
                method: 'PUT',
                url: apiUrl,
                body: pet,
                failOnStatusCode: false
            }).then((putResponse) => {
                cy.task('log', '\nRaw put response: ' + JSON.stringify(putResponse, null, 2))
                .then(() => {
                    try {
                    expect(putResponse.status).to.eq(expectedStatusCode);
                    if (putResponse.status !== 200) {
                        expect(putResponse.body).to.have.property('message', message);
                    } else {
                        if (Array.isArray(value)) {
                        expect(putResponse.body).to.have.property(property).that.deep.equals(value);
                        } else {
                        expect(putResponse.body).to.have.property(property, value);
                        }
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

    it('should return 405 for invalid HTTP method', function () {
        const pet = this.pet;

        cy.task('log', `\nSending PUT request to ${apiUrl}/1 with body: ${JSON.stringify(pet, null, 2)}`);
        cy.request({
            method: 'POST',
            url: `${apiUrl}/1`,
            body: pet,
            failOnStatusCode: false
        }).then((response) => {
            cy.task('log', '\nRaw post response: ' + JSON.stringify(response, null, 2))
    .then(() => {
        try {
            expect(response.status).to.eq(415);
            expect(response.body).to.have.property('message', 'Method Not Allowed');
        } catch (error) {
            // Handle the exception
            cy.log('An error occurred:', error.message);
            throw error; // Re-throw the error to fail the test
        }
    });
        });
    });
});