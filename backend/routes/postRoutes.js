const express = require("express"); 
const route = express.Router();
const { 
    createPostController, 
    getUserPostsController, 
    deletePostController, 
    toggleStatusController,
    getAllPostsController,
    updatePostController,
    generatePostAIController
} = require("../controllers/postController");

route.post("/create-post", createPostController);
route.post("/generate-ai", generatePostAIController);
route.get("/user-posts/:email", getUserPostsController);
route.delete("/delete-post/:id", deletePostController);
route.put("/toggle-status/:id", toggleStatusController);
route.get("/all-posts", getAllPostsController);
route.put("/update-post/:id", updatePostController);

module.exports = route;
