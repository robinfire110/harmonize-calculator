module.exports = (sequelize,Sequelize) => {
  const Event = sequelize.define('Event', {
    // Model attributes are defined here
    event_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date_posted: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    start_time: {
      type: Sequelize.DATE,
      allowNull: false
    },
    end_time: {
      type: Sequelize.DATE,
      allowNull: false
    },
    pay: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      defaultValue: ""
    },
    event_hours: {
      type: Sequelize.FLOAT
    },
    rehearse_hours: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    mileage_pay: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0
    },
    is_listed: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  Event.findByEventIds = async function(eventIds, userStatuses) {
    try {
      const events = await Event.findAll({
        where: {
          event_id: eventIds
        },
        raw: true
      });

      const formattedEvents = events.map(event => ({
        ...event,
        date_posted: new Date(event.date_posted).toLocaleDateString(),
        start_time: new Date(event.start_time).toLocaleDateString(),
        end_time: new Date(event.end_time).toLocaleDateString()
      }));

      //sort by descending so most recent at top
      formattedEvents.sort((a, b) => new Date(b.date_posted) - new Date(a.date_posted));

      const eventsWithStatus = formattedEvents.map(event => {
        const status = userStatuses.find(status => status.event_id === event.event_id);
        return { ...event, status: status ? status.status : null };
      });

      return eventsWithStatus;

    } catch (error) {
      throw new Error('Error retrieving events by event_ids: ' + error.message);
    }
  };

  Event.deleteByEventId = async function(eventId) {
    try {
      const deletedEvent = await Event.destroy({
        where: {
          event_id: eventId
        }
      });

      return deletedEvent;

    } catch (error) {
      throw new Error('Error deleting event by event ID: ' + error.message);
    }
  };

  Event.unlistByEventId = async function (eventId) {
    try {
      const updatedEvent = await Event.update({ is_listed: false }, {
        where: {
          event_id: eventId
        }
      });

      return updatedEvent;

    } catch (error) {
      throw new Error('Error unlisting event by event ID: ' + error.message);
    }
  };


  return Event;
};
