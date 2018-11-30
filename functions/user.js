const { baseUrl } = require('./auth');
const { api } = require('./api');

module.exports = {
    validateUser: () => {
        const url = baseUrl + '/oauth/validate';
        return api.get(url);
    },
};
