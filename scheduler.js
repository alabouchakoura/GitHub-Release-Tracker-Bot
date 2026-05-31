bot.on(/\/fuck/,(msg)=>{
cron.schedule('* * * * * *', () => {
bot.sendMessage(msg.chat.id,"fuck")
console.log("message was sent")
})
});
console.log("scheduler is running")