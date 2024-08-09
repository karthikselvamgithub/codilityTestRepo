# codilityTestRepo
codilityTestRepo

# Project Name
Cypress API testing framework

## Description
Cypress API testing framework for pet endpoints in swagger

## Features
- API tesing with cypress
- Response status code validation
- Invalid test data validation
- exception handling for failed requests
- Test data generation with faker
- Usage of fixtures for test data - json / images files

## Dependencies
The following packages are used in this project:

- `cypress`: A JavaScript end-to-end testing framework.
- `faker`: A library for generating fake data.
- `eslint`: A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

## How to run this project
	1. clone the project
	2. navigate to the project folder
	3. run `npm install` to install the dependencies
	4. run `npm run cypress:run` to run the api tests in headless mode
	5. Use the script 'cypress:run' in the package.json file to run the tests CICD pipeline

By following these steps, you should be able to set up, run, and test your project successfully.


## Api test folder structure
your-project/
├── cypress/
│   ├── fixtures/
│   │   └── example.json
│   ├── e2e/
│   │   └── examples/
│   │       └── example.spec.cy.js
│   ├── plugins/
│   │   └── index.js
│   ├── support/
│   │   ├── commands.js
│   │   └── index.js
├── cypress.json
├── package.json
└── node_modules/
	- fixtures: Contains test data in json format
	- e2e: Contains test files
	- plugins: Contains plugins for cypress
	- support: Contains support files for cypress
	- cypress.json: Contains cypress configuration
	- package.json: Contains project dependencies


## Contributing
Guidelines for contributing to your project.

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## License
Specify the license under which your project is distributed.

## Contact
Provide ways to get in touch with you or the maintainers of the project.

- Email: your.email@example.com
- GitHub: [yourusername](https://github.com/yourusername)