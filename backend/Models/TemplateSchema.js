
const mongoose = require('mongoose');
const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['task', 'project', 'resource', 'checklist']
    },
    organization: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    description: String,
    content: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    defaultValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    fields: [{
      name: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['string', 'number', 'boolean', 'date', 'array', 'object', 'reference'] 
      },
      required: Boolean,
      defaultValue: mongoose.Schema.Types.Mixed,
      options: [mongoose.Schema.Types.Mixed], // For select fields
      validation: String // JS validation function string
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastUsed: Date,
    usageCount: { type: Number, default: 0 }
  }, { timestamps: true });