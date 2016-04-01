# bcryptWarmup

## Setup
* Fork and clone this repo
```
$ cd bcryptWarmup
$ npm install
$ npm install --save pg knex@0.9.0 bcryptjs
$ knex init
$ createdb knex-auth
```

* Change your knexfile.js configuration:

```
module.exports = {

  development: {
    client: 'postgresql',
    connection: 'postgres://localhost/knex-auth',
    pool: {
      min: 2,
      max: 10
    }
  }

};
```

* Create a migration

```
$ knex migrate:make create_users
```

* Open up your newly created migration file and create this schema:

```
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments();
    table.string('username');
    table.string('password');
    table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
  })
};

exports.down = function(knex, Promise) {
 return knex.schema.dropTable('users');
};

```

* Now require knex and bcryptjs in your routes/index.js file:

```
//Add the two lines below in addition to lines 1 and 2 (requiring express and router)
var knex = require('knex')(require('../knexfile')['development']);
var bcrypt = require('bcryptjs');
```

* Let's create the register route functionality by hashing the password and then inserting the user into the database with a lowercase username (for easy comparison later) and inserting the hashed password instead of the original plain text password:

```
router.post('/user/register', function(req,res,next){

  var hash = bcrypt.hashSync(req.body.password, 8);
  knex('users')
  .insert({'username': req.body.username.toLowerCase(), 'password': hash})
  .then(function(response){
    res.redirect('/');
  })

});

```

* Now let's create the login route functionality by checking for a match in the database (using req.body.username) and by using bcrypt to compare the password with the hashed password in the database:

```
router.post('/user/login', function(req,res,next){
  knex('users')
  .where('username', '=', req.body.username.toLowerCase())
  .first()
  .then(function(response){
    if(response && bcrypt.compareSync(req.body.password, response.password)){
      res.redirect('/home');
    } else {
      res.render('auth', {error: 'Invalid username or password'});
    }
  });
});
```

#Stretch Goal

* Install cookie-session

```
$ npm install --save cookie-session
```

* Require cookie-session near the top of your app.js file

```
var cookieSession = require('cookie-session');
```

* Then insert this code into your app.js file right above app.use('/', routes);

```
app.use(cookieSession({
  name: 'session',
  keys: [
    'SESSION_KEY1',
    'SESSION_KEY2'
  ]
}))
```

* If you get that set up you can set a session cookie when you are inside of the login route:

```
router.post('/user/login', function(req,res,next){
  knex('users')
  .where('username', '=', req.body.username.toLowerCase())
  .first()
  .then(function(response){
    if(response && bcrypt.compareSync(req.body.password, response.password)){

      //Notice here we set req.session.user to the current user before redirecting
      req.session.user = response.username;

      res.redirect('/home');
    } else {
      res.render('auth', {error: 'Invalid username or password'});
    }
  });
});
```

* Once you get there, your next challenge will be to use middleware to protect the router.get('/home') route so that you cannot view that route unless there is an active session. (req.session.user must be defined) If a user tries to go to router.get('/home') without an active session, they should be redirected back to the router.get('/') route

* Also you can create logout functionality where you set req.session.user = null; and redirect back to ('/').
