//express 모듈 셋팅
const express = require('express')
const router = express.Router()

const conn = require('../mariadb')

router.use(express.json()) //http 외의 모듈 'json'

//로그인
router.post('/login', function(req, res){
    //email이 디비에 저장된 회원인지 확인
    //pwd도 맞는지 비교
    const {email, pwd} = req.body

    let sql = `SELECT * FROM user WHERE email = ?`
    conn.query(sql, email,
        function(err, results){ //순서에 따라서 데이터가 들어감. fields는 안쓰니까 빼줘도 됨.
            var loginUser = results[0] //우선 loginUser에 저장
            if(loginUser && loginUser.pwd == pwd) //loginUser가 존재하고, loginUser의 비번이랑 입력받은 비번이 동일할 때
            {
                res.status(200).json({
                    message: `${loginUser.name}님 로그인 되었습니다.`
                })
            }  
            else { //loginUser가 없거나 pwd가 다를 때
                res.status(404).json({
                    message: "이메일 또는 비밀번호가 틀렸습니다." //loginUser가 없다 == email이 틀렸다. 
                })
            }
        }
    )
})

//회원가입
router.post('/join', function(req, res){
    let {email, pwd, name, contact} = req.body

    if(email && pwd && name)
    {
        if(contact){
            let sql = `INSERT INTO users (email, pwd, name, contact) VALUES (?, ?, ?, ?)`
            let values = [email, pwd, name, contact]
            conn.query(sql , values,
                function(err, results){
                    res.status(201).json(results)
                }
            )
        }
        else {
            let sql = `INSERT INTO users (email, pwd, name) VALUES (?, ?, ?)`
            let values = [email, pwd, name]
            conn.query(sql, values,
                function(err, results){
                    res.status(201).json(results)
                }
            )
        }
        // res.status(201).json({
        //     message: `${db.get(id).name}님, 가입되었습니다.`
        // })
    }
    else {
        res.status(400).json({
            message: "필요한 정보 누락!"
        })
    }
})

router.route('/users')
    .get(function(req, res){ //회원 개별 조회
        let {email} = req.body

        if(email)
        {
            let sql = `SELECT * FROM users WHERE email = ?`
            conn.query(sql, email,
                function(err, results){
                    if(results.length)
                    {
                        res.status(200).json(results)
                    }
                    else {
                        res.status(404).json({
                            message: "회원 정보가 없습니다."
                        })
                    }
                }
            )
        }
        else {
            res.status(400).json({
                message: "필요한 정보 누락!"
            })
        }
    })
    .delete(function(req, res){ //회원 개별 탈퇴
        let {email} = req.body
    
        if(email)
        {
            let sql = `DELETE FROM users WHERE email = ?`
            conn.query(sql, email,
                function(err, results){
                    res.status(200).json(results)
                }
            )
            // res.json({
            //     message: `${user.name}님, 다음에 또 뵙겠습니다.`
            // })
        }
        else {
            res.status(404).json({
                message: "회원 정보가 없습니다."
            })
        }
    })

module.exports = router
