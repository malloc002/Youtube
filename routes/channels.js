const express = require('express')
const router = express.Router()
const conn = require('../mariadb')

router.use(express.json())

let db = new Map()
var idx = 1


router
    .route('/')
    .get(function(req, res){ //채널 전체 조회
        //json array로 보낼 예정
        var {user_id} = req.body
        user_id = parseInt(user_id)

        // 예외처리 2가지
        // 1. user_id가 body에 없으면
        // 2. user_id가 가진 channel이 없으면

        if(user_id) // 1번 예외 처리
        {
            conn.query(
                'SELECT * FROM channels WHERE user_id = ?', user_id,
                function(err, results)
                {
                    if(results.length)
                    {
                        res.status(200).json(results)
                    }
                    else {
                        notFoundChannel(res)
                    }
                }
            )
        }
        else{
            res.status(404).json({
                message: "로그인이 필요한 페이지입니다."
            })
        }
    })
    .post(function(req, res){ //채널 생성

        const {name, userId} = req.body

        if(name && userId)
        {
            conn.query(
                'INSERT INTO channels (name, user_id) VALUES (?, ?)', [name, userId],
                function(err, results)
                {
                    res.status(201).json(results)
                }
            )

            // res.status(201).json({
            //     message: `${db.get(idx - 1).channelTitle}님 채널을 응원합니다.`
            // })
        }
        else {
            res.status(400).json({
                message: "요청 값을 제대로 보내주세요."
            })
        }
    })


     
router
    .route('/:id')
    .get(function(req, res){ //채널 개별 조회
        let {id} = req.params
        id = parseInt(id)

        conn.query(
            'SELECT * FROM channels WHERE id = ?', id,
            function(err, results, fields)
            {
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
    .put(function(req, res){ //채널 개별 수정
        let {idx} = req.params
        idx = parseInt(idx)

        var channel = db.get(idx)
        var oldTitle = channel.channelTitle
        if(channel)
        {
            var newTitle = req.body.channelTitle

            if(newTitle)
            {
                channel.channelTitle = newTitle
                db.set(idx, channel)
                res.status(200).json({
                    message: `채널명이 성공적으로 수정되었습니다. 기존: ${oldTitle} -> 현재: ${newTitle}`
                })   
            }
            else{
                res.status(400).json({
                    message: "요청 값을 제대로 보내주세요."
                })
            }
            
        }
        else {
            notFoundChannel()
        }
    })
    .delete(function(req, res){ //채널 개별 삭제
        let {idx} = req.params
        idx = parseInt(idx)

        var channel = db.get(idx)
        if(channel)
        {
            db.delete(idx)
            res.status(200).json({
                message: `${channel.channelTitle}이 정상적으로 삭제되었습니다.`
            })
        }
        else {
            notFoundChannel()
        }
    })

function notFoundChannel(res){
    res.status(404).json({
        message: "채널 정보를 찾을 수 없습니다."
    })
}


module.exports = router
