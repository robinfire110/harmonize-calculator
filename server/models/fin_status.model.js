module.exports = (sequelize, Sequelize, User, Financial) => {
  const FinStatus = sequelize.define("FinStatus", {
    user_id: {
      type: Sequelize.UUID,
      references: {
        model: User,
        key: "user_id"
      }
    },
    fin_id:{
      type: Sequelize.STRING,
      references: {
        model: Financial,
        key: "fin_id"
      }
    }
  });

  User.belongsToMany(Financial, {
    through: FinStatus,
    foreignKey: "user_id",
    foreignKeyConstraint: true,
    sourceKey: "user_id",
  });

  Financial.belongsToMany(User, {
    through: FinStatus,
    foreignKey: "fin_id",
    foreignKeyConstraint: true,
    sourceKey: "fin_id",
  });

  FinStatus.getFinIdsByUserId = async function(userId) {
    try {
      const userFinIds = await FinStatus.findAll({
        attributes: ['fin_id'],
        where: {
          user_id: userId
        },
        raw: true
      });
      return userFinIds.map(financial => financial.fin_id);
    } catch (error) {
      console.error('Error retrieving fin_ids:', error);
      throw error;
    }
  };


  return FinStatus;
};
