
const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan')
const path = require("path");

const NewCars = require("./models/newCarsModel");

const app = express();

// MIDDLEWARES
app.use(express.json());    
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));     
// pug
app.set('view engine', 'pug');    
app.set("views", path.join(__dirname, "views"));


// =============   DATABASE   =================
const DB = `mongodb+srv://carWorldAvdhesh:aQw9j5XOuCWLVHnE@cluster0.kzcjw.mongodb.net/cars?retryWrites=true&w=majority`
mongoose.set('strictQuery', false);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,  
  // useFindAndModify: true,
  useUnifiedTopology: true,
})
.then( () => console.log('DB connection successful') );

// Import the querystring module 
const querystring = require("querystring");  
app.get("/", (req, res) => {

    let obj = { 
        name: "nabendu", 
        access: true,  
        role: ["developer", "architect", "manager"],  
    };  
    // Use the stringify() method on the object  
    let queryString = querystring.encode(obj);  
    console.log("Query String 1:", querystring.encode(obj));

    res.send("Done");
})

/* 
place pagination at the bottom of the overview page
.search__cars {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding: 5em;
    font-size: .2em;
}
*/


app.get("/newCars", async (req, res) => {
    console.log("*** newCarsCOntroller.js :: getAllCars ***");
    
    try {
        // console.log("*** complete query: *** ", req.query);
            
        const queryObj = { ...req.query };             

        // 1A. Filtering
        const excludedFields = ["sort", "limit", "page", "fields"];
        excludedFields.forEach(curr => delete queryObj[curr]);

        // 1B. Advanced filtering: gte
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);  
    
        let query = NewCars.find(JSON.parse(queryString));
  
        // Sorting
        if (req.query.sort) {  
            query = query.sort(req.query.sort);
        }       

        // ==== Execute the query   ====
        let cars = await query;
        let totalCars = cars.length;
                
        // Pagination
        const page = req.query.page * 1 || 1;    
        const limit = req.query.limit * 1 || 9;    
        const skip = (page - 1) * limit;

        let paginationActiveBtn = page;

        query = query.skip(skip).limit(limit);
    
        // ==== Execute the query with pagination   ====
        cars = await query;

        // ==== Constructing pagination URL   ====
        let paginateURL = req.protocol + '://' + req.get('host') + req.originalUrl;
        // if queryString is not present      
        if (Object.keys(req.query).length === 0) {       
            paginateURL = paginateURL + "?"; 
        } else if (!req.query.page) {   
            paginateURL = paginateURL + "&";   
        } else {   
            paginateURL = paginateURL.split("page")[0];
        }

        let paginationBtnCount = totalCars / 9;
        if (totalCars % 9 !== 0) {
            paginationBtnCount = Math.floor(paginationBtnCount) + 1;
        } 
        console.log("length", totalCars, "paginationBtnCount",paginationBtnCount);
        
        res.status(200).render("overview", {  
            title: "New Cars",          
            length: cars.length, 
            paginateURL,
            paginationBtnCount,
            paginationActiveBtn,
            cars: cars
        });
    } catch (err) {
        console.log(err);     
        res.status(404).json({
            status: 'fail',
            message: err
        });  
    }
    
});









app.listen(3000, () => {
    console.log("** Server running on the port 3000 **");
})






































