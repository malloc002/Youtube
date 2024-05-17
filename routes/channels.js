const express = require('express');
const router = express.Router();
const conn = require('../mariadb');
const {body, param, validationResult} = require('express-validator');

router.use(express.json());

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

router
    .route('/')
    .get([ //채널 전체 조회
        body('userId').notEmpty().isInt().withMessage('숫자 입력 필요'), 
        validate
    ],
        function(req, res){ 

            const err = validationResult(req)

            if(!err.isEmpty())
            {
                return res.status(400).json(err.array())
            }

            //json array로 보낼 예정
            var {userId} = req.body
            userId = parseInt(userId)

            // 예외처리 2가지
            // 1. userId가 body에 없으면
            // 2. userId가 가진 channel이 없으면

            let sql = 'SELECT * FROM channels WHERE user_id = ?'
            conn.query(sql, userId,
                function(err, results)
                {
                    if(err)
                    {
                        return res.status(400).json(err)
                    }

                    if(results.length)
                    {
                        res.status(200).json(results)
                    }
                    else {
                        notFoundChannel(res)
                    }
                }
            )
        })
    .post( //채널 생성
        [
            body('userId').notEmpty().isInt().withMessage('숫자 입력하자!'), //body라는 메소드 호출
            body('name').notEmpty().isString().withMessage('문자열 입력하자!'),
            validate
        ], 
        function(req, res){ 

            const {name, userId} = req.body
            
            let sql = 'INSERT INTO channels (name, user_id) VALUES (?, ?)'
            let values = [name, userId]
            conn.query(sql, values,
                function(err, results)
                {
                    if(err)
                    {
                        return res.status(400).json(err)
                    }

                    res.status(201).json(results)
                }
            )
    
            // res.status(201).json({
            //     message: `${db.get(idx - 1).channelTitle}님 채널을 응원합니다.`
            // })
    })


     
router
    .route('/:id')
    .get([ //채널 개별 조회
        param('id').notEmpty().withMessage('채널 id 필요'),
        validate
        ], 
        function(req, res){ 

            let {id} = req.params
            id = parseInt(id)

            let sql = 'SELECT * FROM channels WHERE id = ?'
            conn.query(sql, id,
                function(err, results, fields)
                {
                    if(err)
                    {
                        return res.status(400).json(err)
                    }

                    if(results.length)
                    {
                        res.status(200).json(results)
                    }
                    else{
                        notFoundChannel(res)
                    }
                }
            )
        
    })
    .put([ //채널 개별 수정
        param('id').notEmpty().withMessage('채널 id 필요'),
        body('name').notEmpty().isString().withMessage('문자 입력 필요'),
        validate
        ],
        function(req, res){ 

            let {id} = req.params
            id = parseInt(id)
            let {name} = req.body

            let sql = `UPDATE channels SET name = ? WHERE id = ?`
            let values = [name, id]
            conn.query(sql, values,
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
                        res.status(400).json({
                            message: "존재하지 않는 채널입니다."
                        })
                    }
                }
            )
    })
    .delete([ //채널 개별 삭제
        param('id').notEmpty().withMessage('채널 id 필요'),
        validate
    ],
        function(req, res){ 

            let {id} = req.params
            idx = parseInt(id)

            let sql = 'DELETE FROM channels WHERE id = ?'
            conn.query(sql, id,
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
                            res.status(400).json({
                                message: "존재하지 않는 채널입니다."
                            })
                        }
                }
            )
    })

function notFoundChannel(res){
    res.status(404).json({
        message: "채널 정보를 찾을 수 없습니다."
    })
}


module.exports = router
