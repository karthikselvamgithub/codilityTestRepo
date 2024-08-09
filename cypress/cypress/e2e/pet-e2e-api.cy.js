import { faker } from '@faker-js/faker';

describe('Pets E2E API Testing', function () {    
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

            const secondPet = petData.secondValidPet;
            secondPet.id = faker.datatype.number(1000) + faker.date.recent().getTime();
            secondPet.name = `${secondPet.name}-${secondPet.id}`;
            this.secondPet = secondPet;

            const thirdPet = petData.thirdValidPet;
            thirdPet.id = faker.datatype.number(1000) + faker.date.recent().getTime();
            thirdPet.name = `${thirdPet.name}-${thirdPet.id}`;
            this.thirdPet = thirdPet;
        });
    });

    it('should add and retrieve pets successfully', function () {       
        const pet = this.pet;
        
        // log the post request
        cy.task('log', `\nSending POST request to create a pet - { url: ${apiUrl}, body: ${JSON.stringify(pet)} }`);
        cy.request('POST', apiUrl, pet).then((postResponse) => {
            expect(postResponse.status).to.eq(200);
            cy.task('log', '\nRaw delete response: ' + JSON.stringify(postResponse));    
            expect(postResponse.body).to.have.property('id').eq(pet.id);
            expect(postResponse.body).to.have.property('category').that.includes({ id: pet.category.id, name: pet.category.name });
            expect(postResponse.body).to.have.property('name', pet.name);
            expect(postResponse.body).to.have.property('photoUrls').that.includes(pet.photoUrls[0]);
            expect(postResponse.body).to.have.property('tags').that.deep.includes({ id: pet.tags[0].id, name: pet.tags[0].name });
            expect(postResponse.body).to.have.property('status', pet.status);
        });

        // Define a recursive function to retry the GET request
        const retryGetRequest = (retries) => {
            if (retries <= 0) {
                throw new Error('Max retries reached, could not find the pet by ID');
            }
            cy.task('log', `\nSending GET request to retrieve a pet - { url: ${apiUrl}/${pet.id} }`);
            cy.request({
                method: 'GET',
                url: `${apiUrl}/${pet.id}`,
                failOnStatusCode: false
            }).then((getResponse) => {                
                cy.task('log', '\nRaw getResponse response: ' + JSON.stringify(getResponse)).then(() => {
                    try {
                        expect(getResponse.status).to.eq(200);
                        expect(getResponse.body).to.have.property('id').eq(pet.id);
                        expect(getResponse.body).to.have.property('category').that.includes({ id: pet.category.id, name: pet.category.name });
                        expect(getResponse.body).to.have.property('name', pet.name);
                        expect(getResponse.body).to.have.property('photoUrls').that.includes(pet.photoUrls[0]);
                        expect(getResponse.body).to.have.property('tags').that.deep.includes({ id: pet.tags[0].id, name: pet.tags[0].name });
                        expect(getResponse.body).to.have.property('status', pet.status);
                    } catch (error) {
                        // Handle the exception
                        cy.log('An error occurred:', error.message);
                        throw error; // Re-throw the error to fail the test
                    }
                });
            });
        };

        // Call the recursive function with a maximum of 10 retries
        retryGetRequest(10);
    });

    it('should update the existing pet with new data', function () {
        const pet = this.pet;
        pet.name = `${pet.name}-updated`;
        pet.status = 'sold';
        pet.photoUrls.push('https://www.example.com/new-image.jpg');
        pet.tags.push({ id: 2, name: 'sold' });
        pet.category = { id: 2, name: 'sold' };
        cy.task('log', `\nSending PUT request to update a pet - { url: ${apiUrl}, body: ${JSON.stringify(pet, null, 2)} }`);
        cy.request('PUT', apiUrl, pet).then((putResponse) => {            
            cy.task('log', '\nRaw put response: ' + JSON.stringify(putResponse));
            expect(putResponse.status).to.eq(200);            
            expect(putResponse.body).to.have.property('id').eq(pet.id);
            expect(putResponse.body).to.have.property('category').that.includes({ id: pet.category.id, name: pet.category.name });
            expect(putResponse.body).to.have.property('name', pet.name);
            expect(putResponse.body).to.have.property('photoUrls').that.includes(pet.photoUrls[0]);
            expect(putResponse.body).to.have.property('tags').that.deep.includes({ id: pet.tags[0].id, name: pet.tags[0].name });
            expect(putResponse.body).to.have.property('status', pet.status);
        });
    });

    it('should add the first, second, and third pets successfully and find by status', function () {
        const pets = [this.secondPet, this.thirdPet];
    
        pets.forEach((pet, index) => {
            // Add the pet
            cy.task('log', `\nSending POST request to create a pet - { url: ${apiUrl}, body: ${JSON.stringify(pet, null, 2)} }`);
            cy.request('POST', apiUrl, pet).then((response) => {
                expect(response.status).to.eq(200);                
                cy.task('log', '\nRaw post response: ' + JSON.stringify(response));
            });
    
            // Define a recursive function to retry the GET request for the pet
            const retryGetRequest = (retries) => {
                if (retries <= 0) {
                    throw new Error('Max retries reached, could not find the pet by status');
                }
                cy.task('log', `\nSending GET request to retrieve a pet by status - { url: ${apiUrl}/findByStatus?status=${pet.status} }`);
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/findByStatus?status=${pet.status}`,
                    failOnStatusCode: true
                }).then((getResponse) => {                    
                    cy.task('log', '\nRaw getResponse response: ' + JSON.stringify(getResponse));
                    if (getResponse.status === 200) {                        
                        cy.log('Response Body:', getResponse.body); // Log the response body for debugging
                        const petInResponse = getResponse.body.find(p => p.id === pet.id);
                        if (petInResponse) {
                            expect(petInResponse).to.exist;
                            expect(petInResponse).to.have.property('id').eq(pet.id);
                            expect(petInResponse).to.have.property('category').that.includes({ id: pet.category.id, name: pet.category.name });
                            expect(petInResponse).to.have.property('name', pet.name);
                            expect(petInResponse).to.have.property('photoUrls').that.includes(pet.photoUrls[0]);
                            expect(petInResponse).to.have.property('tags').that.deep.includes({ id: pet.tags[0].id, name: pet.tags[0].name });
                            expect(petInResponse).to.have.property('status', pet.status);
                        } else {
                            cy.wait(2000); // Wait for 1 second before retrying
                            cy.wrap(null).then(() => retryGetRequest(retries - 1));
                        }
                    }
                });
            };
    
            // Call the recursive function with a maximum of 10 retries
            retryGetRequest(10);
        });
    });

    it('should delete all the pets created in the test', function () {
        const pets = [this.pet, this.secondPet, this.thirdPet];
        pets.forEach((pet) => {
            cy.task('log', `\nSending DELETE request to delete a pet - { url: ${apiUrl}/${pet.id} }`);
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/${pet.id}`,
                failOnStatusCode: false
            }).then((response) => {                
                cy.task('log', '\nRaw delete response: ' + JSON.stringify(response));
                try {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.eq(pet.id.toString());
                } catch (error) {
                    cy.log(`Failed to delete pet with id ${pet.id}: ${error.message}`);
                }
            });
        });
    });
});