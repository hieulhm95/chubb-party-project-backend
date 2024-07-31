const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const SHEET_ID = '1dXnrTVDqFpW20jWqzexOOWb_tvaxcQHEFMk6yI4PRQQ';

const REDIS_URI =
  process.env.REDIS_URI ||
  `rediss://red-cqku953qf0us73bpvsvg:x6VzZcJWG7pdKUJEZ6ZyPGdGKESaqK2d@singapore-redis.render.com:6379`;

export { SCOPES, SHEET_ID, REDIS_URI };
