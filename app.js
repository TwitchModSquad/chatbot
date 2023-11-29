// Initialize utils class
const utils = require("./utils/");
global.utils = utils;

// Start Express
require("./express/");

// Start Twitch
require("./twitch/");
