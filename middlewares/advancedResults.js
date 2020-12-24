const asyncHandler = require("express-async-handler");

const advancedResults = (model, populate1, populate2) =>
  asyncHandler(async (req, res, next) => {
    let query;

    // Copy request query
    const reqQuery = { ...req.query };
    // console.log(reqQuery);

    // Field to exclude
    let removeField = ["select", "sort", "limit", "page"];

    // Loop over removeField and delete them from reqQuery
    removeField.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators gt, gte, lt, lte or in
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = model.find(JSON.parse(queryStr));

    // Select
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const startIndex = (page - 1) * limit;
    const lastIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Query with populate
    if (populate1) {
      query = query.populate(populate1);
    }

    if (populate2) {
      query = query.populate(populate2);
    }

    // Pagination
    let pagination = {};

    if (lastIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    // Executing query
    const results = await query;

    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    next();
  });

module.exports = advancedResults;
