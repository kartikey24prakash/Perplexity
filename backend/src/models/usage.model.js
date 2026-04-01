import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        dateKey: {
            type: String,
            required: true,
        },
        messageCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

usageSchema.index({ user: 1, dateKey: 1 }, { unique: true });

const usageModel = mongoose.model("Usage", usageSchema);

export default usageModel;
