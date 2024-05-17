//express 모듈 셋팅
const express = require('express');
const router = express.Router();

const {body, param, validationResult} = require('express-validator');

const conn = require('../mariadb');

//jwt 모듈
const jwt = require('jsonwebtoken');

//dotenv 모듈
const dotenv = require('dotenv');

dotenv.config();

router.use(express.json()); //http 외의 모듈 'json'

const validate = (req, res, next) => { //모듈
    const err = validationResult(req)

    if(err.isEmpty())
    {
        return next() //다음 할 일 (미들웨어, 함수)
    }
    else {
        return res.status(400).json(err.array())
    }
};

//로그인
router.post(
    '/login', 
    [
        body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
        body('pwd').notEmpty().isString().withMessage('비밀번호 필요'),
        validate
    ],
    function(req, res){
        //email이 디비에 저장된 회원인지 확인
        //pwd도 맞는지 비교
        const {email, pwd} = req.body

        let sql = `SELECT * FROM users WHERE email = ?`
        conn.query(sql, email,
            function(err, results){ //순서에 따라서 데이터가 들어감. fields는 안쓰니까 빼줘도 됨.
                if(err)
                {
                    return res.status(400).json(err)
                }
                    
                var loginUser = results[0] //우선 loginUser에 저장
                if(loginUser && loginUser.pwd == pwd) //loginUser가 존재하고, loginUser의 비번이랑 입력받은 비번이 동일할 때
                {
                    //token 발급
                    const token = jwt.sign({
                        email: loginUser.email,
                        name: loginUser.name
                    }, process.env.PRIVATE_KEY, {
                        expiresIn: '30m',
                        issuer: "malloc"
                    });

                    res.cookie("token", token, {
                        httpOnly: true
                    });

                    res.status(200).json({
                        message: `${loginUser.name}님 로그인 되었습니다.`
                    });
                }  
                else { //loginUser가 없거나 pwd가 다를 때
                    res.status(403).json({
                        message: "이메일 또는 비밀번호가 틀렸습니다." //loginUser가 없다 == email이 틀렸다. 
                    })
                }
            }
        )
    })

//회원가입
router.post(
    '/join', 
    [
        body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
        body('pwd').notEmpty().isString().withMessage('비밀번호 확인 필요'),
        body('name').notEmpty().isString().withMessage('이름 확인 필요'),
        body('contact').optional({ nullable: true }).isString().withMessage('문자열 입력 필요'),
        validate
    ],
    function(req, res){
        let {email, pwd, name, contact} = req.body

        if(contact){
            let sql = `INSERT INTO users (email, pwd, name, contact) VALUES (?, ?, ?, ?)`
            let values = [email, pwd, name, contact]
            conn.query(sql , values,
                function(err, results){
                    if(err)
                    {
                        return res.status(400).json(err)
                    }
                        
                    res.status(201).json(results)
                }
            )
        }
        else {
            let sql = `INSERT INTO users (email, pwd, name) VALUES (?, ?, ?)`
            let values = [email, pwd, name]
            conn.query(sql, values,
                function(err, results){
                    if(err)
                    {
                        return res.status(400).json(err)
                    }
                        
                    res.status(201).json(results)
                }
            )
        }
        // res.status(201).json({
        //     message: `${db.get(id).name}님, 가입되었습니다.`
        // })
    })

router.route('/users')
    .get(
        [
            body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
            validate
        ],
        function(req, res){ //회원 개별 조회
        let {email} = req.body

        let sql = `SELECT * FROM users WHERE email = ?`
        conn.query(sql, email,
            function(err, results){
                if(err)
                {
                    return res.status(400).json(err)
                }
                    

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
    })
    .delete(
        [
            body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
            validate
        ],
        function(req, res){ //회원 개별 탈퇴
        let {email} = req.body
    
        let sql = `DELETE FROM users WHERE email = ?`
        conn.query(sql, email,
            function(err, results){
                if(err)
                {
                    return res.status(400).json(err)
                }
                
                if(results.affectedRows)
                {
                    res.status(200).json(results)
                }
                else {
                    return res.status(400).json({
                        message: "회원을 찾을 수 없습니다."
                    })
                }
                
            }
        )
        // res.json({
        //     message: `${user.name}님, 다음에 또 뵙겠습니다.`
        // })
    })

module.exports = router
