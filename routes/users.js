//express 모듈 셋팅
const express = require('express')
const router = express.Router()

const conn = require('../mariadb')

connection.query(
    'SELECT * FROM `users`',
    function(err, results, fields){
        let {id, email, name, created_at} = results[0]

        console.log(id)
        console.log(email)
        console.log(name)
        console.log(created_at)
        // console.log(fields)
    }
)

router.use(express.json()) //http 외의 모듈 'json'

let db = new Map()
var idx = 1

//로그인Z
router.post('/login', function(req, res){
    //id가 디비에 저장된 회원인지 확인
    //pwd도 맞는지 비교
    let {id, pwd} = req.body

    var loginUser = {}

    db.forEach(function(user, idx){
        if(user.id === id)
        {
            loginUser = user
        }
    })

    if(isExist(loginUser)) //loginUser가 있으면 아이디가 db에 있는 것
    {
        if(loginUser.pwd === pwd)
        {
            res.status(200).json({
                message: `${loginUser.name}님 로그인 되었습니다.`
            })
        }
        else {
            res.status(400).json({
                message: "비밀번호가 틀렸습니다."
            })
        }
    }
    else { //Object.keys(loginUser).length == 0이라는 뜻 -> 아이디가 db에 없음
        res.status(404).json({
            message: "입력하신 아이디는 없는 아이디입니다."
        })
    }
})

function isExist(obj){
    if(Object.keys(obj).length)
    {
        return true
    }
    else {
        return false
    }
}

//회원가입
router.post('/join', function(req, res){
    let {id, pwd, name} = req.body

    console.log(req.body)

    if(id && pwd && name)
    {
        
        db.set(id, req.body)
        res.status(201).json({
            message: `${db.get(id).name}님, 가입되었습니다.`
        })
    }
    else {
        res.status(400).json({
            message: "필요한 정보 누락!"
        })
    }
})

router.route('/users')
    .get(function(req, res){
        let {id} = req.body
    
        const user = db.get(id)
        if(user)
        {
            res.status(200).json({
                id: user.id,
                name: user.name
            })
        }
        else {
            res.status(404).json({
                message: "회원 정보가 없습니다."
            })
        }
    })
    .delete(function(req, res){
        let {id} = req.body
    
        const user = db.get(id)
        if(user)
        {
            db.delete(id)
            res.json({
                message: `${user.name}님, 다음에 또 뵙겠습니다.`
            })
        }
        else {
            res.status(404).json({
                message: "회원 정보가 없습니다."
            })
        }
    })

module.exports = router

/*
//회원 개별 조회
app.get('/users/:idx', function(req, res){
    let {idx} = req.params
    idx = parseInt(idx)

    const user = db.get(idx)
    if(user)
    {
        res.status(200).json({
            id: user.id,
            name: user.name
        })
    }
    else {
        res.status(404).json({
            message: "회원 정보가 없습니다."
        })
    }
})

//회원 개별 탈퇴
app.delete('/users/:idx', function(req, res){
    let {idx} = req.params
    idx = parseInt(idx)

    const user = db.get(idx)
    if(user)
    {
        db.delete(idx)
        res.json({
            message: `${idx}번 삭제 완료. ${user.name}님, 다음에 또 뵙겠습니다.`
        })
    }
    else {
        res.status(404).json({
            message: "회원 정보가 없습니다."
        })
    }
})
*/