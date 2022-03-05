'use strict';
module.exports = (sequelize, DataTypes) => {
  const Chatroom = sequelize.define('Chatroom', {
    UserId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  });
  Chatroom.associate = function(models) {
    Chatroom.belongsTo(models.User, { foreignKey: 'UserId' })
  };
  return Chatroom;
};