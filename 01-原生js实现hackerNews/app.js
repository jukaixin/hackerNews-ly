

// 引入模块
const http=require('http');
const fs=require('fs');
const path=require('path');

const mime=require('mime');
const template=require('art-template');
const url=require('url');
const querystring=require('querystring');

// 1.创建服务器
const server=http.createServer();

// 2.处理请求
server.on('request',(req ,res)=>{
  res.setHeader('content-type','text/html;charset=utf-8');
  // 路由模块
  if(req.url.startsWith('/index') || req.url==='/'){//首页
    // 思路：读取数据库，结合模板引擎生成结构
    readData(data=>{
      let str=template(path.join(__dirname,'views','index.html'),data);
      res.end(str);
    })
    // res.end('首页');
  } else if(req.url.startsWith('/details')){//详情页
    // 思路：获取当前点击id对应的数据，结合模板引擎进行渲染
    let id=url.parse(req.url,true).query.id;
    readData(data=>{
      data=data.list.find(v=>v.id==id);
      let str=template(path.join(__dirname,'views','details.html'),data);
      res.end(str);
    })
    // res.end('详情页');
  } else if(req.url.startsWith('/submit')){//提交页
    // 思路：读取数据，结合模板引擎生成结构
    readData(data=>{
      let str=template(path.join(__dirname,'views','submit.html'),data);
      res.end(str);
    })
    // res.end('提交页');
  } else if(req.url.startsWith('/assets')){//静态资源
    // 思路：读取静态资源，设置mime类型
    fs.readFile(path.join(__dirname,req.url),(err ,data)=>{
      if(err){
        return console.log(err); 
      }
      // 设置mime类型
      res.setHeader('content-type',mime.getType(req.url));
      res.end(data);
    })
    // res.end('静态资源');
  } else if(req.url.startsWith('/add') && req.method=='GET'){//get请求方式
    // 货区表单信息，存入数据库，跳转页面
    let info=url.parse(req.url ,true);
    readData(data=>{
      info.id=data.list[data.list.length-1].id + 1;
      data.list.push(info);
      data=JSON.stringify(data);
      writeData(data,()=>{
        res.statusCode=302;
        res.setHeader('location','/index');
        res.end();
      })
    })
    // res.end('get请求方式');
  } else if(req.url.startsWith('/add') && req.method=='POST'){//post请求方式
     // 货区表单信息，存入数据库，跳转页面 
    //  post 请求文件较大，需要分成一块一块的进行异步组合执行
    let info='';
    req.on('data',chunk=>{
      info+=chunk;
    })
    req.on('end',()=>{
      // console.log(info);
      info=querystring.parse(info);
      readData(data=>{
        info.id=data.list[data.list.length-1].id + 1;
        data.list.push(info);
        data=JSON.stringify(data);
        writeData(data,()=>{
          res.statusCode=302;
          res.setHeader('location','/index');
          res.end();
        })
      })
      
    })
    // res.end('post请求方式');
  }
})
// 3设置端口监听
server.listen('9999',()=>{console.log('http://localhost:9999 服务器已启动')})



// 读取文件·
function readData (callback){
  fs.readFile(path.join(__dirname,'data','data.json'),(err,data)=>{
    if(err){
      return console.log(err);
    }
    data=JSON.parse(data);
    callback && callback(data);
  })
}

// 写入文件
function writeData(data,callback){
  fs.writeFile(path.join(__dirname,'data','data.json'),data,err=>{
    if(err){
      return console.log(err);
      
    }
    callback && callback();
  })
}