import express from 'express';
import database from '../helpers/database.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import request from 'request';
//import exif from 'exif';

const upload = multer();
const router = express.Router({mergeParams: true});

async function getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
          if (videoStream) {
            const width = videoStream.width;
            const height = videoStream.height;
            resolve({ width, height });
          } else {
            reject(new Error('No video stream found in the file'));
          }
        }
      });
    });
}

router.get("/", async (req, res) => {
    try {
        const board = req.params.name;

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const posts = await database.getPosts(board);

        return res.status(200).json(posts);
    } catch(err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

function verifyCaptcha(value) {
    return new Promise((resolve) => {
        request.post(`https://hcaptcha.com/siteverify`, {
            formData: {
                response: value, 
                secret: "hcaptcha_sitekey"
            },
            json: true
        }, (err, res, body) => {
            if (body.success != true) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

router.post("/", upload.single('image'), async (req, res) => {
    try {
        const board = req.params.name;

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const file = req.file;
        const name = req.body.name;
        const subject = req.body.subject;
        const comment = req.body.comment;
        const captcha = req.body.captcha;

        if (!captcha) {
            return res.status(400).json({
                message: "Invalid captcha submitted."
            });
        }

        const output = await verifyCaptcha(captcha);

        if (!output) {
            return res.status(400).json({
                message: "Invalid captcha submitted."
            });
        }

        let replyTo = 0;
        let in_thread = 0;
        let fileData = {};

        if (req.body.reply_to) {
            replyTo = req.body.reply_to;
        }

        if (req.body.in_thread) {
            in_thread = req.body.in_thread == null ? 0 : req.body.in_thread;
        }

        if ((!name || name == "") && (!subject || subject == "") && (!comment || comment == "") && in_thread == 0) {
            return res.status(400).json({
                message: "You haven't selected a post to reply to, please enter a subject to create a new thread or pick a post to reply to."
            });
        }

        if (in_thread == 0 && (!subject || subject == "")) {
            return res.status(400).json({
                message: "To create a thread, you need to provide a subject."
            });
        }

        if (!file && (comment == "" || !comment)) {
            return res.status(400).json({
                message: "To make an empty post, you need to provide an image."
            });
        }

        let valid = await database.validThread(board, in_thread);

        if (in_thread != 0 && !valid) {
            return res.status(404).json({
                message: "Thread not found"
            });
        }

        let post = await database.getPost(board, replyTo);

        if (in_thread != 0 && replyTo != 0 && post == null) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (in_thread == 0 && replyTo != 0) {
            return res.status(400).json({
                message: "What are you replying to?"
            });
        }

        if (file && file.size > 20000000) {
            return res.status(400).json({
                message: "Max file size reached, 20mb or lower please."
            });
        }

        if (file) {
            let extension = path.extname(file.originalname);
            fileData.name = `${Date.now()}${extension}`;
            fileData.size = file.size;
            fileData.originalname = file.originalname;
            fileData.link = `https://lunachan.org/uploads/${board}/files/${fileData.name}`;

            if (!fs.existsSync(`/root/lunachan/backend/uploads/${board}`)) {
                fs.mkdirSync(`/root/lunachan/backend/uploads/${board}`);
                fs.mkdirSync(`/root/lunachan/backend/uploads/${board}/files`);
            }

            fs.writeFileSync(`/root/lunachan/backend/uploads/${board}/files/${fileData.name}`, file.buffer);

            if (fileData.name.includes("jpg") || fileData.name.includes("png") || fileData.name.includes("webp") || fileData.name.includes("gif")) {
                const data = fs.readFileSync(`/root/lunachan/backend/uploads/${board}/files/${fileData.name}`);
                const metadata = await sharp(data).metadata();
                const { width, height } = metadata;
    
                fileData.width = width;
                fileData.height = height;
            } else {
                //video
                const { width, height } = await getVideoMetadata(`/root/lunachan/backend/uploads/${board}/files/${fileData.name}`);
                
                fileData.width = width;
                fileData.height = height;
            }
            
            //const fileBeforeExif = fs.readFileSync(`/root/lunachan/backend/uploads/${board}/files/${fileData.name}`);

            //const strippedData = exif.remove(fileBeforeExif);

            //fs.writeFileSync(`/root/lunachan/backend/uploads/${board}/files/${fileData.name}`, strippedData);
        }

        const result = await database.createPost(board, subject, name, comment, in_thread, replyTo, !fileData ? null : fileData, false);

        if (result.author) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    } catch(err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
    
    /*
    return res.status(500).json({
        message: "Down for maintenance. Implementing better security, you can stress test then."
    });
    */
});

export default router;