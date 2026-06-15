'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    static associate(models) {
      Contract.belongsTo(models.Deposit, { foreignKey: 'deposit_id', as: 'Deposit' });
      Contract.belongsTo(models.Room, { foreignKey: 'room_id', as: 'Room' });
      Contract.belongsTo(models.User, { foreignKey: 'tenant_id', as: 'Tenant' });
      Contract.belongsTo(models.User, { foreignKey: 'landlord_id', as: 'Landlord' });
    }
  }

  Contract.init({
    deposit_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    tenant_id: DataTypes.INTEGER,
    landlord_id: DataTypes.INTEGER,
    contract_code: DataTypes.STRING,
    room_name: DataTypes.STRING,
    room_address: DataTypes.STRING,
    room_price: DataTypes.FLOAT,
    deposit_amount: DataTypes.FLOAT,
    landlord_name: DataTypes.STRING,
    landlord_phone: DataTypes.STRING,
    landlord_email: DataTypes.STRING,
    tenant_name: DataTypes.STRING,
    tenant_cccd: DataTypes.STRING,
    tenant_dob: DataTypes.STRING,
    tenant_address: DataTypes.STRING,
    tenant_phone: DataTypes.STRING,
    tenant_email: DataTypes.STRING,
    terms: DataTypes.TEXT('long'),
    tenant_signed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    landlord_signed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // pending, active, terminated
    }
  }, {
    sequelize,
    modelName: 'Contract',
    tableName: 'contract'
  });

  return Contract;
};
