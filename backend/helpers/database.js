import Pool from "pg";
import generalUtils from "./general.js";

const configuration = {
    user: 'username',
    host: 'localhost',
    database: 'database_name',
    password: 'password',
    port: 5432
}

const pool = new Pool.Pool(configuration);

const database = {
    client: null,
    async runQuery(queryString, values) {
        if (database.client == null) {
            database.client = await pool.connect();
            database.client.on('error', () => {});
            database.client.connection.on('error', () => {});
        }
        
        try {
            const query = {
                text: queryString,
                values: values
            };

            const result = await database.client.query(query);
            const rows = result.rows;

            if (rows.length === 0) {
                return null;
            }
    
            return rows;
        } catch (error) {
            console.log(error);

            return null;
        }
    },
    async setupDatabase() {
        try {
            await database.runQuery(`
                CREATE TABLE IF NOT EXISTS boards (
                    name TEXT,
                    banner_image TEXT DEFAULT NULL,
                    banner_description TEXT DEFAULT NULL
                );
            `, []);

            await database.runQuery(`
                CREATE TABLE IF NOT EXISTS posts (
                    number INTEGER DEFAULT 1,
                    board_name TEXT,
                    content TEXT DEFAULT NULL,
                    subject TEXT DEFAULT NULL,
                    author TEXT DEFAULT 'Anonymous',
                    date TEXT,
                    reply_to INTEGER DEFAULT 0,
                    pinned INTEGER DEFAULT 0,
                    thread_number INTEGER DEFAULT 0
                );
            `, []);

            await database.runQuery(`
                CREATE TABLE IF NOT EXISTS posts_files (
                    number INTEGER DEFAULT 1,
                    board_name TEXT,
                    file_name TEXT,
                    original_file_name TEXT,
                    link TEXT,
                    file_width INTEGER DEFAULT 0,
                    file_height INTEGER DEFAULT 0,
                    file_size INTEGER DEFAULT 0
                );
            `, []);

            let boards = await database.getBoardsList();

            if (boards.length == 0) {
                await this.createBoard("gen", null, "general discussion / anything that doesn't fit in other boards");
                await this.createBoard("anime", "https://a0.anyrgb.com/pngimg/874/1216/anonymous-imgur-4chan-yuri-tongue-anime-girl-tooth-cool-hime-cut-screenshot.png", "all things manga and anime");
                await this.createBoard("tech", "https://myswordisunbelievablydull.files.wordpress.com/2011/07/coalgirls_serial_experiments_lain_03_1008x720_blu-ray_flac_92704257-mkv_snapshot_19-41_2011-07-19_19-10-52.jpg", "technology - the application of scientific knowledge (wow look at that definition)");
                await this.createBoard("psy", null, "psychology, psyops, whatever begins with psy");
                await this.createBoard("art", null, "appreciation of artwork - whatever catches your fancy i suppose");
                await this.createBoard("old", null, "old technology, software, iterations of applications, memories, memes and whatever else fits this broad description");
                await this.createPost("gen", "welcome to /gen/", "noia", "use common sense while posting pls\n\nthread wipes are once a week, max file size in general is 20mb. if you find any bugs with lunachan, please email letsall@lovelain.org thanks!", 0, 0, null, true);
                await this.createPost("anime", "welcome to /anime/", "noia", "please keep in the mind the following rule(s) before posting here:\n\n1 - no lolicon\n2 - pls dont post pirated content\n\nif you find any bugs with lunachan, please email letsall@lovelain.org thanks!", 0, 0, null, true);
                await this.createPost("tech", "welcome to /tech/", "noia", "use common sense while posting pls\n\nthread wipes are once a week, max file size in general is 20mb. if you find any bugs with lunachan, please email letsall@lovelain.org thanks!", 0, 0, null, true);
                await this.createPost("psy", "welcome to /psy/", "noia", "use common sense while posting pls\n\nthread wipes are once a week, max file size in general is 20mb. if you find any bugs with lunachan, please email letsall@lovelain.org thanks!", 0, 0, null, true);
                await this.createPost("art", "welcome to /art/", "noia", "use common sense while posting pls\n\nthread wipes are once a week, max file size in general is 20mb. if you find any bugs with lunachan, please email letsall@lovelain.org thanks!", 0, 0, null, true);
                await this.createPost("old", "welcome to /old/", "noia", "use common sense while posting pls\n\nthread wipes are once a week, max file size in general is 20mb. if you find any bugs with lunachan, please email letsall@lovelain.org thanks!", 0, 0, null, true);
            }
        }
        catch { }
    },
    async getRecentPosts() {
        try {
            const rows = await database.runQuery(`SELECT * FROM posts ORDER BY date DESC LIMIT 10`, []);

            if (rows != null && rows.length > 0) {
                const ret = [];

                for(var row of rows) {
                    ret.push({
                        board: row.board_name,
                        comment: row.content == 'NULL' ? "Empty comment": row.content,
                        in_thread: row.thread_number,
                        number: row.number
                    })
                }

                return ret;
            } else {
                return [];
            }
        } catch (error) {
            console.log(error);

            return [];
        }
    },
    async createBoard(name, banner_image, banner_description) {
        try {
            await database.runQuery(`INSERT INTO boards (name, banner_image, banner_description) VALUES ($1, $2, $3)`, [
                name, (banner_image == null ? 'NULL' : banner_image), banner_description
            ]);
        } catch(err) {
            console.log(err);

            return false;
        }
    },
    async validThread(board_name, number) {
        try {
            let post = await database.getPost(board_name, number);

            if (post == null) {
                return false;
            }

            if (post.in_thread == 0 && post.subject && !post.pinned) {
                return true;
            }

            return false;
        } catch(err) {
            console.log(err);

            return false;
        }
    },
    async createPost(board_name, subject, author, content, thread_number = 0, reply_to = 0, file = null, pinned = false) {
        try {
            const posts = await database.getPosts(board_name);
            let number = posts.length + 1;

            if (number == 1) {
                number = 0;
            }

            const date = new Date().toDateString();

            if (!author) {
                author = 'Anonymous';
            }

            if (content == "") {
                content = null;
            }

            if (thread_number == null) {
                thread_number = 0;
            }

            await database.runQuery(`INSERT INTO posts (number, board_name, content, subject, author, date, pinned, thread_number, reply_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
                number, board_name, content == null ? 'NULL' : content, subject == null ? 'NULL' : subject, author, date, pinned == true ? 1 : 0, thread_number, reply_to
            ]);

            if (file != null) {
                await database.runQuery(`INSERT INTO posts_files (number, board_name, file_name, original_file_name, link, file_width, file_height, file_size) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                    number, board_name, file.name, file.originalname, file.link, file.width, file.height, file.size
                ]);
            }

            return database.getPost(board_name, number);
        } catch(err) {
            console.log(err);

            return null;
        }
    },
    async getPost(board_name, number) {
        try {
            const board_posts = await database.getPosts(board_name);
            const post = board_posts.filter(x => x.number == number)[0];

            if (post) {
                return post;
            } else {
                return null;
            }
        } catch(err) {
            console.log(err);

            return null;
        }
    },
    async getPostFile(board_name, post_number) {
        try {
            const rows = await database.runQuery(`
                SELECT * FROM posts_files WHERE board_name = $1 AND number = $2
            `, [board_name, post_number]);

            if (rows != null && rows.length > 0 && rows[0].file_name != null) {
                return {
                    type: ((rows[0].file_name.includes(".mp4") || rows[0].file_name.includes(".mov") || rows[0].file_name.includes(".webm")) ? "vid" : "img"),
                    name: rows[0].file_name,
                    size: generalUtils.formatBytes(rows[0].file_size),
                    file_size: rows[0].file_size,
                    width: rows[0].file_width,
                    height: rows[0].file_height,
                    originalname: (rows[0].original_file_name.length > 15 ? rows[0].original_file_name.substring(0, 15) + '...' : rows[0].original_file_name),
                    link: rows[0].link
                }
            } else {
                return null;
            }
        } catch (error) {
            console.log(error);

            return null;
        }
    },
    async getPosts(board_name) {
        try {
            const rows = await database.runQuery(`
                SELECT * FROM posts WHERE board_name = $1
            `, [board_name]);

            if (rows != null && rows.length > 0) {
                const ret = [];

                for(var row of rows) {
                    let file = await database.getPostFile(row.board_name, row.number);

                    let post = {
                        subject: row.subject,
                        author: row.author,
                        pinned: row.pinned == 1 ? true : false,
                        date: row.date,
                        board: row.board_name,
                        number: row.number,
                        comment: row.content,
                        in_thread: row.thread_number,
                        reply: (row.reply_to && row.reply_to != 0) ? {
                            to: row.reply_to
                        } : null
                    };

                    if (post.subject == 'NULL') {
                        delete post.subject;
                    }

                    if (post.comment == 'NULL') {
                        delete post.comment;
                    }

                    if (file != null) {
                        post.file = file;
                    }

                    ret.push(post);
                }

                return ret;
            } else {
                return [];
            }
        } catch (error) {
            console.log(error);

            return [];
        }
    },
    async deletePost(board_name, number) {
        try {
            const rows = await database.runQuery(`
                DELETE FROM posts WHERE name = $1 AND number = $2
            `, [board_name, number]);

            return true;
        } catch (error) {
            console.log(error);

            return false;
        }
    },
    async getBoard(board_name) {
        try {
            const rows = await database.runQuery(`
                SELECT * FROM boards WHERE name = $1
            `, [board_name]);

            if (rows != null && rows.length > 0) {
                let board = {
                    name: rows[0].name,
                    image: rows[0].banner_image,
                    description: rows[0].banner_description
                };

                if (board.image == 'NULL') {
                    delete board.image;
                }

                return board;
            } else {
                return null;
            }
        } catch (error) {
            console.log(error);

            return null;
        }
    },
    async getBoardsList() {
        try {
            const rows = await database.runQuery(`
                SELECT * FROM boards
            `, []);

            if (rows != null && rows.length > 0) {
                const ret = [];

                for(var row of rows) {
                    ret.push(row.name);
                }

                return ret;
            } else {
                return [];
            }
        } catch (error) {
            console.log(error);

            return [];
        }
    }
};

export default database;