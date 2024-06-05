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
    gas_price: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    default_vehicle: {
      type: Sequelize.STRING,
      defaultValue: "average_mpg"
    },
    mpg: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    mileage_covered: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    practice_hours: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    rehearsal_hours: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    tax: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    fees: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    trip_num: {
      type: Sequelize.INTEGER,
      defaultValue: 2
    },
    travel_fees: {
      type: Sequelize.FLOAT,
      default: 0.0
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

