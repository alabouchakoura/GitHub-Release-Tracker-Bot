import axios from "axios";
import { getAllWatchedRepos, updateRepo } from "./db.js";

export function useRegex(input){
    let regex = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i;
    return regex.test(input);
}

export function getRepoName(url){
const repoName = url.split("/").pop();
return repoName;
}

export function getOwnerName(url){
const splited=url.split("/")
return splited[3]
}

export async function getLatestVersion(repoUrl){
const repo=getRepoName(repoUrl)
const owner=getOwnerName(repoUrl)
const url=`https://api.github.com/repos/${owner}/${repo}/releases/latest`         
const res=await axios.get(url)
return res.data.tag_name
}


export function verifyVersion(){
const res=getAllWatchedRepos()
let ids=[]
for (let i=0;i<res.length;i++) {
const {name,url,chat_ids,last_tag}=res[i]
//let current_tag=getLatestVersion(url)
if(last_tag!==current_tag ){
updateRepo(name,url,current_tag)
ids.push({
name:name,
users:chat_ids.split(',').map(Number)
})
}
}
return ids /*[{name:'express',users:[111]},{name:'react',users:[111,222,333]},{name:'vue',users:[111,222]}]*/
}