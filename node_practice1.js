var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var templateObject={
  makeHtml:function(){
  },
  makeHtmlList:function(){

  },

};


function templateHTML(title, list ,body, control)
{
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}
function templateList(filelist)
{
  var list = '<ul>';
  var i=0;
  while(i<filelist.length){
  list = list + `<li><a href ="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
  i=i+1;
  }
  list =list + '<ul>';
  return list;
}


var app = http.createServer(function (req, res) 
{
  var _url = req.url;
  var queryData = url.parse(_url,true).query;
  var pathname = url.parse(_url,true).pathname;

  if(pathname ==='/')
  {
    if(queryData.id == undefined)
    {//querystring id==undefined
      fs.readdir('./data' , function(err,filelist)
      {
        res.writeHead(200);
        var title ='Welcome';
        var description = 'Hello, Node.js';
        var list = templateList(filelist);
        var template = templateHTML(title, list ,`<h2>${title}</h2>
        <p>${description}</p>`,'<a href="/create">create</a>');
        res.end(template);

      })

    }
    else
    {//querystring id exists
      fs.readdir('./data' , function(err,filelist){
          res.writeHead(200);
          /*
          var list =  `<ul>
          <li><a href="/?id=html">HTML</a></li>
          <li><a href="/?id=css">CSS</a></li>
          <li><a href="/?id=javascript">JavaScript</a></li>
          </ul>`;
          */

        
        fs.readFile( `data/${queryData.id}` ,'utf8',function(err,description){
          var title = queryData.id;
          var list = templateList(filelist);
          var template = templateHTML(title, list 
          ,`<h2>${title}</h2><p>${description}</p>`
          ,`<a href="/create">create</a><a href="/update?id=${title}">update</a>
          <form action="/delete_process" method="post" onsubmit="${title}을(를) 제거하시겠습니까?">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value="delete">
          </form>
          `);
         
          res.end(template);
       });
      });
    }
  }
  else if(pathname === '/create')
  {
    fs.readdir('./data' , function(err,filelist){
      res.writeHead(200);
      var title ='Web_create';
      var list = templateList(filelist);
      var templatebody = `
      <form action="http://localhost:3000/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
      </form>   
      `
      var template = templateHTML(title, list ,templatebody,'');
      res.end(template);

    })

  }
  else if(pathname === '/create_process')
  {  
    var body ='';
    req.on('data',function(data){
      body += data;
    });
    req.on('end',function(){
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
    
      fs.writeFile(`data/${title}`,description,'utf8',function(err){
        res.writeHead(302,{Location: `/?id=${title}`});
        res.end('success');
      })
    });
  }
  else if(pathname === '/update'){
    fs.readdir('./data' , function(err,filelist){
      res.writeHead(200);
      fs.readFile( `data/${queryData.id}` ,'utf8',function(err,description){
        var title = queryData.id;
        var list = templateList(filelist);
        var template = templateHTML(title, list ,`<form action="http://localhost:3000/update_process" method="post">
        <p><input type="hidden" name="id" placeholder="title" value="${title}"></p>
        <p><input type="text" name="title" placeholder="New Title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>   
        `,``);
        res.end(template);
      });
    });

  }
  else if(pathname==='/update_process'){
    var body ='';
    req.on('data',function(data){
      body += data;
    });
    req.on('end',function(){
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`,`data/${title}`,function(err){
        fs.writeFile(`data/${title}`,description,'utf8',function(err){
          res.writeHead(302,{Location: `/?id=${title}`});
          res.end('success');
        })
      });
    
    });
  }
  else if(pathname ==='/delete_process'){
    var body ='';
    req.on('data',function(data){
      body += data;
    });
    req.on('end',function(){
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`,function(err){
        res.writeHead(302,{Location : '/'});
        res.end();
      });
    });
  }
  else
  {
    res.writeHead(404);
    res.end();
  }
 
 
  
});
app.listen(3000);