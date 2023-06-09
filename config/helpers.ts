const sendError = (message: string) => {
  var error = {
    status: "ERROR",
    message,
  };

  return error;
};

const sendSuccess = (message: string) => {
  var success = {
    status: "SUCCESS",
    message,
  };

  return success;
};

const checkSpecialChr = async (item: string) => {
  var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return format.test(item);
};

function hasWhiteSpace(s: string) {
  return /\s/g.test(s);
}

function checkNumber(n: string) {
  return /^\d+$/.test(n);
}

module.exports = {
  sendError,
  checkNumber,
  sendSuccess,
};
