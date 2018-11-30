
const { baseUrl } = require('./auth');
const { api } = require('./api');

module.exports = {
    enrol: (courseId, userId) => {
        const url = baseUrl + '/v2/enrollments';
        const data = {
            lo_id: courseId,
            parent_lo_id: 0,
            parent_enrollment_id: 0,
            user_id: userId,
        };

        return api.post(url, data);
    },
};
