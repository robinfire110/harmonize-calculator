module.exports = (sequelize, Sequelize, Event, Instrument) => {
  const EventInstrument = sequelize.define("EventInstrument", {
    event_id: {
      type: Sequelize.INTEGER,
      references: {
        model: Instrument,
        key: "event_id"
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

  Event.belongsToMany(Instrument, {
    through: EventInstrument,
    foreignKey: "event_id",
    foreignKeyConstraint: true,
    sourceKey: "event_id",
  });

  Instrument.belongsToMany(Event, {
    through: EventInstrument,
    foreignKey: "instrument_id",
    foreignKeyConstraint: true,
    sourceKey: "instrument_id",
  });
  

  return EventInstrument;
};
