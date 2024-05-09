const { maxFinancialNameLength, statesList, maxBioLength, maxDescriptionLength, maxEventNameLength, maxFNameLength, maxLNameLength } = require('../../client/src/Utils');
const { instrumentListLength, instrumentList } = require('./instrumentList');
const Joi = require('joi').extend(require('@joi/date'));
const normalTextRegex = /^[a-zA-Z0-9\s.,!:'"\/()]+$/;

/* Instruments */
const instrumentSchema = Joi.array().sparse().items(Joi.number().integer().min(0).max(instrumentListLength));

/* Event */
//Event Data
const eventSchema = Joi.object({
    user_id: Joi.number().required(),
    event_name: Joi.string().pattern(/^[a-zA-Z0-9\s'"-]+$/).max(maxEventNameLength).required(),
    start_time: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
    end_time: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
    pay: Joi.number().min(0).max(9999.99).required(),
    event_hours: Joi.number().min(0).max(1000).required(),
    rehearse_hours: Joi.number().min(0).max(100),
    description: Joi.string().pattern(normalTextRegex).max(maxDescriptionLength).allow(null, ''),
    mileage_pay: Joi.number().max(1),
    instruments: instrumentSchema,
    is_listed: Joi.boolean().truthy(1).falsy(0),
    address: {
        street: Joi.string().pattern(/^[a-zA-Z0-9\s']+$/).max(100).required(),
        city: Joi.string().pattern(/^[a-zA-Z\s.,']+$/).max(100).required(),
        zip: Joi.string().pattern(/^[0-9]+$/).min(5).max(5).required(),
        state: Joi.string().valid(...statesList).required()
    }
});

const addUserToEventSchema = Joi.object({
    status: Joi.string().valid("owner", "applied", "accept", "reject", "withdraw").required()
});

/* Financials */
const financialSchema = Joi.object({
    fin_name: Joi.string().pattern(/^[a-zA-Z0-9\s.'"-]+$/).max(maxFinancialNameLength).required(),
    date: Joi.date().format("YYYY-MM-DD").required(),
    total_wage: Joi.number().min(0).max(9999.99).required(),
    hourly_wage: Joi.number().min(0).max(9999.99).required(),
    event_hours: Joi.number().min(0).max(100).required(),
    event_num: Joi.number().integer().min(0).max(99),
    rehearse_hours: Joi.number().min(0).max(999.9),
    practice_hours: Joi.number().min(0).max(999.9),
    travel_hours: Joi.number().min(0).max(999.9),
    total_mileage: Joi.number().min(0).max(9999.9),
    mileage_pay: Joi.number().min(0).max(999.9),
    zip: Joi.string().pattern(/^[0-9]+$/).min(5).max(5),
    gas_price: Joi.number().min(0).max(9.99),
    mpg: Joi.number().min(0).max(99),
    tax: Joi.number().min(0).max(100),
    fees: Joi.number().min(0).max(9999.99),
    event_id: Joi.number().min(0),
    round_trip: Joi.boolean().truthy(1).falsy(0),
    multiply_pay: Joi.boolean().truthy(1).falsy(0),
    multiply_hours: Joi.boolean().truthy(1).falsy(0),
    multiply_travel: Joi.boolean().truthy(1).falsy(0),
    multiply_practice: Joi.boolean().truthy(1).falsy(0),
    multiply_rehearsal: Joi.boolean().truthy(1).falsy(0),
    multiply_other: Joi.boolean().truthy(1).falsy(0)
});

/* User */
const userSchema = Joi.object({
    email: Joi.string().email().required().max(320),
    password: Joi.string().required().max(256),
    f_name: Joi.string().pattern(/^[a-zA-Z0-9\s']+$/).max(maxFNameLength).required(),
    l_name: Joi.string().pattern(/^[a-zA-Z0-9\s']+$/).max(maxLNameLength).required(),
    zip: Joi.string().pattern(/^[0-9]+$/).min(5).max(5).required(),
    bio: Joi.string().pattern(normalTextRegex).max(maxBioLength).allow(null, ""),
    is_admin: Joi.boolean().truthy(1).falsy(0),
    instruments: instrumentSchema,
});

module.exports = {eventSchema, addUserToEventSchema, instrumentSchema, financialSchema, userSchema}