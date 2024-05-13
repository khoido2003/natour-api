import mongoose, { Document, Model, Query } from "mongoose";
import slugify from "slugify";

// Interface for the Tour document
interface ITour extends Document {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingAverage: number;
  ratingQuantity: number;
  price: number;
  discount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  secretTour: boolean;
  startLocation: {
    type: string;
    coordinates: number[];
    address: string;
    description: string;
  };
  locations: {
    types: string;
    coordinates: number[];
    address: string;
    description: string;
    day: number;
  }[];
  guides: mongoose.Types.ObjectId[];
}

// Interface for the Tour model
interface ITourModel extends Model<ITour> {}

// Interface for the Tour query middleware
interface ITourQueryMiddleware extends Query<any, ITour, any> {
  start?: number;
}

/////////////////////////

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name!"],
      unique: true,
      trim: true,
      maxLenght: [40, "A tour name must have less or eqal 40 characters!"],
      minLenght: [10, "A tour name must have more or eqal 10 characters!"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a maxGroupSize"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium or difficult",
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val: number) => Math.round(val * 10) / 10,
    },

    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },

    discount: {
      type: Number,
      validate: {
        validator: function (val: number) {
          return val < this.price;
        },
        message: "Discount price should be below the price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary!"],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GEOJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },

      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        types: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({
  price: 1,
  ratingAverage: -1,
});

tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

/////////////////////////////

// MONGOOSE MIDDLEWARE
tourSchema.pre<ITour>("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre<ITourQueryMiddleware>(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// tourSchema.pre<ITourQueryMiddleware>(/^find/, function (next) {
//   this.populate({
//     path: "guides",
//     select: "-__v -passwordChangedAt",
//   });
//   next();
// });

export const TourModel = mongoose.model<ITourModel>("Tour", tourSchema);

export const createTourFn = (values: Record<string, any>) => {
  return new TourModel(values).save().then((tour) => tour.toObject());
};

export const getTourByIdFn = (id: string) => {
  return TourModel.findById(id);
};

export const getAllTourFn = () => {
  return TourModel.find({});
};

export const deleteTourByIdFn = (id: string) => {
  return TourModel.findByIdAndDelete(id);
};
