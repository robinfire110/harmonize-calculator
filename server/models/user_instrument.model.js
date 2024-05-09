module.exports = (sequelize, Sequelize, User, Instrument) => {
  const UserInstrument = sequelize.define("UserInstrument", {
    user_id: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: "user_id"
      }
    },
    instrument_id:{
      type: Sequelize.INTEGER,
      references: {
        model: Instrument,
        key: "instrument_id"
      }
    }
  });

  User.belongsToMany(Instrument, {
    through: UserInstrument,
    foreignKey: "user_id",
    foreignKeyConstraint: true,
    sourceKey: "user_id",
  });

  Instrument.belongsToMany(User, {
    through: UserInstrument,
    foreignKey: "instrument_id",
    foreignKeyConstraint: true,
    sourceKey: "instrument_id",
  });
  
  return UserInstrument;
};
