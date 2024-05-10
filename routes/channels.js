const express = require('express')
const router = express.Router()

router.use(express.json())

let db = new Map()
var idx = 1


router
    .route('/')
    .get(function(req, res){ //채널 전체 조회
        //json array로 보낼 예정
        if(db.size) //db.size != 0
        {
            var {id} = req.body

            // 예외처리 2가지
            // 1. id가 body에 없으면
            // 2. id가 가진 channel이 없으면

            if(id) // 1번 예외 처리
            {
                var channels = [] //json array는 대괄호 json들을 묶어 줌 [{}, {}, {}]

                db.forEach(function(value){
                    if(value.id === id)
                        channels.push(value)
                })

                if(channels.length) // 2번 예외처리
                {
                    res.status(200).json(channels)
                }
                else{
                    notFoundChannel()
                }
            }
            else{
                res.status(404).json({
                    message: "로그인이 필요한 페이지입니다."
                })
            }
        }
        else{
            notFoundChannel()
        }
    }) 
    .post(function(req, res){ //채널 생성

        if(req.body.channelTitle)
        {
            let channel = req.body
            db.set(idx++, channel)

            res.status(201).json({
                message: `${db.get(idx - 1).channelTitle}님 채널을 응원합니다.`
            })
        }
        else {
            res.status(400).json({
                message: "요청 값을 제대로 보내주세요."
            })
        }
    })

     
router
    .route('/:idx')
    .get(function(req, res){ //채널 개별 조회
        let {idx} = req.params
        idx = parseInt(idx)

        var channel = db.get(idx)
        if(channel)
        {
            res.status(200).json(channel)
        }
        else {
            notFoundChannel()
        }
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

function notFoundChannel(){
    res.status(404).json({
        message: "채널 정보를 찾을 수 없습니다."
    })
}


module.exports = router
