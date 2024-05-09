module.exports = (sequelize, Sequelize, Event) => {
  const Financial = sequelize.define('Financial', {
    // Model attributes are defined here
    fin_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fin_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    event_num: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    total_wage: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    event_hours: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    hourly_wage: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    rehearse_hours: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    practice_hours: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    travel_hours: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    total_mileage: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    mileage_pay: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    zip: {
      type: Sequelize.STRING
    },
    gas_price: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    mpg: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    tax: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    fees: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    round_trip: {
      type: Sequelize.FLOAT,
      defaultValue: true
    },
    multiply_pay: {
      type: Sequelize.FLOAT,
      defaultValue: true
    },
    multiply_hours: {
      type: Sequelize.FLOAT,
      defaultValue: true
    },
    multiply_travel: {
      type: Sequelize.FLOAT,
      defaultValue: true
    },
    multiply_practice: {
      type: Sequelize.FLOAT,
      defaultValue: false
    },
    multiply_rehearsal: {
      type: Sequelize.FLOAT,
      defaultValue: false
    },
    multiply_other: {
      type: Sequelize.FLOAT,
      defaultValue: false
    },
  });

  /* Financial with Event */
  Event.hasOne(Financial, {
    foreignKey: "event_id", 
    foreignKeyConstraint: true, 
    onDelete: 'CASCADE'
  });
  Financial.belongsTo(Event, {
    foreignKey: "event_id", 
    foreignKeyConstraint: true, 
    onDelete: 'CASCADE'
  });

  Financial.getFinancialsByFinIds = async (finIds) => {
    try {
      return await Financial.findAll({
        where: {
          fin_id: finIds
        }
      });
    } catch (error) {
      console.error('Error retrieving financials:', error);
      throw error;
    }
  };

  Financial.deleteFinancialByFinId = async (finId) => {
    try {
      const deletedFinancial = await Financial.destroy({
        where: {
          fin_id: finId
        }
      });
      return deletedFinancial;
    } catch (error) {
      console.error('Error deleting financial:', error);
      throw error;
    }
  };

  return Financial;
};
