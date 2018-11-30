const axios = require('axios');

module.exports = {
    validateUser: (jwt) => {
        axios.defaults.headers.common.Authorization = `Bearer ${jwt}`;
        return axios.get('https://auth.go1.com/oauth/validate');
    },
};
