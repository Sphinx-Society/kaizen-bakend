const Joi = require('@hapi/joi');

const templateIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const templateFieldSchema =
  Joi.object().keys({
    'id': Joi.string().label('Field id').max(100).required(),
    'name': Joi.string().label('Field name').max(100).required(),
    'type': Joi.string().label('Field type').valid('string', 'number', 'select', 'text', 'file').required(),
    'minLimit': Joi.number().label('Field minimum limit').precision(2),
    'maxLimit': Joi.number().label('Field maximum limit').precision(2),
    'unit': Joi.string().label('Field unit').max(100),
    'options': Joi.array().label('Field options'),
    'disabled': Joi.boolean().label('Field disabled').default(false),
    'required': Joi.boolean().label('Field required').default(false),
  }).required();

const createTemplateSchema = {
  'name': Joi.string().label('Template name').max(100).required(),
  'type': Joi.string().label('Template type').max(100).required(),
  'createdBy': Joi.string().label('Created by').max(100).required(),
  'fields': Joi.array().items(templateFieldSchema).required(),
};

module.exports = {
  templateIdSchema,
  createTemplateSchema,
};
