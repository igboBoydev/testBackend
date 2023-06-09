export {};
require("dotenv").config();
import { NextFunction, response, Response } from "express";
const packages = require("../utils/packages");

// controllers
const HomeCtrl = require("../controllers/HomeCtrl");
const LoginCtrl = require("../controllers/LoginCtrl");

packages.router.post("/login", LoginCtrl.LoginHandler);

module.exports = packages.router;
