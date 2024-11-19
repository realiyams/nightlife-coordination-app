// controllers/homeController.js

exports.renderHomePage = (req, res) => {
  res.render('layouts/layout', {
    title: 'Nightlife Coordination',
    body: '../pages/home',
    user: req.session.user || null,
  });
};
