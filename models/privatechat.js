'use strict';
module.exports = (sequelize, DataTypes) => {
  const PrivateChat = sequelize.define('PrivateChat', {
    content: DataTypes.STRING,
    sendId: DataTypes.INTEGER,
    receiveId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PrivateChat',
    tableName: 'PrivateChats'
  });
  PrivateChat.associate = function (models) {
    PrivateChat.belongsTo(models.User, { foreignKey: 'sendId' })
  };
  return PrivateChat;
};