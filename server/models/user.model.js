const bcrypt = require('bcrypt');

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

  User.updateUser = async function (userId, newData) {
    try {
      const user = await this.findByPk(userId);
      if (user) {
        await user.update(newData);
      }
    } catch (err) {
      console.error("Error updating user:", err.message);
      throw err;
    }
  };

  User.findApplicantsByUserIds = async function(userIds) {
    try {
      const users = await User.findAll({
        where: {
          user_id: userIds
        },
        attributes: ['user_id', 'name']
      });

      return users.map(user => ({
        user_id: user.user_id,
        name: user.name
      }));
    } catch (error) {
      throw new Error('Error finding users by user_ids: ' + error.message);
    }
  };

  User.resetUserPassword = async function(userId, oldPassword, newPassword) {
    try {
      //find user, compare passwords, if true update pass to new pass
      const user = await this.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new Error("Incorrect old password");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await user.update({ password: hashedPassword });

      return { success: true };
    } catch (error) {
      console.error("Error resetting user password:", error);
      throw error;
    }
  };

  return User;
};

