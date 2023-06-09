// libraries/packages
const express = require("express");
exports.express = express;
exports.router = express.Router();
exports.session = require("express-session");
exports.helpers = require("../config/helpers");
exports.cors = require("cors");
exports.cookieParser = require("cookie-parser");
exports.bodyParser = require("body-parser");
exports.rateLimit = require("express-rate-limit");
exports.Joi = require("joi");
exports.helmet = require("helmet");
exports.compression = require("compression");
exports.passport = require("passport");
exports.mongoosePaginate = require("mongoose-paginate");
exports.passportJWT = require("passport-jwt");
exports.jwt = require("jsonwebtoken");
exports.uuid = require("node-uuid");
exports.jwt_decode = require("jwt-decode");

// models
// exports.Items = require("../models/items");
// exports.Sellers = require("../models/sellers");
// exports.Oauth = require("../models/oauth");
// exports.Products = require("../models/products");

// routes
