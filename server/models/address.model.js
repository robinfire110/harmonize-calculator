module.exports = (sequelize, Sequelize, Event) => {
  const Address = sequelize.define('Address', {
    // Model attributes are defined here
    address_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    street: {
      type: Sequelize.STRING,
      allowNull: false
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    },
    zip: {
      type: Sequelize.STRING,
      allowNull: false
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  Address.belongsTo(Event, {
    foreignKey: "address_id",
    foreignKeyConstraint: true,
    onDelete: "CASCADE",
  });

  Event.hasOne(Address, {
    foreignKey: "event_id",
    foreignKeyConstraint: true,
    onDelete: "CASCADE",
  });

  return Address;
};
