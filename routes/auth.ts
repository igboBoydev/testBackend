export {};
require("dotenv").config();
import { NextFunction, response, Response } from "express";
const packages = require("../utils/packages");
require("../config/passport");
const signatureSigner = require("../middleware/checkSignatures");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWare = passport.authenticate("jwt", { session: false });
var signatureSignerMiddleware = signatureSigner.personalSignature;

const HomeCtrl = require("../controllers/HomeCtrl");

packages.router.get(
  "/order_items",
  //   [signatureSignerMiddleware, jwtMiddleWare],
  HomeCtrl.geAllITems
);

packages.router.delete(
  "/order_items/:id",
  [signatureSignerMiddleware, jwtMiddleWare],
  HomeCtrl.deleteItemById
);

module.exports = packages.router;
