import express from "express";
import auth from "../middleware/auth.js";
import Job from "../models/Job.js";
import User from "../models/User.js"; // Assuming you have a User model

const router = express.Router();

// Middleware to check if the user is the employer of the job
const checkEmployer = async (req, res, next) => {
  const { jobId } = req.params; // Extract job ID from the request parameters
  try {
    const job = await Job.findById(jobId); // Fetch the job from the database
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Check if the authenticated user is the employer of the job
    if (!job.employer.equals(req.user.id)) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    next(); // User is authorized, proceed to the next middleware/handler
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all available (open) jobs
router.get("/available", async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $ne: "closed" } }) // `$ne` means "not equal"
      .populate("employer", "username email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch jobs for the logged-in user (applied and posted)
router.get("/dashboard", auth, async (req, res) => {
  try {
    const appliedJobs = await Job.find({
      "applicants.user": req.user.id,
    }).populate("employer", "username email");

    const postedJobs = await Job.find({ employer: req.user.id })
      .populate("applicants.user", "username email age name");

    res.json({ appliedJobs, postedJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a Job
router.post("/", auth, async (req, res) => {
  const { title, description, amount, location, date, time, lat, lng } = req.body;

  if (!title || !description || !amount || !location || !date || !time || !lat || !lng) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const job = new Job({
      title,
      description,
      amount,
      location,
      date,
      time,
      employer: req.user.id,
      lat,
      lng,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply to a Job
router.post("/:id/apply", auth, async (req, res) => {
  const { id } = req.params;
  const { comments } = req.body;

  const commentText = comments || "";

  try {
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.status === "closed") {
      return res.status(400).json({ error: "Cannot apply to a closed job" });
    }

    if (job.employer.equals(req.user.id)) {
      return res.status(400).json({ error: "Employer cannot apply for their own job" });
    }

    const alreadyApplied = job.applicants.some((applicant) => applicant.user.equals(req.user.id));
    if (alreadyApplied) {
      return res.status(400).json({ error: "Already applied" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    job.applicants.push({
      user: req.user.id,
      comments: commentText,
      name: user.name,
      age: user.age,
    });

    await job.save();

    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept an application
router.post("/:jobId/applications/:applicantId/accept", auth, checkEmployer, async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;

    const job = await Job.findById(jobId);
    const applicant = job.applicants.find((app) => app.user.equals(applicantId));
    if (!applicant) return res.status(404).json({ error: "Applicant not found" });

    applicant.status = "accepted";

    await job.save();

    res.json({ message: "Applicant accepted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject an application
router.post("/:jobId/applications/:applicantId/reject", auth, checkEmployer, async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;

    const job = await Job.findById(jobId);
    const applicant = job.applicants.find((app) => app.user.equals(applicantId));
    if (!applicant) return res.status(404).json({ error: "Applicant not found" });

    applicant.status = "rejected";

    await job.save();

    res.json({ message: "Applicant rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
