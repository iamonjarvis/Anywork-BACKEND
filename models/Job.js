import mongoose from "mongoose";

const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicants: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["applied", "accepted", "rejected"], default: "applied" },
        comments: { type: String, default: "" },
      },
    ],
    status: { type: String, enum: ["open", "closed"], default: "open" },
    lat: { type: Number, required: true },  // Latitude for the job location
    lng: { type: Number, required: true },  // Longitude for the job location
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically adds updatedAt and createdAt
  }
);

jobSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now(); // Update updatedAt when job is modified
  }
  next();
});

const Job = mongoose.model("Job", jobSchema);
export default Job;
