import { Query } from "mongoose";

class APIFeatures {
  query: Query<any, any, any>;
  queryString: Record<string, any>;

  constructor(query: Query<any, any, any>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };

    // These fields will be used for api features
    const excludeFields = ["page", "sort", "limit", "fields"];

    //Delete specific fields in the query string
    excludeFields.forEach((el) => delete queryObject[el]);

    //Advanced filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortby = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortby);
    } else {
      this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    // 3, Fields limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");

      this.query = this.query.select(fields);
    } else {
      // To exclude the "__v" field from the result
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    //page=2&limit=10: 1-10:pag1 1, 11-20:page 2,...
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
