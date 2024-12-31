import { CronJob } from 'cron';
import { logger } from './utils/logger';
import { getResponses } from './services/generate.services';

const job = new CronJob(
	'0 0 */1 * * *', // cronTime
	async function () {
		logger.info("Auto scan running");
		await getResponses();
		logger.info("Auto scan done");
	},
	() => {
        logger.info("Auto scan done");
    }, // onComplete
	false, // start
	'Asia/Ho_Chi_Minh' // timeZone
);

export const scanner = async () => {
	await getResponses();
	logger.info("First boot auto scan done");
	job.start();
}