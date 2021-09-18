const User = require('../models/user');
const Item = require('../models/item');

const multer = require('multer');
// const path = require('path');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const https = require('https');
const agent = new https.Agent({
  keepAlive: true
})

AWS.config.update({
  httpOptions: {
    agent: agent,
    connectTimeout: 120000,
    timeout: 120000
  }
})

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
  });

const upload_get = (req, res) => {
    let clients = [];
    if(req.user.type !== 'admin') { res.redirect('/downloads') }
    User.find({}, (err, userData) => {
      if(err) {console.log(err);}
      else {
        for (let u = 0; u < userData.length; u++) {
          if (userData[u].type == 'client') { 
            clients.push(userData[u].username);
          }
        }
          res.render('upload', {
              title: 'upload',
              nav: 'upload',
              clients: clients,
              usertype: 'admin'
          })
      }
  })
  };

const upload_post =  async (req, res, next) => {
    let pathstr;  
    const upload = multer({
        limits: { 
            fileSize: 9000000000,
            fieldSize: 9000000000
          },
      storage: multerS3({
        s3: s3,
        bucket: 'pbsharing',
        acl: "public-read",
        Expires: 3600,
        metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname}); },
        key: function (req, file, cb) {
          cb(null, `${req.body.recipient}/${file.originalname}`); 
          pathstr = `${req.body.recipient}/${file.originalname}`;
        }
      }),
    });
  
    const uploadItem = upload.single('file');
    await uploadItem(req, res, (err) => {
      if (err) { console.log(err); }
      else { 
    //     next(); 
    //   }
    // });
    let expires;
    if (req.body.expires == 'on'){ expires = true;
    } else { expires = false }
  
    const newItem = new Item({
          name: req.body.itemName,
          description: req.body.description,
          user: req.body.recipient,
          expires: expires,
          path: pathstr
      });
  
      newItem.save((err) => {
        if(err) { console.error(err); 
        } else {
          res.redirect('/');
        }
    });
  }
});
  }

  const items_get = (req, res) => {
    if(req.user.type !== 'admin') { res.redirect('/downloads') }
    let clients = [];
    Item.find({}, (err, itemsData) => {
        itemsData.sort(function(a, b) {
            var keyA = new Date(a.updatedAt),
                keyB = new Date(b.updatedAt);
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
        });
      if(err) {console.log(err);}
      else {
        User.find({}, (err, userData) => {
            if(err) {console.log(err);}
            else {
              for (let u = 0; u < userData.length; u++) {
                if (userData[u].type == 'client') { 
                  clients.push(userData[u].username);
                }
              }
          res.render('items', {
              title: 'Items',
              nav: 'items',
              items: itemsData,
              clients: clients,
              usertype: 'admin'
          })
      }})
    }})
  };

  const change_recipient = (req, res) => {
    const newRecipient = req.body.recipient;
    Item.findOne({_id: req.body.itemid}, (err, theitem) => {
        theitem.user = newRecipient;
        theitem.save((err) => {
            if(err) { console.error(err); }
            else { res.redirect('/items'); }
        });
    })
  };

  const delete_item = (req, res) => {
    const itemid = req.body.itemid;
    Item.findOneAndDelete({_id: itemid}, (err)=> {
        if(err) { console.error(err); 
        } else {
            res.redirect('/items');
        }
    })
  }
  const delete_user = (req, res) => {
    const userid = req.body.userid;
    User.findOneAndDelete({_id: userid}, (err)=> {
        if(err) { console.error(err); 
        } else {
            res.redirect('/recipients');
        }
    })
  }

  const recipients_get = (req, res) => {
      let clients = [];
    if(req.user.type !== 'admin') { res.redirect('/downloads') }
    Item.find({}, (err, itemsData) => {
      if(err) {console.log(err);}
      else {
        User.find({}, (err, userData) => {
            for (let u = 0; u < userData.length; u++) {
                if (userData[u].type == 'client') { 
                  clients.push(userData[u]);
                }
              }
            if(err) {console.log(err);}
            else {
          res.render('recipients', {
              title: 'Recipients',
              nav: 'recipients',
              items: itemsData,
              users: clients,
              usertype: 'admin'
          })
      }})
    }})
  };

  const recipients_post = (req, res) => {
    User.register(({
      username : req.body.username,
      type: 'client'
  }), req.body.password, (err) => {
      if (err) {
          console.log('error while user register!', err);
          res.redirect('/recipients');
      } else {
          console.log(req.body.username + ' is registered');
          res.redirect('/');
      }
  });
  }

  module.exports = {
    upload_get,
    upload_post,
    items_get,
    change_recipient,
    delete_item,
    delete_user,
    recipients_get,
    recipients_post
}