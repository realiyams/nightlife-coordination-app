'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Menambahkan constraint agar username unik
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true, // Bisa kosong jika city tidak diberikan
    }
  }, {});
  
  User.associate = function(models) {
    // Associations can be defined here
  };

  return User;
};
