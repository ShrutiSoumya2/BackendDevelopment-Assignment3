function errorHandler(err, req, res, next) {
  console.log(err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    const errorList = [];
    for (const field in err.errors) {
      errorList.push(err.errors[field].message);
    }
    message = errorList.join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate record already exists";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({ message: message });
}

export default errorHandler;