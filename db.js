import mongoose from "mongoose";
const connectDB = async () =>{
    try {
        const db_url = process.env.DB_URL
        if(!db_url){
            console.log("There is error in my backend");
            throw new Error("DB_URL is missing");
        }
        const result = await mongoose.connect(db_url)
        if(result){
            console.log("Database is Connected");
        }
    } catch (error) {
        console.log("Database is not connected", error);
    }
}
export default connectDB