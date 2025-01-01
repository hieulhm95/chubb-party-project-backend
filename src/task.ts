import { CronJob } from 'cron';
import { logger } from './utils/logger';
import { getResponses, prefetchMedia } from './services/generate.services';

const job = new CronJob(
	'0 0 */1 * * *', // cronTime
	async function () {
		logger.info("Auto scan running");
		await getResponses();
		logger.info("Auto scan done");
	},
	undefined,
	false, // start
	'Asia/Ho_Chi_Minh' // timeZone
);

const fetchJob = new CronJob(
	'0 */5 * * * *', // cronTime
	async function () {
		logger.info("Fetching audio running");
		await prefetchMedia();
		logger.info("Fetching audio done");
	},
	undefined,
	false, // start
	'Asia/Ho_Chi_Minh' // timeZone
);

export const scanner = async () => {
	await getResponses();
	logger.info("First boot auto scan done");
	job.start();
	fetchJob.start();
}