const Joi = require('joi');

module.exports.storeSchema = Joi.object({
    store:Joi.object({
        title: Joi.string(),
        location: Joi.string(),
        // image:Joi.string(),
        description:Joi.string()
    })
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5),
        body: Joi.string().required()
    })
})