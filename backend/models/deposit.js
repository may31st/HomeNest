'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Deposit extends Model {
    static associate(models) {
      Deposit.belongsTo(models.Room, { foreignKey: 'room_id', as: 'Room' });
      Deposit.belongsTo(models.User, { foreignKey: 'tenant_id', as: 'Tenant' });
      Deposit.belongsTo(models.User, { foreignKey: 'landlord_id', as: 'Landlord' });
    }
  }

  Deposit.init({
    room_id: DataTypes.INTEGER,
    tenant_id: DataTypes.INTEGER,
    landlord_id: DataTypes.INTEGER,
    tenant_name: DataTypes.STRING,
    tenant_cccd: DataTypes.STRING,
    tenant_dob: DataTypes.STRING,
    tenant_address: DataTypes.STRING,
    tenant_cccd_image: DataTypes.TEXT('long'),
    tenant_phone: DataTypes.STRING,
    tenant_email: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    payment_method: DataTypes.STRING,
    payment_status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // pending, paid, failed
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // pending, approved, rejected
    }
  }, {
    sequelize,
    modelName: 'Deposit',
    tableName: 'deposit'
  });

  return Deposit;
};
