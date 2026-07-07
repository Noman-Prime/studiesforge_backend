import mongoose from "mongoose"

const SliderSchema = mongoose.Schema({
    image: {
        public_id: String,
        url: String
    },
    description: {
        type: String,
    }
},{timestamps: true})

const slider = mongoose.model("SliderData", SliderSchema)
export default slider