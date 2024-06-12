const { maxFinancialNameLength, statesList, maxBioLength, maxDescriptionLength, maxEventNameLength, maxFNameLength, maxLNameLength } = require('../../client/src/Utils');
const Joi = require('joi').extend(require('@joi/date'));
const normalTextRegex = /^[a-zA-Z0-9\s.,!:'"\/()]+$/;

/* Financials */
const financialSchema = Joi.object({
    fin_name: Joi.string().pattern(/^[a-zA-Z0-9\s.'"&!,-/]+$/).max(maxFinancialNameLength).required(),
    date: Joi.date().format("YYYY-MM-DD").required(),
    total_wage: Joi.number().min(0).max(99999.99).required(),
    hourly_wage: Joi.number().min(-99999.99).max(99999.99).required(),
    event_hours: Joi.number().min(0).max(100).required(),
    event_num: Joi.number().integer().min(0).max(99),
    rehearsal_hours: Joi.number().min(0).max(999.9),
    practice_hours: Joi.number().min(0).max(999.9),
    travel_hours: Joi.number().min(0).max(999.9),
    total_mileage: Joi.number().min(0).max(9999.9),
    mileage_covered: Joi.number().min(0).max(9999.9),
    travel_fees: Joi.number().min(0).max(99999.9),
    zip: Joi.string().pattern(/^[0-9]+$/).min(5).max(5),
    gas_price: Joi.number().min(0).max(9.99),
    mpg: Joi.number().min(0).max(99),
    tax: Joi.number().min(0).max(100),
    fees: Joi.number().min(0).max(9999.99),
    trip_num: Joi.number().integer().min(0).max(999),
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
    zip: Joi.string().pattern(/^[0-9]+$/).min(5).max(5),
    is_admin: Joi.boolean().truthy(1).falsy(0),
    default_state: Joi.string(),
    gas_price: Joi.number().min(0).max(9.99),
    default_vehicle: Joi.string(),
    mpg: Joi.number().min(0).max(99),
    practice_hours: Joi.number().min(0).max(999.9),
    rehearsal_hours: Joi.number().min(0).max(999.9),
    tax: Joi.number().min(0).max(100),
    fees: Joi.number().min(0).max(9999.99),
    trip_num: Joi.number().integer().min(0).max(999),
    mileage_covered: Joi.number().min(0).max(9999.9),
    travel_fees: Joi.number().min(0).max(99999.9),
    multiply_pay: Joi.boolean().truthy(1).falsy(0),
    multiply_hours: Joi.boolean().truthy(1).falsy(0),
    multiply_travel: Joi.boolean().truthy(1).falsy(0),
    multiply_practice: Joi.boolean().truthy(1).falsy(0),
    multiply_rehearsal: Joi.boolean().truthy(1).falsy(0),
    multiply_other: Joi.boolean().truthy(1).falsy(0)
});

module.exports = {financialSchema, userSchema}