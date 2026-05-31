import TelegramBot from "node-telegram-bot-api";
import "dotenv/config"
import { addUser ,addRepo,addWatch,removeWatch,
getWatchedById,removeAllWatches
} from "./db.js";

import {useRegex,getRepoName,getLatestVersion,verifyVersion} from "./utilities.js"

import cron from "node-cron"

const token=process.env.BOT_TOKEN

const bot=new TelegramBot(token,{polling:true})

let userState={};

bot.onText(/^\/start$/i,(msg)=>{
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
    bot.sendMessage(chatId,"Sorry internal server error!!")
    console.error(error.message)
}
})
bot.onText(/^\/watch$/i,(msg)=>{
const chatId=msg.chat.id
userState[chatId]="awaiting_watch_url"
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
    } catch (error) {
             bot.sendMessage(chatId,"Sorry internal server error!!")
    console.error(error.message)
    }
})

bot.onText(/^\/list$/i,(msg)=>{
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
// console.log(res) /* [{name:'Fret-Dz',last_tag:'??'},{name:'Telegram-bot',last_tag:null}] */
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
    bot.sendMessage(chatId,"Sorry internal server error!!")
    console.error(error.message)
}
})

bot.onText(/^\/remove$/i,(msg)=>{
const chatId=msg.chat.id
    try {
     bot.sendMessage(chatId,"select from below",{
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
    } catch (error) {
        bot.sendMessage(chatId,"Sorry internal server error!!1")
    console.error(error.message)
    }
})

bot.onText(/^\/back$/i,(msg)=>{
    const chatId=msg.chat.id
try {
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
    } catch (error) {
         bot.sendMessage(chatId,"Sorry internal server error!!")
    console.error(error.message)
    }
})
bot.onText(/^\/remove_all$/i,(msg)=>{
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
    bot.sendMessage(chatId,"Sorry internal server error!!")
    console.error(error.message)
}
})
bot.onText(/^\/remove_by_url$/i,(msg)=>{
const chatId=msg.chat.id
userState[chatId]="awaiting_remove_url"
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
} catch (error) {
bot.sendMessage(chatId,"Sorry internal server error!!")
    console.error(error.message)
}
})

bot.on("message",async (msg)=>{
    const chatId=msg.chat.id
try {
 if(!msg.text) return
const state=userState[chatId]
if(state==="awaiting_watch_url"){
if(useRegex(msg.text)===false && msg.text.startsWith("/")===false){
    await bot.sendMessage(chatId,`incompatible repo link format try again`)
}
else{
    if(msg.text.startsWith("/")===false){
            let last_tag=await getLatestVersion(msg.text)
            let last_checked=Math.floor(new Date()/1000)
            addRepo(msg.text,getRepoName(msg.text),last_tag,last_checked)
            addWatch(chatId,msg.text)
          await  bot.sendMessage(chatId,"done! i am watching this repo")
            delete userState[chatId]
        }
}
}
if(state==="awaiting_remove_url"){
if(useRegex(msg.text)===false && msg.text.startsWith("/")===false){
    await bot.sendMessage(chatId,`incompatible repo link format try again`)
}
else{
    if(msg.text.startsWith("/")===false){
            removeWatch(chatId,msg.text)
           await bot.sendMessage(chatId,"done! i removed that repo")
            delete userState[chatId]
        }
}
}       
} catch (error) {
      await  bot.sendMessage(chatId,"Sorry internal server error!!2")
    console.error(error.message)
    }
})

cron.schedule('* */6 * * *',()=>{
const res=verifyVersion()
if(res.length>0){
   for(let i=0;i<res.length;i++){
       const chatIds=res[i].users
       const name=res[i].name
       for(let j=0;j<chatIds.length;j++){
           bot.sendMessage(chatIds[j],`<b>${name} just dropped a new version!!!</b>`,{
            parse_mode:"HTML"
           })
        }
    }
}
})

console.log("the bot is running")