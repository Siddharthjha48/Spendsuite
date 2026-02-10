const Joi = require('joi');
require('dotenv').config();

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().required().description('Mongo DB url'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  NODE_ENV: Joi.string().allow('development', 'production', 'test').default('development'),
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGO_URI,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  env: envVars.NODE_ENV,
};
