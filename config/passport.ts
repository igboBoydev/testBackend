export {};
const packages = require("../utils/packages");
const db = require("../index");

const JWTStrategy = packages.passportJWT.Strategy;
var ExtractJWT = packages.passportJWT.ExtractJwt;
var opts: any = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

var LocalStrategy = require("passport-local").Strategy;

function verifyUser(oauth: any, sellersDataSet: any) {
  packages.passport.use(
    new JWTStrategy(opts, async (jwt_payload: any, done: any) => {
      var checkToken = await oauth.findOne({
        seller_id: jwt_payload.seller_id,
        iat: jwt_payload.iat,
        exp: jwt_payload.exp,
      });

      if (!checkToken) {
        return done({ message: "Unathorized" });
      }

      await sellersDataSet
        .findOne({
          seller_id: jwt_payload.seller_id,
        })
        .then((user: any) => {
          if (!user) {
            return done({ message: "Unathorized" });
          }

          return done(null, user);
        })
        .catch((error: any) => {
          return done({ message: "Unathorized" });
        });
    })
  );
}

const signTokens = (user: any, token: string, Oauth: any) => {
  var token: string = packages.jwt.sign(
    {
      seller_id: user.seller_id,
      seller_zip_code_prefix: user.seller_zip_code_prefix,
      seller_city: user.seller_city,
      seller_state: user.seller_state,
    },
    process.env.SECRET,
    {
      expiresIn: 1800,
    }
  );
  var decoded = packages.jwt_decode(token);
  Oauth.insertOne(decoded);
  return token;
};

module.exports = { verifyUser, signTokens };
