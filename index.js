const express = require('express')
const { PrismaClient, Prisma } = require('@prisma/client')
const cors = require('cors')
const cookies = require('cookie-parser')

const prisma = new PrismaClient()
const app = express()
const port = 3000

app.use(cookies())
app.use(cors({ allowedHeaders: ['Content-Type'] }))
app.use(express.json())

const protectedPath = ['/forget', '/index', '/profile', '/recovered', '/settings', ]

app.use((req, res, next) => {
    if (req.method != "GET") return next()
    console.log(req.url in protectedPath)
    if (req.url in protectedPath) {
        if (!req.cookies["email"]) {
            return res.redirect('/signin')
        }
    } else {
        next()
    }
})

app.use(express.static('static', { extensions: ['html'] }))


app.post('/register', async(req, res) => {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    })

    console.log(user)

    if (!user) {
        await prisma.user.create({
            data: {
                email,
                password
            }
        })

        return res.sendStatus(201)
    } else {
        return res.sendStatus(409)
    }
})

app.post('/signin', async(req, res) => {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    })

    if (user.password == password) {
        res.cookie('email', email, { httpOnly: false, maxAge: 86400 })
        return res.sendStatus(200)
    } else {
        return res.sendStatus(401)
    }
})

app.patch('/password', async(req, res) => {
    const { email, password, newPassword } = req.body
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    })

    if (password != user.password) {
        return res.sendStatus(401)
    } else {
        await prisma.user.update({
            where: {
                email
            },
            data: {
                password: newPassword
            }
        })
        return res.sendStatus(200)
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})