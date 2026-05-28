import TelegramBot from "node-telegram-bot-api";
import "dotenv/config"
import { addUser ,addRepo,addWatch,removeWatch,
getWatchedById,removeAllWatches
} from "./db.js";

import {useRegex,getRepoName} from "./utilities.js"

const token=process.env.BOT_TOKEN

const bot=new TelegramBot(token,{polling:true})

bot.onText(/\/start/,(msg)=>{
const chatId=msg.chat.id;
    try {
      addUser(chatId)
      bot.sendMessage(chatId,`this is a bot that monitors github repos for new releases and notify you the moment a new version drops without a github account being required.`)
      bot.sendMessage(chatId,'use the given commandes',{
          reply_markup:{
                        keyboard:[
                                   ["/watch"],
                                   ["/list"],
                                   ["/remove"],
                                  ],
                        resize_keyboard:true ,
                        one_time_keyboard:true,
                        }
})   
    } catch (error) {
                    bot.sendMessage(chatId,"Sorry,internal error occured")
                    console.log(error.code)
    }
})

bot.onText(/\/watch/,(msg)=>{
const chatId=msg.chat.id
    try {
    bot.sendMessage(chatId,"send me the repo url",{
       reply_markup:{
                    keyboard:[
                              ["/back"]
                             ],
                    resize_keyboard:true,
                    one_time_keyboard:true
                   }
}) 
bot.on('message',(msg)=>{
                        if(useRegex(msg.text)===false && msg.text !=="/back"
 && msg.text !=="/watch" && msg.text !=="/remove" && msg.text !=="/list" ){
                  bot.sendMessage(chatId,`incompatible repo link format try again`)
}
else{
    if(msg.text!=="/back" && msg.text !=="/watch" && msg.text !=="/remove"
        && msg.text !=="/list" ){
            let last_tag="??"
            let last_checked="??"
            addRepo(msg.text,getRepoName(msg.text),last_tag,last_checked)
            addWatch(chatId,msg.text)
            bot.sendMessage(chatId,"done! i am watching this repo")
        }
}
})
    } catch (error) {
            console.log(error.code)
            bot.sendMessage(chatId,"Sorry!,internal error occured")
    }
})

bot.onText(/\/list/,(msg)=>{
const chatId=msg.chat.id
try {
bot.sendMessage(chatId,"List of your watched repos:",{
       reply_markup:{
                    keyboard:[
                              ["/back"]
                             ],
                    resize_keyboard:true,
                    one_time_keyboard:true
                   }
})
const res=getWatchedById(chatId)
console.log(res) /* [{name:'Fret-Dz',last_tag:'??'},{name:'Telegram-bot',last_tag:null}] */
if (res.length!==0) {
 let str1=""
let str2=""
for(let repo of res){
    let repoName=repo.name 
    let repoTag=repo.last_tag
    str2=`<b>${repoName}: </b><i>${repoTag}</i>`
    str1=str1+"\n"+str2
}
bot.sendMessage(chatId,str1,{
    parse_mode:"HTML"
})    
} else {
    bot.sendMessage(chatId,"Currently,you have no watched repos!")
}

} catch (error) {
    console.log(error.code)
    bot.sendMessage("sorry,internal error occured")
}
})

bot.onText(/^\/remove$/i,(msg)=>{
try {
     const chatId=msg.chat.id
     bot.sendMessage(chatId,"select from below 1",{
         reply_markup:{
                      keyboard:[
        ["/remove_all"],
        ["/remove_by_url"],
        ["/back"],
                                ],
resize_keyboard:true ,
one_time_keyboard:true
        }
    })
bot.on('message',"send me the repo url:")   
    } catch (error) {
        
    }
})

bot.onText(/\/back/,(msg)=>{
const chatId=msg.chat.id
bot.sendMessage(chatId,"select from below 2",{
reply_markup:{
keyboard:[
        ["/watch"],
        ["/list"],
        ["/remove"],
    ],
resize_keyboard:true ,
one_time_keyboard:true
        }
    })
})
bot.onText(/\/remove_all/,(msg)=>{
const chatId=msg.chat.id
try {
    const res=getWatchedById(chatId)
    if(res.length!==0){
        removeAllWatches(chatId)
        bot.sendMessage(chatId,"All watched repos were deleted")
    }
    else{
        bot.sendMessage(chatId,"You have no watched repos!")
    }
} catch (error) {
    console.log(error.code)
    bot.sendMessage(chatId,"Sorry, internal server error happened")
}
})
bot.onText(/^\/remove_by_url$/i,(msg)=>{
const chatId=msg.chat.id
try {
bot.sendMessage(chatId,"send me the repo's url",{
    reply_markup:{
        keyboard:[
            ["/back"]
        ],
        resize_keyboard:true,
        one_time_keyboard:true
    }
})
bot.on('message',(msg)=>{
if(useRegex(msg.text===false) && msg.text !=="/back"){
 bot.sendMessage(chatId,"incompatible repo link format try again")
}
else{
       if(msg.text !=="/back"){
          removeWatch(chatId,msg.text)
          bot.sendMessage(chatId,"Repo was deleted")  
}
}
})
} catch (error) {
    
}
})
console.log("the bot is running")