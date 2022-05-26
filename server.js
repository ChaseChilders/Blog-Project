const http = require("http");
const express = require("express");
const es6Renderer = require("express-es6-template-engine");
const pgPromise = require("pg-promise")();
const bodyParser = require("body-parser");

const hostname = "localhost";
const port = 3001;
const config = {
  host: "localhost",
  port: 5432,
  database: "bloganon",
  user: "postgres",
};

const app = express();
const server = http.createServer(app);
const db = pgPromise(config);

app.engine("html", es6Renderer);
app.set("views", "templates");
app.set("view engine", "html");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes go here
app.get("/", (req, res) => {
  res.send("This is the blog post website");
});
app.get("/posts", (req, res) => {
  db.query("SELECT * FROM posts;").then((results) => {
    res.render("layout", {
      partials: {
        body: "/partials/post-list",
      },
      locals: {
        title: "Blog Posts",
        posts: results,
      },
    });
  });
});

app.get("/posts/new", (req, res) => {
  res.render("layout", {
    partials: {
      body: "partials/post-form",
    },
    locals: {
      title: "add a blog post",
    },
  });
});

app.post("/posts/new", (req, res) => {
  const name = req.body.name;
  const post = req.body.blog_text;
  db.query("INSERT INTO posts (name) values ($1)", [name]).then(() => {
    res.send("created");
  });
});

app.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  db.oneOrNone("SELECT * FROM posts WHERE id = $1", [id])
    .then((post) => {
      if (!post) {
        res.status(404).json({ error: "post not found" });
        return;
      }
      res.render("layout", {
        partials: {
          body: "partials/post-details",
        },
        locals: {
          title: post.name,
          post: post,
        },
      });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).json({ error: "invalid ID" });
    });
});

app.get("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
