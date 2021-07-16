class API_Features {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeItems = ['sort', 'limit', 'page', 'fields'];
    excludeItems.forEach((element) => {
      delete queryObj[element];
    });
    let queryString = JSON.stringify(queryObj);
    queryString = JSON.parse(
      queryString.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    );

    this.query.find(queryString);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortingCriteria = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortingCriteria);
      console.log(sortingCriteria);
    } else {
      this.query = this.query.sort('difficulty');
    }
    return this;
  }

  selectField() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    if (this.queryString.page) {
      const page = this.queryString.page || 1;
      const limit = +this.queryString.limit || 10;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}

module.exports = API_Features;
