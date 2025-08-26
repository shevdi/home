import mongoose, { Schema } from 'mongoose'


const linksSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
  }
)

const pageSchema = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String },
    url: { type: String },
    links: [linksSchema],
  }
)

export const Page = mongoose.model('pages', pageSchema)
