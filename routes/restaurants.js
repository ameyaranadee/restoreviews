var express = require("express");
var router  = express.Router();
var Restaurant = require("../models/restaurant");
var Review = require("../models/review");
var middleware = require("../middleware");
var request = require("request");

//INDEX - show all restaurants
router.get("/", function(req, res){
    // Get all restaurants from DB
    Restaurant.find({}, function(err, allRestaurants){
       if(err){
           console.log(err);
       } else {
                res.render("restaurants/index",{restaurants:allRestaurants});
            }
    });
});

//CREATE - add new restaurant to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to restaurants array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var address = req.body.address;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newRestaurant = {name: name, image: image, description: desc, address: address, author:author}
    // Create a new restaurant and save to DB
    Restaurant.create(newRestaurant, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to restaurants page
            console.log(newlyCreated);
            res.redirect("/restaurants");
        }
    });
});

//NEW - show form to create new restaurant
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("restaurants/new"); 
});

// SHOW - shows more info about one restaurant
router.get("/:id", function(req, res){
    //find the restaurant with provided ID
    Restaurant.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundRestaurant){
        if(err){
            console.log(err);
        } else {
            console.log(foundRestaurant)
            //render show template with that restaurant
            res.render("restaurants/show", {restaurant: foundRestaurant});
        }
    });
});

// Restaurant Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Restaurant.findById(req.params.id, function (err, foundRestaurant) {
        if (err) {
            console.log(err);
            return res.redirect("/restaurants");
        }

        // check if req.user._id exists in foundRestaurant.likes
        var foundUserLike = foundRestaurant.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundRestaurant.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundRestaurant.likes.push(req.user);
        }

        foundRestaurant.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/restaurants");
            }
            return res.redirect("/restaurants/" + foundRestaurant._id);
        });
    });
});

// EDIT RESTAURANT ROUTE
router.get("/:id/edit", middleware.checkUserRestaurant, function(req, res){
    console.log("IN EDIT!");
    //find the restaurant with provided ID
    Restaurant.findById(req.params.id, function(err, foundRestaurant){
        if(err){
            console.log(err);
        } else {
            //render show template with that restaurant
            res.render("restaurants/edit", {restaurant: foundRestaurant});
        }
    });
});

// UPDATE RESTAURANT ROUTE
router.put("/:id", function(req, res){
    delete req.body.campground.rating;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.desc, address: req.body.address};
    Restaurant.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, restaurant){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/restaurants/" + restaurant._id);
        }
    });
});

// DESTROY RESTAURANT ROUTE
router.delete("/:id", middleware.checkUserRestaurant, function (req, res) {
    Restaurant.findById(req.params.id, function (err, restaurant) {
        if (err) {
            res.redirect("/restaurants");
        } else {
            // deletes all comments associated with the restaurant
            Comment.remove({"_id": {$in: restaurant.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/restaurants");
                }
                // deletes all reviews associated with the restaurant
                Review.remove({"_id": {$in: restaurant.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/restaurants");
                    }
                    //  delete the restaurant
                    restaurant.remove();
                    req.flash("success", "Restaurant deleted successfully!");
                    res.redirect("/restaurants");
                });
            });
        }
    });
});


//middleware
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "You must be signed in to do that!");
//     res.redirect("/login");
// }

module.exports = router;