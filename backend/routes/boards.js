import express from 'express';
import posts from '../routes/posts.js';
import database from '../helpers/database.js';
import generalUtils from '../helpers/general.js';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const boards = await database.getBoardsList();
    
        return res.status(200).json(boards);
    } catch(err) {
        console.log(err);
        
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

router.get("/stats", async (req, res) => {
    try {
        const boards = await database.getBoardsList();

        let lot = 0;
        let total = 0;
        let mostactive = "N/A";
        let maxPosts = 0;

        for (var boardname of boards) {
            let posts = await database.getPosts(boardname);

            total = total + posts.length;

            let postCount = posts.length;

            if (posts.length > 0) {
                for(var post of posts) {
                    if (post.file) {
                        lot = lot + post.file.file_size;
                    }
                }
            }

            if (postCount > maxPosts) {
                maxPosts = postCount;
                mostactive = `/${boardname}/`;
            }
        }

        return res.status(200).json({
            total_posts: total,
            content: generalUtils.formatBytes(lot),
            most_active: mostactive
        });
    } catch(err) {
        console.log(err);
        
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

router.get("/recent", async (req, res) => {
    try {
        const posts = await database.getRecentPosts();

        return res.status(200).json(posts);
    }
    catch(err) {
        console.log(err);
        
        return res.status(500).json({
            message: "Internal Server Error"
        });
    } 
});

router.get("/:name", async (req, res) => {
    try {
        const board = await database.getBoard(req.params.name);
    
        if (board == null) {
            return res.status(200).json({
                name: "Not Found",
                description: "The board you were looking for either doesn't exist or has since been shutdown."
            });
        } else {
            return res.status(200).json(board);
        }
    }
    catch(err) {
        console.log(err);
        
        return res.status(500).json({
            message: "Internal Server Error"
        });
    } 
});

router.use("/:name/posts/", posts);

export default router;