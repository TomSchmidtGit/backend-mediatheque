import mongoose from 'mongoose';
import slugify from 'slugify';

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  }
}, { timestamps: true });

TagSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

const Tag = mongoose.model('Tag', TagSchema);
export default Tag;
