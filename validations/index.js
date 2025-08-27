import Joi from "joi";

const emailSchema = Joi.string()
  .email({ tlds: { allow: true } }) // Disable strict TLD validation
  .required()
  .messages({
    "string.email": "Please enter a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  });

const passwordSchema = Joi.string()
  .pattern(
    new RegExp(
      '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,15}$'
    )
  )
  .required()
  .messages({
    "string.pattern.base":
      "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be 8-15 characters long",
  });

const stringValidation = (fieldName) =>
  Joi.string()
    .required()
    .messages({
      "string.empty": `${fieldName} is required.`,
      "any.required": `${fieldName} is required.`,
    });

const fullNameSchema = Joi.string().required().max(70);

export const loginSchema = Joi.object({
  email: Joi.string().email().required(), // or your own emailSchema
  password: Joi.string().required(),
});

export const signupSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

export const addUpdateHostawayApiKeysSchema = Joi.object({
  clientId: Joi.number().required().messages({
    "number.base": "Client ID must be a number.",
    "any.required": "Client ID is required.",
  }),
  clientSecret: stringValidation("Client Secret"),
});
