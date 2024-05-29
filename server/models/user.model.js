const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    zip: {
      type: Sequelize.STRING,
    },
    defaultGas: {
      type: Sequelize.STRING,
      defaultValue: "Average"
    },
    defaultVehicle: {
      type: Sequelize.STRING,
      defaultValue: "Average"
    },
    defaultMPG: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    defaultMilesCovered: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    defaultPractice: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    defaultRehearsal: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    defaultTax: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    defaultFees: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    round_trip: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
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

  //User Model functions
  User.beforeCreate(async (user, options) => {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  });


  User.login = async function (email, password) {
    const user = await this.findOne({ where: { email } });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw new Error("Incorrect Password");
    }
    throw new Error("Incorrect Email");
  };

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

