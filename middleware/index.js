var Comment = require("../models/comment");
var Restaurant = require("../models/restaurant");
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
    checkUserRestaurant: function(req, res, next){
        if(req.isAuthenticated()){
            Restaurant.findById(req.params.id, function(err, restaurant){
               if(restaurant.author.id.equals(req.user._id)){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   console.log("BADD!!!");
                   res.redirect("/restaurants/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    },
    checkUserComment: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
            Comment.findById(req.params.commentId, function(err, comment){
               if(comment.author.id.equals(req.user._id)){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/restaurants/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("login");
        }
    },
    checkReviewOwnership : function(req, res, next) {
        if(req.isAuthenticated()){
            Review.findById(req.params.review_id, function(err, foundReview){
                if(err || !foundReview){
                    res.redirect("back");
                }  else {
                    // does user own the comment?
                    if(foundReview.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.flash("error", "You don't have permission to do that");
                        res.redirect("back");
                    }
                }
            });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }
    },
    checkReviewExistence : function (req, res, next) {
        if (req.isAuthenticated()) {
            Restaurant.findById(req.params.id).populate("reviews").exec(function (err, foundRestaurant) {
                if (err || !foundRestaurant) {
                    req.flash("error", "Restaurant not found.");
                    res.redirect("back");
                } else {
                    // check if req.user._id exists in foundRestaurant.reviews
                    var foundUserReview = foundRestaurant.reviews.some(function (review) {
                        return review.author.id.equals(req.user._id);
                    });
                    if (foundUserReview) {
                        req.flash("error", "You already wrote a review.");
                        return res.redirect("/restaurants/" + foundRestaurant._id);
                    }
                    // if the review was not found, go to the next middleware
                    next();
                }
            });
        } else {
            req.flash("error", "You need to login first.");
            res.redirect("back");
        }
    }    
}