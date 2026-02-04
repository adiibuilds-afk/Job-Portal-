const mongoose = require('mongoose');
const slugify = require('slugify');

const JobSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  slug: { type: String, unique: true },
  location: { type: String },
  eligibility: { type: String },
  salary: { type: String },
  description: { type: String, default: '' },
  applyUrl: { type: String, default: '' },
  lastDate: { type: String },
  category: { type: String, default: 'General' },
  
  // Engineering Fields
  batch: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  jobType: { type: String, default: 'FullTime' },
  roleType: { type: String, default: 'Engineering' },
  seniority: { type: String, default: 'Entry' }, // Entry, Mid, Senior
  minSalary: { type: Number, default: 0 },
  isRemote: { type: Boolean, default: false },

  // Analytics & Status
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  reportCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// SEO-friendly slug: "sde-intern-at-google-2025"
JobSchema.pre('save', async function() {
  if (!this.isModified('title') && this.slug) return;
  
  const title = this.title || 'job';
  const company = this.company || 'company';
  const year = new Date().getFullYear();
  const shortId = Math.random().toString(36).substr(2, 4);
  
  this.slug = slugify(`${title}-at-${company}-${year}-${shortId}`, { lower: true, strict: true });
});

module.exports = mongoose.model('Job', JobSchema);
