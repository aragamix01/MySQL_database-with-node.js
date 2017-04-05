var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    expressValidator = require('express-validator');

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(
    connection(mysql,{
        host     : 'localhost',
        user     : 'team9',
        password : 'team9',
        database : 'dbteam9',
        debug    : false
    },'request')
);

app.get('/',function(req,res){
    res.redirect("http://192.168.99.100:3000/team9/employees");
});

var router = express.Router();

router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

var select_insert = router.route('/employees');

select_insert.get(function(req,res,next){


    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query('SELECT * FROM employees',function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.render('../employees',{title:"team9",data:rows});

         });

    });

});

select_insert.post(function(req,res,next){
	
    var data = {
        name:req.body.name,
        location:req.body.location
     };

    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("INSERT INTO employees set ? ",data, function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});

var del = router.route('/del/:id');

del.post(function(req,res,next){

    var id = req.params.id;

     req.getConnection(function (err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("DELETE FROM employees  WHERE id = ? ",id, function(err, rows){

             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }

             res.sendStatus(200);

        });

     });
});

var edit = router.route('/edit/:id');

edit.get(function(req,res,next){

    var id = req.params.id;

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT * FROM employees WHERE id = ? ",[id],function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            //if user not found
            if(rows.length < 1)
                return res.send("User Not found");

            res.render('../edit_employees',{title:"Edit employees",data:rows});
        });

    });

});

var edit_2 = router.route('/edit2');

edit_2.post(function(req,res,next){
	
	var id = req.body.id;
	
    var data = {
        name:req.body.name,
        location:req.body.location
     };
	
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("UPDATE employees set ? WHERE id = ? ",[data,id], function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});

app.use('/team9', router);

var server = app.listen(3000,function(){

   console.log("Listening to port %s",server.address().port);

});