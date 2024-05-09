module.exports = (sequelize, Sequelize,) => {
  const Instrument = sequelize.define('Instrument', {
    // Model attributes are defined here
    instrument_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    }
  });

  return Instrument;
};
