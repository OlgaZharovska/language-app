var environments = {};

environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'maxChecks' : 5,
  'templateGlobals' : {
    'appName' : 'LanguageApp',
    'companyName' : 'NotARealCompany, Inc.',
    'yearCreated' : '2019',
    'baseUrl' : 'http://localhost:3000/'
  }
};

environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production',
  'hashingSecret' : 'thisIsAlsoASecret',
  'templateGlobals' : {
    'appName' : 'LanguageApp',
    'companyName' : 'NotARealCompany, Inc.',
    'yearCreated' : '2019',
    'baseUrl' : 'http://localhost:5000/'
  }
};

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
