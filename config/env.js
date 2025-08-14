// config/env.js
import 'dotenv/config';

const config = {
  trello: {
    boardId: process.env.TRELLO_BOARD_ID,
    key: process.env.TRELLO_KEY,
    token: process.env.TRELLO_TOKEN,
    listId: process.env.TRELLO_LIST_ID,
  },
};

export default config;