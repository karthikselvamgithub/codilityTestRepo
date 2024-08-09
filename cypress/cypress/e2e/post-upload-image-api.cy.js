import { faker } from '@faker-js/faker';

describe('post upload image API Tests', function () {
    const apiUrl = 'https://petstore.swagger.io/v2/pet';
    
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
            description: 'should fail to upload a non-image file',
            petId: 3,
            filePath: 'Dogs.jpeg',
            fileType: 'text/plain',
            expectedStatusCode: 404,
            expectedProperty: 'message',
            expectedValue: 'Invalid file type'
        },
        {
            description: 'should fail to upload an image with invalid petId',
            petId: '123412341523154325324',
            filePath: 'Dogs.jpeg',
            fileType: 'image/jpeg',
            expectedStatusCode: 404,
            expectedProperty: 'message',
            expectedValue: 'java.lang.NumberFormatException: For input string: \"123412341523154325324\"'
        },
        {
            description: 'should fail to upload an image with empty petId',
            petId: '',
            filePath: 'Dogs.jpeg',
            fileType: 'image/jpeg',
            expectedStatusCode: 404,
            expectedProperty: 'message',
            expectedValue: 'null for uri: http://petstore.swagger.io/v2/pet//uploadImage'
        },
        {
            description: 'should fail to upload an image due to server error',
            petId: '3/fake/',
            filePath: 'Dogs.jpeg',
            fileType: 'image/jpeg',
            expectedStatusCode: 500,
            expectedProperty: 'message',
            expectedValue: 'Internal Server Error'
        }
    ];

    TestCases.forEach((testCase) => {
        it(testCase.description, function () {
            cy.fixture(testCase.filePath, 'binary').then((fileContent) => {
                const blob = Cypress.Blob.binaryStringToBlob(fileContent, testCase.fileType);
    
                const formData = new FormData();
                formData.append('file', blob, testCase.filePath);
                cy.task('log', `\nSending POST request to upload an image - { url: ${apiUrl}/${testCase.petId}/uploadImage}, formData: ${formData} }`);
                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/${testCase.petId}/uploadImage`,
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    },
                    body: formData,
                    failOnStatusCode: false
                }).then((uploadResponse) => {                    
                    
                    // Log the raw response body for debugging
                    cy.task('log', '\nRaw uploadResponse body: ' + uploadResponse.body);
        
                    try {
                        // Convert ArrayBuffer to string
                        const decoder = new TextDecoder('utf-8');
                        const responseBodyString = decoder.decode(uploadResponse.body);
        
                        // Parse the response body
                        const uploadResponseJson = JSON.parse(responseBodyString);
        
                        // Ensure the response body is parsed correctly
                        if (uploadResponseJson && uploadResponseJson.message) {
                            expect(uploadResponseJson.code).to.eq(testCase.expectedStatusCode);
                            expect(uploadResponseJson.message).to.include(testCase.expectedValue);
                        } else {
                            throw new Error('uploadResponseJson or uploadResponseJson.message is undefined');
                        }
        
                        // Log the parsed response body for debugging
                        cy.task('log', '\nParsed uploadResponse: ' + JSON.stringify(uploadResponseJson, null, 2));
                    } catch (error) {
                        cy.task('log', '\nError parsing uploadResponse: ' + error.message);
                        throw error;
                    }
                });
            });
        });
    });

    it('should add pet and upload image successfully', function () {       
        const pet = this.pet;
        cy.task('log', `\nSending POST request to create a pet - { url: ${apiUrl}, body: ${JSON.stringify(pet, null, 2)} }`);
        cy.request('POST', apiUrl, pet).then((postResponse) => {
            expect(postResponse.status).to.eq(200);
            cy.task('log', `\ncreate pet Response Data: ${JSON.stringify(postResponse.body, null, 2)}`);
            expect(postResponse.body).to.have.property('id').eq(pet.id);
        });
    
        // Upload image for the created pet
        cy.fixture('Dogs.jpeg', 'binary').then((fileContent) => {
            const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/jpeg');
            const formData = new FormData();
            formData.append('file', blob, 'Dogs.jpeg');
            
            cy.task('log', `\nSending POST request to upload an image - { url: ${apiUrl}/${pet.id}/uploadImage}, formData: ${formData} }`);
    
            cy.request({
                method: 'POST',
                url: `${apiUrl}/${pet.id}/uploadImage`,
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'multipart/form-data; boundary=' + formData._boundary
                },
                body: formData,
            }).then((uploadResponse) => {
    
                // Log the raw response body for debugging
                cy.task('log', '\nRaw uploadResponse body: ' + uploadResponse.body);
    
                try {
                    // Convert ArrayBuffer to string
                    const decoder = new TextDecoder('utf-8');
                    const responseBodyString = decoder.decode(uploadResponse.body);
    
                    // Parse the response body
                    const uploadResponseJson = JSON.parse(responseBodyString);
    
                    // Ensure the response body is parsed correctly
                    if (uploadResponseJson && uploadResponseJson.message) {
                        expect(uploadResponseJson.code).to.eq(200);
                        expect(uploadResponseJson.message).to.include("File uploaded to ./Dogs.jpeg");
                    } else {
                        throw new Error('uploadResponseJson or uploadResponseJson.message is undefined');
                    }
    
                    // Log the parsed response body for debugging
                    cy.task('log', '\nParsed upload Response: ' + JSON.stringify(uploadResponseJson, null, 2));
                } catch (error) {
                    cy.task('log', '\nError parsing uploadResponse: ' + error.message);
                    throw error;
                }
            });
        });
    });
});