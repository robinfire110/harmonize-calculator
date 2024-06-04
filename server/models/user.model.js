module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    user_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    zip: {
      type: Sequelize.STRING,
    },
    default_state: {
      type: Sequelize.STRING,
      defaultValue: "average_gas"
    },
    default_gas_price: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_vehicle: {
      type: Sequelize.STRING,
      defaultValue: "average_mpg"
    },
    default_mpg: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_miles_covered: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_practice: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_rehearsal: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_tax: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_fees: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_trip_num: {
      type: Sequelize.INTEGER,
      defaultValue: 2
    },
    multiply_pay: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    multiply_hours: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    multiply_travel: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    multiply_practice: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    multiply_rehearsal: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    multiply_other: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return User;
};

