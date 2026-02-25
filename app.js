const express = require('express');
const app = express();  
const mongoose = require('mongoose');
const Listing = require('./models/applications/listings');
const path = require('path');
const ejsMate = require('ejs-mate');
// const Job = require('./views/job');

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const MONGO_URI = 'mongodb://127.0.0.1:27017/jobportal';
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);

main().then(() => {
    console.log("connected to mongodb");
}).catch((err) => {
    console.log("error connecting to mongodb: " + err);
});

async function main() {
    await mongoose.connect(MONGO_URI);
}

const port = 8080;

app.get('/', (req, res) => {
    res.send("i am root");
});

// app.get("/testlistings", async (req, res) => {
//     const newListing = new Listing({
//         title: "Software Engineer",
//         company: "Tech Company",
//         location: "San Francisco, CA",
//         category: "Engineering",
//         description: "We are looking for a skilled software engineer to join our team.",
//         salary: "$120,000 - $150,000"
//     });
//     await newListing.save();
//     res.json(newListing);
// });

// INDEX
app.get("/listings", async (req, res) => {
    const listings = await Listing.find({});
    res.render("index", { listings });
});

// NEW (form page)
app.get("/listings/new", (req, res) => {
    
    res.render("new");
});

// CREATE (save to DB)
// CREATE
app.post("/listings", async (req, res) => {
    try {
        const newJob = new Listing(req.body);
        await newJob.save();
        res.redirect("/listings");
    } catch (err) {
        console.log(err);
        res.send("Error creating job");
    }
});
// UPDATE route
app.put("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, req.body, { new: true });
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log(err);
        res.send("Error updating job");
    }
});

app.get("/dashboard", async (req, res) => {
    try {
        const totalJobs = await Listing.countDocuments();
        const jobs = await Listing.find().sort({ _id: -1 }).limit(5);

        res.render("dashboard", { totalJobs, jobs });
    } catch (err) {
        console.log(err);
        res.send("Error loading dashboard");
    }
});

app.get("/listings/:id/edit", async (req, res) => {
    const { id } = req.params;
    const job = await Listing.findById(id);
    res.render("edit", { job });
});

// SHOW (must be last)
app.get("/listings/:id", async (req, res) => {
    const { id } = req.params;
    const job = await Listing.findById(id);
    res.render("show", { job });
});

//delete route
app.delete("/listings/:id", async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

app.listen(port, () => {
    console.log("server is running on port " + port);
});
