const Joi = require('joi');

const createExpense = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    category: Joi.string().required(),
    date: Joi.date().required(),
    description: Joi.string().allow(''),
  }),
};

const updateExpense = {
  params: Joi.object().keys({
    id: Joi.string().required().length(24), // ObjectId length
  }),
  body: Joi.object().keys({
    amount: Joi.number(),
    category: Joi.string(),
    date: Joi.date(),
    description: Joi.string().allow(''),
  }).min(1),
};

const deleteExpense = {
  params: Joi.object().keys({
    id: Joi.string().required().length(24),
  }),
};

module.exports = {
  createExpense,
  updateExpense,
  deleteExpense,
};
