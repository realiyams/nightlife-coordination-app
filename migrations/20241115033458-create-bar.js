'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Bars', {
      place_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,  // place_id is the primary key now
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      postcode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lon: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      formatted: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categories: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      opening_hours: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Bars');
  }
};
