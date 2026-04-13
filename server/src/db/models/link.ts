import mongoose, { Schema } from 'mongoose'

const linkSchema = new Schema(
  {
    title: { type: String },
    name: { type: String },
    fileName: { type: String },
    description: { type: String },
    smSizeUrl: { type: String, required: true },
    mdSizeUrl: { type: String, required: true },
    fullSizeUrl: { type: String, required: true },
    smSizeEntryId: { type: String },
    mdSizeEntryId: { type: String },
    fullSizeEntryId: { type: String },
    priority: { type: Number },
    tags: [{ type: String }],
    accessedBy: {
      type: [
        new Schema(
          {
            userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
          },
          { _id: false },
        ),
      ],
      default: undefined,
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    private: { type: Boolean },
    location: {
      value: {
        country: [{ type: String }],
        city: [{ type: String }]
      },
      nominatim: { type: Schema.Types.Mixed },
      dadata: { type: Schema.Types.Mixed }
    },
    meta: {
      mimeType: { type: String },
      size: { type: Number },
      width: { type: Number },
      height: { type: Number },
      gpsLatitude: { type: Number },
      gpsLongitude: { type: Number },
      gpsAltitude: { type: Number },
      make: { type: String },
      model: { type: String },
      takenAt: { type: String },
      takenAtDate: { type: Date },
    }
  },
  {
    timestamps: true,
  }
)

linkSchema.index({ 'accessedBy.userId': 1 }, { sparse: true })

export const Project = mongoose.model('project', linkSchema)
export const Photo = mongoose.model('photo', linkSchema)
