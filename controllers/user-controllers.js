const bcrypt = require('bcryptjs')
const { User, Tweet, Reply, Like } = require('../models')

const userController = {
  signUp: async (req, res, next) => {
    const account = req.body?.account?.trim() || null
    const password = req.body?.password?.trim() || null
    const checkPassword = req.body?.checkPassword?.trim() || null
    const name = req.body?.name?.trim() || null
    const email = req.body?.email?.trim() || null
    if (!account || !password || !checkPassword || !name || !email) return res.json({ status: 'error', message: 'All fields are required' })
    if (name.length > 50) return res.json({ status: 'error', message: 'Name is too long ' })
    if (password !== checkPassword) return res.json({ status: 'error', message: 'Passwords do not match!' })

    try {
      const userEmail = await User.findOne({ where: { email } })
      const userAccount = await User.findOne({ where: { account } })
      if (userEmail) return res.json({ status: 'error', message: 'email already existed' })
      if (userAccount) return res.json({ status: 'error', message: 'account already existed' })
      return bcrypt.hash(req.body.password, 10)
        .then(hash =>
          User.create({
            name,
            account,
            email,
            password: hash,
            isAdmin: false
          }))
        .then(() => {
          {
            res.json({ status: 'success' })
          }
        })
    } catch (err) { next(err) }
  },

  getUser: async (req, res, next) => {
    try {
      const targetUser = await User.findByPk(req.params.id, {
        include: [
          { model: User, as: 'Followers' }
        ]
      })
      if (!targetUser) {
        return res.json({ status: 'error', message: "User didn't exist!" })
      }
      const { account, name, email, introduction, avatar, cover } = targetUser
      const isFollowing = targetUser.Followers.some(f => f.id === req.user.id)
      return res.json({
        account,
        name,
        email,
        introduction,
        avatar,
        cover,
        isFollowing
      })
    } catch (err) {
      next(err)
    }
  },
  getUserTweets: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id)
      if (!user) {
        return res.json({ status: 'error', message: "User didn't exist!" })
      }
      const tweets = await Tweet.findAll({
        where: { UserId: req.params.id },
        order: [['createdAt', 'DESC']],
        nest: true,
        raw: true
      })
      return res.json(tweets)
    } catch (err) {
      next(err)
    }
  },
  getTopUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        include: {
          model: User, as: 'Followers'
        }
      })
      const result = users
        .map(user => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          followerCount: user.Followers.length,
          isFollowing: req.user.Followings.some(f => f.id === user.id)
        }))
        .sort((a, b) => b.followerCount - a.followerCount)
        .slice(0, 10)

      return res.json(result)
    } catch (err) {
      next(err)
    }
  },
  userFollowings: async (req, res, next) => {
    try {
      const targetUser = await User.findByPk(req.params.id,
        {
          include: [{ model: User, as: 'Followings' }]
        })

      const userFollowings = targetUser.Followings.map(following => {
        return {
          followingId: following.id,
          account: following.name,
          description: following.description,
          avatar: following.avatar,
          createdAt: following.createdAt,
          isFollowing: req.user?.Followings ? req.user.Followings.some(f => f.id === following.id) : false
        }
      })
        .sort((a, b) => b.createdAt - a.createdAt)

      if (userFollowings.length === 0) {
        return res.json({ status: 'error', message: 'No followings!' })
      }
      return res.json(userFollowings)
    } catch (err) {
      next(err)
    }
  },
  userFollowers: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id,
        {
          include: [{ model: User, as: 'Followers' }]
        })
      const userFollowers = user.Followers.map(follower => {
        return {
          followerId: follower.id,
          account: follower.name,
          description: follower.description,
          avatar: follower.avatar,
          createdAt: follower.createdAt,
          isFollowing: req.user?.Followings ? req.user.Followings.some(f => f.id === follower.id) : false
        }
      })
        .sort((a, b) => b.createdAt - a.createdAt)

      if (userFollowers.length === 0) {
        return res.json({ status: 'error', message: 'No followers!' })
      }
      return res.json(userFollowers)
    } catch (err) {
      next(err)
    }
  },
  getReliedTweets: async (req, res, next) => {
    try {
      const replies = await Reply.findAll({
        where: { UserId: req.params.id },
        order: [['createdAt', 'DESC']],
        include: [{ model: Tweet, include: User }]
      })
      if (replies.length === 0) {
        return res.json({ status: 'error', message: 'No reliedTweets!' })
      }
      const result = replies.map(reply => {
        const repliedTweet = reply.Tweet
        return {
          comment: reply.comment,
          tweetId: repliedTweet.id,
          description: repliedTweet.description,
          createdAt: repliedTweet.createdAt,
          tweetUserId: repliedTweet.id,
          tweetUserName: repliedTweet.name,
          avatar: repliedTweet.avatar,
          liked: req.user?.LikedTweets ? req.user.LikedTweets.some(l => l.id === repliedTweet.id) : false
        }
      })
      return res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController
