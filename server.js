const express = require("express");
const exphbs = require("express-handlebars");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 8080;

const db = require("./models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true }, (err) => {
        if (err) throw err;
        console.log("Connected to DB!");
    });


app.use(express.static("public"));

app.get("/", (req, res) => {
    db.Article
        .find({})
        .then(dbArticles => {
            res.render("home", { articles: dbArticles });
        });
});

app.get("/saved", (req, res) => {
    db.Article
        .find({})
        .populate("comments")
        .then(dbArticles => {
            res.render("saved", { articles: dbArticles });
        });
})

app.get("/delete", (req, res) => {
    db.Article
        .find({})
        .populate("comments")
        .then(dbArticles => {
            res.render("saved", { articles: dbArticles });
        });
})

app.get("/scrape", (req, res) => {
    axios
        .get("https://www.nbcsandiego.com/news/local/")
        .then(response => {
            const $ = cheerio.load(response.data);
            $("div.story").each(function (i, element) {
                let title = $(element).find("h3").text();
                let summary = $(element).find("p").text();
                let url = $(element).find("p").find("a.more").attr("href");

                let postObj = {
                    title: title,
                    summary: summary,
                    url: url
                };
                // console.log(postObj);
                db.Article
                    .create(postObj)
                    .then(dbArticle => console.log(dbArticle))
                    .catch(err => console.log(err));
            });
            res.redirect("/");
            //alert("News articles are up-to-date, Enjoy!")
            // res.send("Scarped data from NBC San Diego");
        });
});

app.post("/api/:articleId/comment", (req, res) => {
    db.Comment
        .create({body: req.body.body})
        .then(dbComment => {
            return db.Article.findOneAndUpdate({_id: req.params.articleId}, {$push: { comments: dbComment._id}}, {new: true})
        })
        .then(() => res.redirect("/saved"))
        .catch(err => res.json(err));
});


app.listen(PORT, () => console.log(`App is on http://localhost:${PORT}`));