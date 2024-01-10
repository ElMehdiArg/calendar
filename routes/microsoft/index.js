// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <IndexRouterSnippet>
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  if(!req.session.userId){
    res.redirect('/user/login');
  }else{
    res.redirect('/accueil');
  }
});

router.get('/accueil', function(req, res) {
  let params = {
    active: { home: true }
  };

  res.render('index');
});

module.exports = router;
// </IndexRouterSnippet>
