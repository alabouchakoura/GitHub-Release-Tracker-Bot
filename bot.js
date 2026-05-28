import TelegramBot from "node-telegram-bot-api";
import "dotenv/config"
import { addUser ,addRepo,addWatch,removeWatch,
getWatchedById,
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
                    console.log(error)
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
            console.log(error)
            bot.sendMessage(chatId,"Sorry!,internal error occured")
    }
})

bot.onText(/\/list/,(msg)=>{
const chatId=msg.chat.id
try {
bot.sendMessage(chatId,"List of your watched repos:")
const res=getWatchedById(chatId)
console.log(res) /* [{name:'Fret-Dz',last_tag:'??'},{name:'Telegram-bot',last_tag:null}] */
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
} catch (error) {
    console.log(error)
    bot.sendMessage("sorry,internal error occured")
}
})

bot.onText(/\/remove/,(msg)=>{

})

bot.onText(/\/back/,(msg)=>{
const chatId=msg.chat.id
bot.sendMessage(chatId,"select from below",{
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

console.log("the bot is running")