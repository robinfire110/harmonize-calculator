module.exports = (sequelize, Sequelize, User, Event) => {
  /* UserStatus */
  const UserStatus = sequelize.define("UserStatus", {
    user_id: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: "user_id"
      }
    },
    event_id:{
      type: Sequelize.INTEGER,
      references: {
        model: Event,
        key: "event_id"
      }
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  User.belongsToMany(Event, {
    through: UserStatus,
    foreignKey: "user_id",
    foreignKeyConstraint: true,
    sourceKey: "user_id",
  });

  Event.belongsToMany(User, {
    through: UserStatus,
    foreignKey: "event_id",
    foreignKeyConstraint: true,
    sourceKey: "event_id",
  });

  UserStatus.findByUserId = async function(userId) {
    try {
      const userStatuses = await UserStatus.findAll({
        attributes: ['event_id', 'status'],
        where: {
          user_id: userId
        },
        raw: true
      });
      return userStatuses;
    } catch (error) {
      throw new Error('Error retrieving events by user_id: ' + error.message);
    }
  };

  UserStatus.findUserIdsByEventIdsAndStatuses = async function(eventIds) {
    try {
      const userStatuses = await UserStatus.findAll({
        where: {
          event_id: eventIds,
          status: ['applied', 'reject', 'accept']
        },
        attributes: ['user_id', 'status', 'event_id']
      });

      const result = userStatuses.map(status => ({
        user_id: status.user_id,
        status: status.status,
        event_id: status.event_id
      }));

      return result;
    } catch (error) {
      throw new Error('Error finding user_ids by event_ids and statuses: ' + error.message);
    }
  };




  return UserStatus;
};
