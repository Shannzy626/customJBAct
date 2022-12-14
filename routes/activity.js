const { v1: Uuidv1 } = require('uuid');
const JWT = require('../utils/jwtDecoder');
const SFClient = require('../utils/sfmc-client');
const logger = require('../utils/logger');
const dateTime = require('../utils/dateConvert');

/**
 * The Journey Builder calls this method for each contact processed by the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */

exports.execute = async (req, res) => {
  // decode data
  const data = JWT(req.body);
  logger.info(data);
  
  let configLocale = data.inArguments[0].timeZone //data.inArguments[0].TimeZoneOptions,
      configStartTime = data.inArguments[0].BlackoutStartTime,
      configFinishTime = data.inArguments[0].BlackoutFinishTime;
  
  let dates = dateTime.getNextTriggerDate(configLocale,configStartTime,configFinishTime),
      startDate = dates.startDtObj.toISO().toLocaleString('en-US', {timeZone: 'CST',}),
      endDate = dates.endDtObj.toISO().toLocaleString('en-US', {timeZone: 'CST',}),
      nextDate = dates.nextDtObj.toISO().toLocaleString('en-US', {timeZone: 'CST',});

  console.log('Start Date Objs: ', startDate, '; End Date Objs',  endDate, '; Next Date Objs', nextDate);

  try {
    const id = Uuidv1();

    await SFClient.saveData(process.env.DATA_EXTENSION_EXTERNAL_KEY, [
      {
        keys: {
          SubscriberKey: data.inArguments[0].contactKey,
        },
        values: {
          StartDate: startDate,
          EndDate: endDate,
          NextDate: nextDate,
          Timezone: data.inArguments[0].timeZone
        },
      },
    ]).then(() =>{
      setTimeout(() => {
        console.log('Send Response');
        res.status(200).send({
          status: 'ok',
        });
      }, 3000)
    });
  } catch (error) {
    logger.error(error);
  }

};

/**
 * Endpoint that receives a notification when a user saves the journey.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.save = async (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 *  Endpoint that receives a notification when a user publishes the journey.
 * @param req
 * @param res
 */
exports.publish = (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};

/**
 * Endpoint that receives a notification when a user performs
 * some validation as part of the publishing process.
 * @param req
 * @param res
 */
exports.validate = (req, res) => {
  res.status(200).send({
    status: 'ok',
  });
};
