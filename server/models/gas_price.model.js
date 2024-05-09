module.exports = (sequelize, Sequelize,) => {
    const GasPrice = sequelize.define("GasPrice", {
        location: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false
        },
        average_price: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
      });

  return GasPrice;
};
