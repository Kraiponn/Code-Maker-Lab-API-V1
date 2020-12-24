const path = require("path");

const express = require("express");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const xss = require("xss-clean");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");

// Include routes and error handler
const errorHandler = require("./middlewares/errorHandler");
const defaultApiRouter = require("./routes/index");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/users");
const categoryRoute = require("./routes/categories");
const bookCategoryRoute = require("./routes/bookCategories");
const foodCategoryRoute = require("./routes/foodCategories");
const foodRoute = require("./routes/foods");
const bookRoute = require("./routes/books");

// Load configulation
dotenv.config({ path: "./config/config.env" });

// Import mongodb connection
const connectDB = require("./config/db");

// Connection DB
connectDB();

const app = express();

// Set cookie parser
app.use(cookieParser());

// Enable body parser
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ extended: false }));

// Setting default public path
app.use(express.static(path.join(__dirname, "public")));

// HTTP request logger middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Protect against HTTP Parameter Pollution attacks
app.use(hpp());

// Prevent secure headers
app.use(helmet());

// Sanitize user input coming from POST body, GET queries
app.use(xss());

// Enable cross origin
app.use(cors());

// prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Limit repeated requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
//  apply to all requests
app.use(limiter);

// Mounts routes
app.use("/", defaultApiRouter);
app.use("/api/v2/auth", authRoute);
app.use("/api/v2/users", adminRoute);
app.use("/api/v2/categories", categoryRoute);
app.use("/api/v2/bookcategories", bookCategoryRoute);
app.use("/api/v2/foodcategories", foodCategoryRoute);
app.use("/api/v2/books", bookRoute);
app.use("/api/v2/foods", foodRoute);

app.use(errorHandler);

// Load port for run
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`.yellow
      .underline.bold
  );
});
