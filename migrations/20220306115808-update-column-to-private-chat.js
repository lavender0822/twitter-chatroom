'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PrivateChats', 'isRead', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    })
 
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PrivateChats', 'isRead')
  }
}
