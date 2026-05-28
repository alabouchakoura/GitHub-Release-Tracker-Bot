export function useRegex(input){
    let regex = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i;
    return regex.test(input);
}

export function getRepoName(url){
const repoName = url.split("/").pop();
return repoName;
}
