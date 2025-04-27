const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogsDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema and model for blogs
const blogSchema = new mongoose.Schema({
    title: String,
    snippet: String,
    body: String,
});

const Blog = mongoose.model('Blog', blogSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Routes
// Serve Index.html (Blogs page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// Fetch blogs for Index.html
app.get('/blogs', async (req, res) => {
    const blogs = await Blog.find();
    res.json(blogs);
});

// Serve new_blog.html
app.get('/new_blog.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'new_blog.html'));
});

app.post('/submit-blog', async (req, res) => {
    console.log('Request body:', req.body); // Debugging log
    const { title, snippet, body } = req.body;

    try {
        const newBlog = new Blog({ title, snippet, body });
        await newBlog.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error saving blog:', error);
        res.status(500).send('An error occurred while saving the blog.');
    }
});

app.get('/blog/:id', async (req, res) => {
    const blogId = req.params.id;

    try {
        const blog = await Blog.findById(blogId);
        if (blog) {
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${blog.title}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                        }
                        header {
                            border-bottom: 1px solid #ddd;
                            margin-bottom: 20px;
                        }
                        header h1 {
                            font-size: 2.5em;
                            margin: 0;
                        }
                        header p {
                            color: #666;
                            margin: 0;
                        }
                        nav {
                            text-align: right;
                            margin-top: 10px;
                        }
                        nav a {
                            margin-left: 15px;
                            text-decoration: none;
                            color: #666;
                        }
                        nav a:hover {
                            text-decoration: underline;
                        }
                        main h2 {
                            font-size: 1.5em;
                            margin-bottom: 20px;
                        }
                        main p {
                            line-height: 1.6;
                            color: #666;
                        }
                        .delete-icon {
                            float: right;
                            cursor: pointer;
                        }
                        .delete-icon img {
                            width: 24px;
                            height: 24px;
                        }
                    </style>
                </head>
                <body>
                    <header>
                        <h1>NATHAN'S BLOG</h1>
                        <p>A NORMAL BLOG SITE</p>
                        <nav>
                            <a href="/">BLOGS</a>
                            <a href="/about.html">ABOUT</a>
                            <a href="/new_blog.html">NEW BLOG</a>
                        </nav>
                    </header>
                    <main>
                        <h2>${blog.title} 
                            <span class="delete-icon" onclick="deleteBlog('${blog._id}')">
                                <img src="/BLOGSITE/trash.png" alt="Delete">
                            </span>
                        </h2>
                        <p>${blog.body}</p>
                    </main>
                    <script>
                       async function deleteBlog(blogId) {
    console.log('Attempting to delete blog with ID:', blogId); // Debugging log
    const confirmDelete = confirm('Are you sure you want to delete this blog?');
    if (confirmDelete) {
        try {
            const response = await fetch('/blog/' + blogId, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Blog deleted successfully');
                window.location.href = '/'; // Redirect to the main blogs page
            } else {
                alert('Failed to delete the blog');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('An error occurred while deleting the blog');
        }
    }
}
                    </script>
                </body>
                </html>
            `);
        } else {
            res.status(404).send('Blog not found');
        }
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('An error occurred while fetching the blog.');
    }
});

app.delete('/blog/:id', async (req, res) => {
    const blogId = req.params.id;
    console.log('Deleting blog with ID:', blogId); // Debugging log
    try {
        await Blog.findByIdAndDelete(blogId);
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'An error occurred while deleting the blog' });
    }
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});