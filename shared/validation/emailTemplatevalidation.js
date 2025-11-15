import Joi from 'joi';
const validateCreateEmailTemplate = (data) => {
    const schema = Joi.object({
        subject: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        mandril_template: Joi.string().required(),
        eventId: Joi.string().required(),
        templateId: Joi.string().required(),

    });




    return schema.validate(data);
};
const validateUpdateEmailTemplate = (data) => {
    const schema = Joi.object({
        subject: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        mandril_template: Joi.string().required(),
        eventId: Joi.string().required(),
        templateId: Joi.string().required(),

    });

    return schema.validate(data);
};
export { validateCreateEmailTemplate, validateUpdateEmailTemplate }