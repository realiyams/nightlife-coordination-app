'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bar = sequelize.define('Bar', {
    place_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    postcode: DataTypes.STRING,
    lon: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    formatted: DataTypes.STRING,
    categories: DataTypes.JSONB,
    details: DataTypes.JSONB,
    opening_hours: DataTypes.STRING,
  }, {
    timestamps: true,
    tableName: 'Bars',
  });

  Bar.associate = function (models) {
    Bar.belongsToMany(models.User, {
      through: models.UserBar,
      foreignKey: 'place_id',
      otherKey: 'user_id',
    });
  };

  return Bar;
};
