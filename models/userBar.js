'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserBar = sequelize.define('UserBar', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    place_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Bars',
        key: 'place_id',
      },
    },
  }, {
    timestamps: true,
    tableName: 'UserBars',
  });

  UserBar.associate = function (models) {
    // Optional, jika ada kebutuhan lain
  };

  return UserBar;
};
