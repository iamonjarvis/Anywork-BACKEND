import mongoose from "mongoose";

const { Schema } = mongoose;

const applicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["applied", "interview", "hired", "rejected"], 
    default: "applied" 
  },
  comments: { type: String, default: "" },
  appliedAt: { type: Date, default: Date.now },
});

const Application = mongoose.model("Application", applicationSchema);
export default Application;
