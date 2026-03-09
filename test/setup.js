const { settings } = require('pactum');

const BASE_URL = 'https://lojaebac.ebaconline.art.br/graphql';

settings.setReporterAutoRun(false);

module.exports = { BASE_URL };
