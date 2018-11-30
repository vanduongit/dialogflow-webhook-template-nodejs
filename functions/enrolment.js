const { baseUrl } = require("./auth");
const { api } = require("./api");
const { validateUser } = require("./user");

module.exports = {
  enrol: (courseId, jwt) => {
    return validateUser(jwt).then(res => {
      const url = "/v2/enrollments";
      const userId = Number(res.data.userId);

      const data = {
        lo_id: courseId,
        parent_lo_id: 0,
        parent_enrollment_id: 0,
        user_id: userId
      };
      
      return api.post(url, data);
    });
  }
};
