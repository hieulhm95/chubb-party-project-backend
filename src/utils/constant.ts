export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com',
  isRegister: true,
};

export const DEFAULT_GIFT = [
  {
    id: 1,
    name: 'blanket',
    quantity: 20,
  },
  {
    id: 2,
    name: 'smallBag',
    quantity: 30,
  },
  {
    id: 3,
    name: 'handBag',
    quantity: 10,
  },
  {
    id: 4,
    name: 'handBook',
    quantity: 40,
  },
];

export const WIN_RATE = 20;

export const REDIS_KEY = {
  COUNT_USERS_REGISTERED: 'countUsersRegistered',
  USER_DATA: 'userData',
  GIFTS: 'gifts',
};
