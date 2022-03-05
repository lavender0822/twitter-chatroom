const { User, Chatroom } = require('../models')
const helpers = require('../_helpers')

const chatroomController = {
    getChatroom: async (req, res, next) => {
        const chatroom = await Chatroom.findAll({
            order: [['createdAt', 'ASC']],
            include: [{ model: User }]
        })

        try {
            if (!chatroom) return res.json({ chatroom: [] })
            return res.json({ chatroom })
        } catch (err) { next(err) }
    },

    postChatroom: (req, res, next) => {
        const UserId = helpers.getUser(req).id
        const { text } = req.body
        return Chatroom.create({ UserId, text })
        .then(() => res.json({ status: 'success' }))
        .catch(err => next(err))
    },
}

module.exports = chatroomController