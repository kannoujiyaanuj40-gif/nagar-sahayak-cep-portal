const miscModel = require('../models/misc');

module.exports = {
  categories: async () => ({ status: 200, body: miscModel.listCategories() }),
  departments: async () => ({ status: 200, body: miscModel.listDepartments() }),
};
