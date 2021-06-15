// 搭建网站服务器，实现客户端与服务端的通信
// 连接数据库，创建用户集合，向集合中插入文档
// 当用户访问 /list 将所有用户信息查询出来
// 当用户访问 /add 呈现表单页面，并实现添加用户功能
// 当用户访问 /modify，呈现新修改页面，并实现修改用户信息功能
// 当用户访问 /delete时，实现用户删除功能

const http = require('http')
const url = require('url')
const mongoose = require('mongoose')
const qs = require('querystring')

mongoose.connect('mongodb://localhost/palyground', { useNewUrlParser: true,  useUnifiedTopology: true})
.then(() => {console.log('数据库连接成功');})
.catch(err => {console.log(err,'数据库连接失败');})

// 创建集合
const User = mongoose.model('User', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    age: {
        type: Number,
        min: 18,
        max: 80
    },
    password: String,
    email: String,
    hobbies: [String]
}))


// 创建服务器
const app = http.createServer();
let id;

// 为服务器对象添加请求事件
app.on('request',async (req, res) => {

    // 请求方式
    const method = req.method;
    // 请求地址
    const { pathname, query } = url.parse(req.url, true)

    if(method === 'GET') {
        // 呈现用户列表页面
        if(pathname === '/list') {
            // 删除功能
            if(query.name) {
                await User.findOneAndDelete({name: query.name})
                res.writeHead(301, {
                    location: '/list'
                })
                res.end()
                return
            }

            const users = await User.find()
            const newUsers = users.map(item => {
                return (
                `<tr>
                    <td>${item.name}</td>
                    <td>${item.age}</td>
                    <td>${item.hobbies}</td>
                    <td>${item.email}</td>
                    <td>
                        <a href="/list?name=${item.name}"  btn-sm class="btn btn-danger" id="deleBtn">删除</a>
                        <a href="/modify?id=${item._id}" btn-sm class="btn btn-success">修改</a>
                    </td>
                </tr>`
                )
            })
            let list = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
                <title>Document</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }
                    body,
                    html {
                        margin: 0;
                        height: 100%;
                        width: 100%;
                    }
                    .box {
                        height: 100%;
                        width: 80%;
                        margin: 0 auto;
                    }
                    .addUser {
                        padding: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="box">   
                    <div class="addUser"><button type="button" class="btn btn-primary">添加用户</button></div>
                    <div>
                        <table class="table table-bordered table-hover">
                           <thead>
                               <th>用户名</th>
                               <th>年龄</th>
                               <th>爱好</th>
                               <th>邮箱</th>
                               <th>操作</th>
                           </thead>
                           ${newUsers.map((item,index) => item).join('')}
                        </table>
                    </div>
                </div>
            </body>
            <script>
                const addBtn = document.querySelector('.addUser')
                const deleBtn = document.querySelector('#deleBtn')
                addBtn.addEventListener('click', () => {
                    window.location.href = "http://localhost:3000/add"
                })
                // deleBtn.addEventListener('click', () => {
                //     submit()
                // })
            </script>
            </html>`
                
            res.end(list)
        }else if(pathname == '/add') {
            let list = `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
         * {
            box-sizing: border-box;
        }
        body,
        html {
            margin: 0;
            height: 100%;
            width: 100%;
        }
        .box {
            height: 100%;
            width: 60%;
            margin: 0 auto;
        }
        .item {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
        }
        .item input {
            width: 80%;
            line-height: 30px;
            margin-top: 5px;
            padding: 0 10px;
        }
        .hobbies div{
            display: inline-block;
        }
        .addBtn {
            margin-top: 20px;
        }
        .addBtn button {
            width: 100px;
            height: 30px;
            background-color:lightskyblue;
            border: none;
            color: #fff;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="box">
        <form action="/add" method="POST">
            <h1>添加用户</h1>
            <div class="item">
                <span>用户名</span>
                <input type="text" placeholder="请输入用户名" name="name">
            </div>
            <div class="item">
                <span>密码</span>
                <input type="password" placeholder="请输入密码" name="password">
            </div>
            <div class="item">
                <span>年龄</span>
                <input type="text" placeholder="请输入年龄" name="age">
            </div>
            <div class="item">
                <span>邮箱</span>
                <input type="text" placeholder="请输入邮箱" name="email">
            </div>
            <div class="hobbies">
                <span style="display: block;">请选择爱好</span>
                <div>
                    <input type="checkbox" value="游泳" name="hobbies">
                    <span>游泳</span>
                </div>
                <div>
                    <input type="checkbox" value="抽烟" name="hobbies">
                    <span>抽烟</span>
                </div>
                <div>
                    <input type="checkbox" value="喝酒" name="hobbies">
                    <span>喝酒</span>
                </div>
                <div>
                    <input type="checkbox" value="烫头" name="hobbies">
                    <span>烫头</span>
                </div>
                <div>
                    <input type="checkbox" value="游戏" name="hobbies">
                    <span>游戏</span>
                </div>
                <div>
                    <input type="checkbox" value="篮球" name="hobbies">
                    <span>篮球</span>
                </div>
                <div>
                    <input type="checkbox" value="逛街" name="hobbies">
                    <span>逛街</span>
                </div>
                <div>
                    <input type="checkbox" value="购物" name="hobbies">
                    <span>购物</span>
                </div>
                <div>
                    <input type="checkbox" value="打牌" name="hobbies">
                    <span>打牌</span>
                </div>
            </div>
            <div class="addBtn">
                <button type="submit" id="addUser">添加用户</button>
            </div>
        </form>
    </div>
</body>
</html>
            `
            res.end(list)
        }else if(pathname == '/modify') {
            const reslut  = await User.findOne({_id: query.id})
            id = query.id
            let list = `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
         * {
            box-sizing: border-box;
        }
        body,
        html {
            margin: 0;
            height: 100%;
            width: 100%;
        }
        .box {
            height: 100%;
            width: 60%;
            margin: 0 auto;
        }
        .item {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
        }
        .item input {
            width: 80%;
            line-height: 30px;
            margin-top: 5px;
            padding: 0 10px;
        }
        .hobbies div{
            display: inline-block;
        }
        .addBtn {
            margin-top: 20px;
        }
        .addBtn button {
            width: 100px;
            height: 30px;
            background-color:lightskyblue;
            border: none;
            color: #fff;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="box">
        <form action="/modify" method="POST">
            <h1>修改用户</h1>
            <div class="item">
                <span>用户名</span>
                <input type="text" value="${reslut.name}" name="name">
            </div>
            <div class="item">
                <span>密码</span>
                <input type="password" value="${reslut.password}" name="password">
            </div>
            <div class="item">
                <span>年龄</span>
                <input type="text" value="${reslut.age}" name="age">
            </div>
            <div class="item">
                <span>邮箱</span>
                <input type="text" value="${reslut.email}" name="email">
            </div>
            <div class="hobbies">
                <span style="display: block;">请选择爱好</span>
                <div>
                    <input type="checkbox" value="打牌" name="hobbies">
                    <span>打牌</span>
                </div>
            `
            const hobbies = ['游泳', '抽烟', '喝酒', '烫头', '游戏', '篮球', '逛街', '购物', '打牌']
            hobbies.forEach(item => {
                const isChecked = reslut.hobbies.includes(item)
                if(isChecked) {
                    list += `<div>
                    <input type="checkbox" value="${item}" name="hobbies" checked>
                    <span>${item}</span>
                </div>`
                }else {
                    list += `<div>
                    <input type="checkbox" value="${item}" name="hobbies">
                    <span>${item}</span>
                </div>`
                }
            })
            list += `
            </div>
                        <div class="addBtn">
                            <button type="submit" id="addUser">修改用户</button>
                        </div>
                    </form>
                </div>
            </body>
            </html>`

            
           res.end(list)
        }
    }else if(method === 'POST') {
        if(pathname === '/add') {
            let formData = '';
            // 接受参数
            req.on('data',(param) => {
                formData += param
            }) 
            // 接收参数完毕
            req.on('end',async () => {
                // querysrting转换为对象
                let user = qs.parse(formData)
                await User.create(user)
                // 301 代表重定向代码， location表示跳转地址
                res.writeHead(301, {
                    location: '/list'
                })
                res.end()
            })
        }else if(pathname === '/modify') {
            let formData = ''
            req.on('data', param => {
                formData += param
            })

            req.on('end', async () => {
               const result =  qs.parse(formData)
               await User.updateOne({_id: id}, result)
                res.writeHead(301, {
                    location: '/list'
                })
                res.end()

            })
        }
    }
})

// 监听端口
app.listen(3000);