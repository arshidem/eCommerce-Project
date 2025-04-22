const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },

  houseNo: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  pin: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },

  isDefault: { 
    type: Boolean, 
    default: false 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-update `updatedAt` field before saving
AddressSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Automatically set the first address as default
AddressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    const existingDefaultAddress = await AddressModel.findOne({ userId: this.userId, isDefault: true });
    if (existingDefaultAddress) {
      existingDefaultAddress.isDefault = false;
      await existingDefaultAddress.save();
    }
  }
  next();
});

// Define model as AddressModel
const AddressModel = mongoose.model('AddressModel', AddressSchema);
module.exports = AddressModel;
