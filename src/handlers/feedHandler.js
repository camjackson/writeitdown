'use strict';
const xml = require('xml');
const moment = require('moment');
const Post = require('../models').Post;

module.exports = {
  getFeed(_, res) {
    return Post.find({}).sort({posted: 'descending'}).exec().then((posts) => {
      const format = date => moment(date).format();
      const link = (rel, href) => ([
        { _attr: {rel: rel} },
        { _attr: {href: href} }
      ]);

      const me = [
        { name: 'Cam Jackson' },
        { uri: 'https://camjackson.net/' }
      ];

      const feed = [
        { _attr: { xmlns: 'http://www.w3.org/2005/Atom' } },
        { id: 'https://camjackson.net/' },
        { title: 'camjackson.net' },
        { updated: format(posts[0].posted) },
        { subtitle: 'A feed of blog posts from camjackson.net' },
        { author: me },
        { link: link('alternate', 'https://camjackson.net/')},
        { link: link('self', 'https://camjackson.net/atom.xml')},
        { icon: '/favicon.ico' },
        { logo: '/profile.jpg' }
      ];

      posts.forEach(post => {
        feed.push({
          entry: [
            { id: `https://camjackson.net/post/${post.slug}` },
            { title: {_cdata: post.title} },
            { updated: format(post.posted) },
            { published: format(post.posted) },
            { author: me },
            { content: {_cdata: post.text} },
            { link: link('alternate', `/post/${post.slug}`)},
            { summary: {_cdata: post.text.substr(0, post.text.indexOf('[//]: # (fold)'))} }
          ]
        });
      });

      res.set('Content-Type', 'application/atom+xml');
      res.send(xml({feed}, {indent: true, declaration: true}));
    });
  }
};
