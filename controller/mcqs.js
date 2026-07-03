import mcqs from "../models/mcqs.js"

export const createMCQS = async (req, res) => {
    try {
        console.log(req.body);
        const MCQS = await mcqs.create(req.body)
        await MCQS.populate("subject topic")
        if (!MCQS) {
            return res.status(400).json({
                success: false,
                message: "MCQS is not created"
            })
        }
        return res.status(201).json({
            success: true,
            mcqs: MCQS
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const updateMCQS = async (req, res) => {
    try {
        const { id } = req.params
        const MCQS = await mcqs.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!MCQS) {
            return res.status(400).json({
                success: false,
                message: "There is error while updating or finding"
            })
        }
        return res.status(200).json({
            success: true,
            mcqs: MCQS
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const deletetMCQS = async (req, res) => {
    try {
        const { id } = req.params
        const MCQS = await mcqs.findByIdAndDelete(id)
        if (!MCQS) {
            return res.status(400).json({
                success: false,
                message: "MCQS is not found"
            })
        }
        return res.status(200).json({
            success: true,
            mcqs: MCQS
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const getMCQS = async (req, res) => {
    try {
        const { id } = req.params
        const MCQS = await mcqs.findById(id).populate("subject").populate("topic")
        if (!MCQS) {
            return res.status(404).json({
                success: false,
                message: "MCQS is not found"
            })
        }
        return res.status(200).json({
            success: true,
            mcqs: MCQS
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            mesage: "Something went wrong"
        })
    }
}

export const getAllMCQS = async (req, res) => {
    try {
        const results = await mcqs.find().populate("subject").populate("topic")
        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "MCQS is not found"
            })
        }
        return res.status(200).json({
            success: true,
            mcqs: results
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            mesage: "Something went wrong"
        })
    }
}

export const SSE_Stream = async (req, res) => {
    try {
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.status(200)

        const stream = mcqs.watch()
        res.write(`data: ${JSON.stringify({ SSE_Stream: "Connected" })}\n\n`)
        stream.on("change", async (change) => {
            try {
                const MCQS = await mcqs.find()
                res.write(`data: ${JSON.stringify({ mcqs: MCQS })}\n\n`)
            } catch (error) {
                console.log(error);
                res.end()
            }
        })
        req.on("close", () => {
            stream.close()
            res.end()
        })
        return
    } catch (error) {
        console.log(`Stream is not working: ${error}`);
        res.end()
    }
}

export const getMCQSByTopic = async (req, res) => {
    try {
        const { id } = req.params
        const MCQS = await mcqs.find({ topic: id })
        if (!MCQS || MCQS.length === 0) {
            return res.status(404).json({
                success: false,
                mesage: "No mcqs is found"
            })
        }
        return res.status(200).json({
            success: true,
            mcqs: MCQS
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const getMCQSBySubject = async (req, res) => {
    try {
        const { id } = req.params
        const MCQS = await mcqs.find({ subject: id })
        if (!MCQS || MCQS.length === 0) {
            return res.status(404).json({
                success: false,
                mesage: "No mcqs is found"
            })
        }
        return res.status(200).json({
            success: true,
            mcqs: MCQS
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}