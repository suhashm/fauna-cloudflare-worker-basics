const faunadb = require('faunadb');
const fauna_secret = process.env.FAUNADB_SECRET
const client = new faunadb.Client({ secret: fauna_secret })

// FQL functions
const {
    Ref,
    Paginate,
    Get,
    Match,
    Select,
    Index,
    Create,
    Collection,
    Join,
    Call,
    Function: Fn,
} = faunadb.query;

const app = require('express')();
const express = require('express');

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get('/hello', async (req, res) => {
    const doc = 'hello world!'

    res.send(doc)
})

app.post('/tweet', async (req, res) => {
    const user = req.body.user
    const tweet = req.body.tweet
    if (user == undefined || tweet == undefined) {
        console.error("user not found in the req body")
    } else {
        // find the user and post a tweet

        const data = {
            user: Call(Fn("getUser"), user),
            // user: Select("ref", Get(Match(Index("users_by_name"), user))),
            text: tweet
        }

        const doc = await client.query(
            Create(
                Collection("tweets"),
                { data }
            )
        )
        res.send(doc)
    }

})

// tweets by user
app.get('/tweet/:id', async (req, res) => {
    const user_id = req.params.id
    if (user_id == undefined) {
        console.error("no user id passed in the request")
        res.send("no user id passed in the request")
    } else {
        const data = Paginate(
            Match(
                Index("tweets_by_user"),
                Call(Fn("getUser"), user_id),
                // Select("ref", Get(Match(Index("users_by_name"), user_id)))
            )
        )
        const result = await client.query(data)
        res.send(result.data)
    }
})

app.listen(5000, () => console.log('API  running on http://localhost:5000'))