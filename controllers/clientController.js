const Item = require('../models/item');

const download_get = (req, res) => {
    if(req.user.type == 'admin') { res.redirect('/items') }
     Item.find({user: req.user.username}, (err, itemsData) => {
         itemsData.sort(function(a, b) {
             var keyA = new Date(a.updatedAt),
                 keyB = new Date(b.updatedAt);
             if (keyA < keyB) return 1;
             if (keyA > keyB) return -1;
             return 0;
         });
       if(err) {console.log(err);}
       else {
           res.render('downloads', {
               title: 'Downloads',
               nav: 'downloads',
               items: itemsData,
               username: req.user.username,
               usertype: req.user.type
           })
       }})
  };

  module.exports = {
    download_get
}