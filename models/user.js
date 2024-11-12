'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false, // Nama depan harus diisi
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false, // Nama belakang harus diisi
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Membuat username unik
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true, // Boleh kosong jika city tidak diberikan
    },
  }, {
    timestamps: true, // Menambahkan kolom createdAt dan updatedAt
  });

  User.associate = function (models) {
    // Define associations here jika ada relasi dengan model lain
  };

  return User;
};
