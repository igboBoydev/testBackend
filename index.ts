export {};
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const utill = require("./utils/packages");
import { Request, Response, NextFunction } from "express";
const MongoClient = require("mongodb").MongoClient;
require("./config/passport");
const verifyUser = require("./config/passport");
const signatureSigner = require("./middleware/checkSignatures");
const passport = require("passport");
require("dotenv").config();
const jwtMiddleWare = passport.authenticate("jwt", { session: false });
var signatureSignerMiddleware = signatureSigner.personalSignature;

const app = express();

// const url =
//   "mongodb+srv://xtremeCode:abelkelly@cluster0.xfv6o.mongodb.net/?retryWrites=true&w=majority";

const url = "mongodb://localhost:27017";

const port = 5000;

MongoClient.connect(url)
  .then((client: any) => {
    console.log("connected to mongodb server");

    const db = client.db("test_db");

    const orderItems = db.collection("olist_order_items_datasets");
    const productsDataSet = db.collection("olist_products_datasets");
    const oauth = db.collection("oauths");
    const sellersDataSet = db.collection("olist_sellers_datasets");

    verifyUser.verifyUser(oauth, sellersDataSet);

    module.exports = {
      oauth,
      sellersDataSet,
    };

    app.use(cors());
    app.use(express.json());

    app.post(
      "/login",
      async (req: Request, res: Response, next: NextFunction) => {
        const loginSchema = utill.Joi.object()
          .keys({
            seller_id: utill.Joi.string().required(),
            seller_zip_code_prefix: utill.Joi.number().required(),
          })
          .unknown();

        const validate = loginSchema.validate(req.body);

        if (validate.error != null) {
          const errorMessage = validate.error.details
            .map((i: any) => i.message)
            .join(".");
          return res.status(400).json(utill.helpers.sendError(errorMessage));
        }

        const { seller_id, seller_zip_code_prefix } = req.body;

        let user = await sellersDataSet.findOne({ seller_id: seller_id });

        if (!user) {
          return res
            .status(400)
            .json(utill.helpers.sendError("Account does not exist"));
        }

        if (user.seller_zip_code_prefix === seller_zip_code_prefix) {
          let random = utill.uuid();

          const token = verifyUser.signTokens(user, random, oauth);

          return res.status(200).json({
            success: {
              token,
            },
          });
        }

        return res.status(400).json({
          status: "ERROR",
          code: "01",
          message: "Incorrect email or password",
        });
      }
    );

    // save lesson into collection
    app.get(
      "/order_items",
      [signatureSignerMiddleware, jwtMiddleWare],
      async (
        req: any,
        res: Response,
        next: NextFunction
      ): Promise<Response> => {
        let { offset, limit } = req.query;
        let checkOffset = utill.helpers.checkNumber(offset);
        let checkLimit = utill.helpers.checkNumber(limit);

        if (!checkOffset || !checkLimit) {
          return res
            .status(200)
            .json(utill.helpers.sendError("Limit and offset must be numbers"));
        }
        let allUserItems = await orderItems
          .find({
            seller_id: req.user.seller_id,
          })
          .skip(parseInt(offset))
          .limit(parseInt(limit));

        let data = {
          allUserItems: await allUserItems.toArray(),
          total: await allUserItems.count(),
          offset,
          limit,
        };

        return res.status(200).json({ data });
      }
    );

    app.delete(
      "/order_items/:id",
      [signatureSignerMiddleware, jwtMiddleWare],
      async (
        req: any,
        res: Response,
        next: NextFunction
      ): Promise<Response> => {
        let { id } = req.params;
        if (!id) {
          return res
            .status(400)
            .json(utill.helpers.sendError("Kindly add a valid order id"));
        }
        let allUserItems = await orderItems.deleteOne({
          order_id: id,
        });

        if (allUserItems.deletedCount === 1) {
          return res
            .status(200)
            .json(utill.helpers.sendSuccess("Item deleted successfully"));
        }

        return res
          .status(400)
          .json(utill.helpers.sendError("Item not deleted"));
      }
    );

    app.put(
      "/account",
      [signatureSignerMiddleware, jwtMiddleWare],
      async (
        req: any,
        res: Response,
        next: NextFunction
      ): Promise<Response> => {
        const updateSchema = utill.Joi.object()
          .keys({
            seller_city: utill.Joi.string().allow(""),
            seller_state: utill.Joi.string().allow(""),
          })
          .unknown();

        const validate = updateSchema.validate(req.body);

        if (validate.error != null) {
          const errorMessage = validate.error.details
            .map((i: any) => i.message)
            .join(".");
          return res.status(400).json(utill.helpers.sendError(errorMessage));
        }

        const { seller_city, seller_state } = req.body;
        let updateSeller;

        if (seller_state && seller_city) {
          updateSeller = await sellersDataSet.updateOne(
            {
              seller_id: req.user.seller_id,
            },
            { $set: { seller_city: seller_city, seller_state: seller_state } }
          );
        } else if (seller_city && !seller_state) {
          updateSeller = await sellersDataSet.updateOne(
            {
              seller_id: req.user.seller_id,
            },
            { $set: { seller_city: seller_city } }
          );
        } else if (!seller_city && seller_state) {
          updateSeller = await sellersDataSet.updateOne(
            {
              seller_id: req.user.seller_id,
            },
            { $set: { seller_state: seller_state } }
          );
        } else {
          return res
            .status(400)
            .json(utill.helpers.sendError("Kindly add a valid state or city."));
        }

        return res.status(200).json({ seller_city, seller_state });
      }
    );

    // get all lessons from collection

    // Landing page
    app.use("/", (req: any, res: any, next: any) => {
      res.status(200).json({ success: true });
    });

    module.exports = app.listen(port, () =>
      console.log("listening on port " + port)
    );
  })
  .catch(console.error);
